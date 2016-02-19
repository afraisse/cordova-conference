angular.module('conf.session', [])
    .controller('sessionController', ['$scope', '$http', function ($scope, $http) {

        var vm = this;
        vm.sessions = [];
        vm.categories = [];

        $http.get('data/devfest-2015.json')
            .then(function (response) {
                vm.categories = response.data.categories;
                vm.sessions = response.data.sessions;
            }, function (response) {
                console.log(response);
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
    .controller('sessionNoteController', ['$cordovaSQLite', '$cordovaToast', function ($cordovaSQLite, $cordovaToast) {

        var vm = this;

        vm.save = save;

        var page = app.navi.getCurrentPage();
        vm.session = page.options.session;

        var db = $cordovaSQLite.openDB({name: "conferences"});
        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS notes(sessionId text primary key, comment text)")

        vm.notes = '';
        console.log(vm.notes);

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function save() {
            $cordovaSQLite.execute(db, "INSERT OR REPLACE INTO notes(sessionId, comment) VALUES (?, ?)", [vm.session.id, vm.notes])
                .then(function (res) {
                    console.log("saved")
                }, function (err) {
                    console.log("save error: "+ error);
                });
        }

        function get() {
            $cordovaSQLite.execute(db, "SELECT comment FROM notes WHERE sessionId = ?", [vm.session.id])
                .then(function (res) {
                    if (res.rows.length > 0)
                        vm.notes = res.rows.item(0).comment;
                    else
                        console.log("notes not found");
                }, function (err) {
                    console.log(err);
                    return '';
                }).the
        }

    }]);

