angular.module('conf.session', [])
    .controller('sessionController', ['StorageService', function (StorageService) {

        var vm = this;
        vm.categories = [];
        vm.sessions = [];

        StorageService.getSessions()
            .then(function(data) {
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
    .controller('sessionNoteController', ['NoteService', '$cordovaToast', function (NoteService, $cordovaToast) {

        var vm = this;
        var page = app.navi.getCurrentPage();

        vm.session = page.options.session;
        vm.notes = '';

        vm.saveNote = saveNote;

        loadNote();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function saveNote() {
            NoteService.save(vm.session.id, vm.notes)
                .then(function(res) {
                    $cordovaToast.showShortBottom("Saved");
                });
        }

        function loadNote() {
            NoteService.get(vm.session.id)
                .then(function(res) {
                    vm.notes = res;
                });
        }

    }]);

