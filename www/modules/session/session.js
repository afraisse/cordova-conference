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
    .controller('sessionDetailController', function () {

        var vm = this;

        var page = app.navi.getCurrentPage();
        vm.session = page.options.session;

        vm.showNotes = showNotes;

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function showNotes(session) {
            app.navi.pushPage('modules/session/notes.html', {session: session});
        }
    })
    .controller('sessionNoteController', ['NoteService', '$cordovaToast', '$cordovaCamera', function (NoteService, $cordovaToast, $cordovaCamera) {

        var vm = this;
        var page = app.navi.getCurrentPage();
        NoteService.openDB();

        vm.session = page.options.session;
        vm.notes = '';
        vm.imageURLs = [];

        vm.saveNote = saveNote;
        vm.takePicture = takePicture;
        vm.choosePicture = choosePicture;

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
            });

            NoteService.getPictures(vm.session.id).then(function (pictures) {
                vm.imageURLs = pictures;
            });
        }


        function takePicture() {
            var options = {
                quality: 50,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 300,
                targetHeight: 200,
                saveToPhotoAlbum: false,
                correctOrientation: true
            };

            $cordovaCamera.getPicture(options).then(function (imageData) {
                var imageURL = "data:image/jpeg;base64," + imageData;
                NoteService.addPicture(vm.session.id, imageURL).then(function () {
                    vm.imageURLs.push(imageURL);
                    $cordovaToast.showShortBottom("Photo saved");
                });
            });
        }

        function choosePicture() {
            var options = {
                quality: 50,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 300,
                targetHeight: 200,
                saveToPhotoAlbum: false,
                correctOrientation: true
            };

            $cordovaCamera.getPicture(options).then(function (imageData) {
                var imageURL = "data:image/jpeg;base64," + imageData;
                NoteService.addPicture(vm.session.id, imageURL).then(function () {
                    vm.imageURLs.push(imageURL);
                    $cordovaToast.showShortBottom("Photo saved");
                });
            });
        }

    }]);

