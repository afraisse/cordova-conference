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
    .controller('sessionDetailController', ['$sce', function ($sce) {

        var vm = this;

        var page = app.navi.getCurrentPage();
        vm.session = page.options.session;

        vm.showNotes = showNotes;
        vm.renderHTML = renderHTML;

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function showNotes(session) {
            app.navi.pushPage('modules/session/notes.html', {session: session});
        }

        function renderHTML(htmlCode) {
            return $sce.trustAsHtml(htmlCode);
        }

    }])
    .controller('sessionNoteController', ['NoteService', '$cordovaToast', '$cordovaCamera', '$cordovaCapture',
        function (NoteService, $cordovaToast, $cordovaCamera, $cordovaCapture) {

            var vm = this;
            var page = app.navi.getCurrentPage();

            vm.session = page.options.session;
            vm.notes = '';
            vm.imageURLs = [];
            vm.audioURLs = [];
            vm.videoURLs = [];

            //-------------------
            NoteService.openDB();
            //--------------------

            vm.saveNote = saveNote;
            vm.takePicture = takePicture;
            vm.choosePicture = choosePicture;
            vm.recordAudio = recordAudio;
            vm.recordVideo = recordVideo;

            loadNote();

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function saveNote() {
                NoteService.save(vm.session.id, vm.notes)
                    .then(function (res) {
                        $cordovaToast.showShortBottom("Saved");
                    });
            }

            function loadNote() {
                NoteService.getNote(vm.session.id).then(function (notes) {
                    vm.notes = notes;
                }, function () {
                    $cordovaToast.showShortBottom("Failed to retrieve notes");
                });

                NoteService.getPictures(vm.session.id).then(function (pictures) {
                    vm.imageURLs = pictures;
                }, function () {
                    $cordovaToast.showLongBottom("Failed to retrieve pictures");
                });

                NoteService.getAudios(vm.session.id).then(function (audios) {
                    vm.audioURLs = audios;
                }, function () {
                    $cordovaToast.showShortBottom("Failed to retrieve audio");
                });

                NoteService.getVideos(vm.session.id).then(function (videos) {
                    vm.videoURLs = videos;
                }, function () {
                    $cordovaToast.showShortBottom("Failed to retrieve video");
                });
            }


            function takePicture() {
                var options = {
                    quality: 50,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.CAMERA,
                    allowEdit: true,
                    encodingType: Camera.EncodingType.JPEG,
                    targetWidth: 200,
                    targetHeight: 200,
                    saveToPhotoAlbum: false,
                    correctOrientation: true
                };

                $cordovaCamera.getPicture(options).then(function (imageData) {
                    var imageURL = "data:image/jpeg;base64," + imageData;
                    NoteService.savePicture(vm.session.id, imageURL).then(function () {
                        vm.imageURLs.push(imageURL);
                        $cordovaToast.showShortBottom("Photo saved");
                    });
                }, function (err) {
                    console.error(err);
                    $cordovaToast.showShortBottom("Couldn't get picture");
                });
            }

            function recordAudio() {
                $cordovaCapture.captureAudio({limit: 3, duration: 5}).then(function (mediafiles) {
                    var fullPath;
                    mediafiles.forEach(function (audioData) {
                        fullPath = audioData.fullPath;
                        NoteService.saveAudio(vm.session.id, fullPath).then(function () {
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
                        NoteService.saveVideo(vm.session.id, fullPath).then(function () {
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

            function choosePicture() {
                var options = {
                    quality: 50,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                    allowEdit: true,
                    encodingType: Camera.EncodingType.JPEG,
                    targetWidth: 200,
                    targetHeight: 200,
                    saveToPhotoAlbum: false,
                    correctOrientation: true
                };

                $cordovaCamera.getPicture(options).then(function (imageData) {
                    var imageURL = "data:image/jpeg;base64," + imageData;
                    NoteService.savePicture(vm.session.id, imageURL).then(function () {
                        vm.imageURLs.push(imageURL);
                        $cordovaToast.showShortBottom("Photo saved");
                    });
                }, function (err) {
                    console.error(err);
                    $cordovaToast.showShortBottom("Couldn't pick photo");
                });
            }

        }]);

