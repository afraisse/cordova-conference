angular.module('conf.shared', [])
    .controller('menuController', function () {

        var changePage = function (pageLocation) {
            console.log('changing location ', pageLocation);
            app.menu.setMainPage(pageLocation, {closeMenu: true});
        }


        this.goToSessions = function () {
            changePage('modules/session/sessions.html');
        }
        this.goToSpeakers = function () {
            changePage('modules/speaker/speakers.html');
        }
        this.goToHome = function () {
            app.menu.setMainPage('modules/home/home.html', {closeMenu: true});
        }
        this.goToTechniques = function () {
            changePage('modules/technique/techniques.html');
        }
        this.goToAbout = function () {
            changePage('modules/about/about.html');
        }

    })
    .service("NoteService", ['$cordovaSQLite', function ($cordovaSQLite) {

        var vm = this;
        var db = $cordovaSQLite.openDB({name: "conferences"});

        vm.openDB = initializeDB;
        vm.save = save;
        vm.getNote = getNote;
        vm.getPictures = getPictures;
        vm.getAudios = getAudios;
        vm.getVideos = getVideos;
        vm.savePicture = savePicture;
        vm.saveAudio = saveAudio;
        vm.saveVideo = saveVideo;
        vm.deletePicture = deletePicture;

        function initializeDB() {
            $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS notes(sessionId text primary key, comment text)");
            $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS media(id integer primary key autoincrement, data text, type text, sessionId text)");
        }

        function save(sessionId, comment) {
            return $cordovaSQLite.execute(db, "INSERT OR REPLACE INTO notes(sessionId, comment) VALUES (?, ?)", [sessionId, comment])
                .then(function (res) {
                    console.log("saved")
                }, function (err) {
                    console.error(err);
                });
        }

        function getNote(sessionId) {
            return $cordovaSQLite.execute(db, "SELECT comment FROM notes WHERE sessionId = ?", [sessionId])
                .then(function (res) {
                    if (res.rows.length > 0)
                        return res.rows.item(0).comment;
                    else return '';
                }, function (err) {
                    console.error(err);
                })
        }

        function getMedia(sessionId, mediaType) {
            return $cordovaSQLite.execute(db, "SELECT data FROM media where sessionId = ? and type = ?", [sessionId, mediaType])
                .then(function (res) {
                    var urls = [];
                    for (var i = 0; i < res.rows.length; i++) {
                        var data = res.rows.item(i).data;
                        if (data) urls.push(data);
                    }
                    return urls;
                }, function (err) {
                    console.error(err);
                });
        }

        function saveMedia(sessionId, mediaType, data) {
            return $cordovaSQLite.execute(db, "INSERT INTO media(data, type, sessionId) VALUES (?, ?, ?)", [data, mediaType, sessionId])
                .then(function (res) {
                    console.log("media saved");
                }, function (err) {
                    console.error(err);
                })
        }

        function deleteMediaByData(mediaType, data) {
            return $cordovaSQLite.execute(db, "DELETE FROM media WHERE type = ? and data = ?", [mediaType, data])
                .then(function (res) {
                    console.log("media deleted");
                }, function (err) {
                    console.err(err);
                });
        }

        function getPictures(sessionId) {
            return getMedia(sessionId, 'PHOTO');
        }

        function getAudios(sessionId) {
            return getMedia(sessionId, 'AUDIO');
        }

        function getVideos(sessionId) {
            return getMedia(sessionId, 'VIDEO');
        }

        function savePicture(sessionId, data) {
            return saveMedia(sessionId, 'PHOTO', data);
        }

        function saveAudio(sessionId, data) {
            return saveMedia(sessionId, 'AUDIO', data);
        }

        function saveVideo(sessionId, data) {
            return saveMedia(sessionId, 'VIDEO', data);
        }

        function deletePicture(data) {
            return deleteMediaByData('PHOTO', data);
        }

    }])
    .service('StorageService', ['$http', '$q', function ($http, $q) {

        var vm = this;

        vm.getSpeakers = getSpeakers;
        vm.getSessions = getSessions;

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function getProg() {
            var prog = localStorage.getItem('prog');
            if (prog) {
                return $q(function (resolve, reject) {
                    resolve(JSON.parse(prog));
                });
            } else {
                return $http.get("http://devfest2015.gdgnantes.com/assets/prog.json")
                    .then(function (response) {
                        localStorage.setItem('prog', JSON.stringify(response.data));
                        return response.data;
                    }, function (error) {
                        return $http.get('data/devfest-2015.json')
                            .then(function (response) {
                                return response.data;
                            }, function (error) {
                                throw error;
                            });
                    });
            }
        }

        function getSessions() {
            return getProg()
                .then(function (prog) {
                    var categories = prog.categories;
                    var sessions = {};

                    // TODO : hack categories
                    categories['codelab-web'] = categories.codelabweb;
                    categories['codelab-cloud'] = categories.codelabcloud;
                    categories['mobile'] = categories.android;
                    categories['discovery'] = categories.decouverte;
                    delete categories.codelabweb;
                    delete categories.codelabcloud;
                    delete categories.android;
                    delete categories.decouverte;

                    for (var key in categories) {
                        if (categories.hasOwnProperty(key)) {
                            sessions[key] = prog.sessions.filter(function (s) {
                                return s.type == key;
                            });
                        }
                    }
                    return {
                        categories: categories,
                        sessions: sessions
                    };
                }).catch(function (error) {
                    console.error(error);
                });
        }

        function getSpeakers() {
            return getProg()
                .then(function (prog) {
                    return prog.speakers.sort(function (a, b) {
                        if (a.id < b.id) return -1;
                        if (a.id > b.id) return 1;
                        return 0;
                    });
                }).catch(function (error) {
                    console.error(error);
                });
        }

    }]);


