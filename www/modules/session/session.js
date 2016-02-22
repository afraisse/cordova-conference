angular.module('conf.session', [])
    .controller('sessionController', ['StorageService', function (StorageService) {

        var vm = this;
        vm.categories = [];
        vm.sessions = [];

        StorageService.getSessions()
            .then(function (data) {
                vm.categories = data.categories;
                vm.sessions = data.sessions;
            });

        vm.getSessions = function (category) {
            return vm.sessions.filter(function (session) {
                return session.type == category;
            });
        }

        vm.showDetail = function (session) {
            app.navi.pushPage('modules/session/detail.html', {session: session});
        }
    }])
    .controller('sessionDetailController', ['$sce', 'SessionService', '$cordovaToast', function ($sce, SessionService, $cordovaToast) {

        var vm = this;

        var page = app.navi.getCurrentPage();
        vm.session = page.options.session;

        vm.showNotes = showNotes;
        vm.renderHTML = renderHTML;
        vm.setStars = setStars;

        getStars();
        
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function showNotes(session) {
            app.navi.pushPage('modules/session/notes.html', {session: session});
        }

        function renderHTML(htmlCode) {
            return $sce.trustAsHtml(htmlCode);
        }
        
        function setStars(stars) {
            SessionService.saveFeedback(vm.session.id, stars).then(function (res) {
                $cordovaToast.showShortBottom("Feedback saved");
            }, function (err) {
                $cordovaToast.showShortBottom("Unable to save feedback");
            });
        }

        function getStars() {
            SessionService.getFeedback(vm.session.id).then(function (res) {
               if (res) vm.session.feedback = res;
            });
        }

    }])
    .controller('sessionNoteController', ['SessionService', '$cordovaToast', '$cordovaCamera', '$cordovaCapture', '$cordovaActionSheet', '$cordovaSocialSharing',
        function (SessionService, $cordovaToast, $cordovaCamera, $cordovaCapture, $cordovaActionSheet, $cordovaSocialSharing) {

            var vm = this;
            var page = app.navi.getCurrentPage();

            var cameraOpts = {
                quality: 50,
                destinationType: Camera.DestinationType.FILE_URI,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 200,
                targetHeight: 200,
                saveToPhotoAlbum: false,
                correctOrientation: true
            };

            var actionOpts = {
                title: "Que faire avec l'image?",
                buttonLabels: ['Partager'],
                addCancelButtonWithLabel: 'Annuler',
                androidEnableCancelButton : true,
                addDestructiveButtonWithLabel : 'Supprimer'
            };

            vm.session = page.options.session;
            vm.notes = '';
            vm.imageURLs = [];
            vm.audioURLs = [];
            vm.videoURLs = [];

            //-------------------
            //SessionService.openDB();
            //--------------------

            vm.saveNote = saveNote;
            vm.takePicture = takePicture;
            vm.choosePicture = choosePicture;
            vm.recordAudio = recordAudio;
            vm.recordVideo = recordVideo;
            vm.onTapPicture = onTapPicture;

            loadNote();

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function saveNote() {
                SessionService.save(vm.session.id, vm.notes)
                    .then(function (res) {
                        $cordovaToast.showShortBottom("Note saved");
                    });
            }

            function loadNote() {
                SessionService.getNote(vm.session.id).then(function (notes) {
                    vm.notes = notes;
                }, function () {
                    $cordovaToast.showShortBottom("Failed to retrieve notes");
                });

                SessionService.getPictures(vm.session.id).then(function (pictures) {
                    vm.imageURLs = pictures;
                }, function () {
                    $cordovaToast.showLongBottom("Failed to retrieve pictures");
                });

                SessionService.getAudios(vm.session.id).then(function (audios) {
                    vm.audioURLs = audios;
                }, function () {
                    $cordovaToast.showShortBottom("Failed to retrieve audio");
                });

                SessionService.getVideos(vm.session.id).then(function (videos) {
                    vm.videoURLs = videos;
                }, function () {
                    $cordovaToast.showShortBottom("Failed to retrieve video");
                });
            }

            function takePicture() {
                var options = cameraOpts;
                options.sourceType = Camera.PictureSourceType.CAMERA;
                getPicture(options);
            }

            function choosePicture() {
                var options = cameraOpts;
                options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
                getPicture(options);
            }

            function getPicture(options) {
                $cordovaCamera.getPicture(options).then(function (imageData) {
                    SessionService.savePicture(vm.session.id, imageData).then(function () {
                        vm.imageURLs.push(imageData);
                        $cordovaToast.showShortBottom("Photo saved");
                    });
                }, function (err) {
                    console.error(err);
                    $cordovaToast.showShortBottom("Couldn't get photo");
                });
            }

            function recordAudio() {
                $cordovaCapture.captureAudio({limit: 3, duration: 5}).then(function (mediafiles) {
                    var fullPath;
                    mediafiles.forEach(function (audioData) {
                        fullPath = audioData.fullPath;
                        SessionService.saveAudio(vm.session.id, fullPath).then(function () {
                            vm.audioURLs.push(fullPath);
                            $cordovaToast.showShortBottom("Audio record saved");
                        }, function () {
                            $cordovaToast.showShortBottom("Audio recording failed");
                        });
                    });
                }, function (err) {
                    console.error(err);
                    $cordovaToast.showShortBottom("Couldn't record audio");
                });
            }

            function recordVideo() {
                $cordovaCapture.captureVideo({limit:3, duration: 5}).then(function (mediaFiles) {
                    var fullPath;
                    mediaFiles.forEach(function (audioData) {
                       fullPath = audioData.fullPath;
                        SessionService.saveVideo(vm.session.id, fullPath).then(function () {
                            vm.videoURLs.push(fullPath);
                            $cordovaToast.showShortBottom("Video record saved");
                        }, function () {
                           $cordovaToast.showShortBottom("Video recording failed");
                        });
                    });
                }, function (err) {
                    console.error(err);
                    $cordovaToast.showShortBottom("Couldn't record video");
                });
            }

            function onTapPicture(url) {
                $cordovaActionSheet.show(actionOpts).then(function (btnIndex) {
                    switch (btnIndex) {
                        case 1 :
                            deleteImage(url);
                            break;
                        case 2 :
                            shareNote(url);
                            break;
                        case 3 :
                            break;
                        default :
                            console.error("Invalid index : "+ btnIndex);
                            $cordovaToast.showShortBottom("Please retry");
                    }
                });
            }

            function deleteImage(url) {
                SessionService.deletePicture(url).then(function () {
                    var index = vm.imageURLs.indexOf(url);
                    vm.imageURLs.splice(index, 1);
                    $cordovaToast.showShortBottom("Image deleted");
                }, function () {
                    $cordovaToast.showShortBottom("Couldn't delete image");
                });
            }

            function shareNote(url) {
                $cordovaSocialSharing.share(vm.notes, vm.session.title, url, null).then(function (res) {
                    $cordovaToast.showShortBottom("Shared");
                }, function (err) {
                    console.error(err);
                    $cordovaToast.showShortBottom("Couldn't share note");
                });
            }

        }]);

