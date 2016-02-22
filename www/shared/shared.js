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

        this.goToSchedule = function () {
            changePage('modules/schedule/schedule.html');
        }

    })
    .service("SessionService", ['$cordovaSQLite', function ($cordovaSQLite) {
        // This service interacts with a SQLite database to store and retrieve data on sessions.
        // We save notes, pictures, audio, video about a session. We can also mark a session on a range of 1 to 5 stars.

        var vm = this;
        var db = $cordovaSQLite.openDB({name: "conferences"});

        initializeDB();

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
        vm.saveFeedback = saveFeedback;
        vm.getFeedback = getFeedback;
        vm.saveFavorite = saveFavorite;
        vm.removeFavorite = removeFavorite;
        vm.getFavorites = getFavorites;

        function initializeDB() {
            $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS favorites(sessionId text primary key)");
            $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS feedback(sessionId text primary key, feedback integer)");
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

        function saveFeedback(sessionId, feedback) {
            return $cordovaSQLite.execute(db, "INSERT OR REPLACE INTO feedback(sessionId, feedback) VALUES (?, ?)", [sessionId, feedback])
                .then(function (res) {
                    console.log("feedback saved");
                }, function (err) {
                    console.error(err);
                });
        }

        function getFeedback(sessionId) {
            return $cordovaSQLite.execute(db, "SELECT feedback FROM feedback where sessionId = ?", [sessionId])
                .then(function (res) {
                   if (res.rows.length > 0)
                       return res.rows.item(0).feedback;
                   else return null;
                }, function (err) {
                    console.error(err);
                });
        }

        function saveFavorite(sessionId) {
            return $cordovaSQLite.execute(db, "INSERT OR REPLACE INTO favorites(sessionId) VALUES (?)", [sessionId])
                .then(function (res) {
                    console.log("fav saved");
                }, function (err) {
                    console.error(err);
                });
        }

        function removeFavorite(sessionId) {
            return $cordovaSQLite.execute(db, "DELETE FROM favorites WHERE sessionId = ?", [sessionId])
                .then(function (res) {
                    console.log("fav deleted");
                }, function (err) {
                   console.error(err);
                });
        }

        function getFavorites() {
            return $cordovaSQLite.execute(db, "SELECT sessionId FROM favorites")
                .then(function (res) {
                    var favs = []
                    for (var i = 0; i< res.rows.length; i++)
                        favs.push(res.rows.item(i));
                    return favs;
                }, function (err) {
                   console.error(err);
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
        vm.getSessionsByCategories = getSessionsByCategories;
        vm.getSessionsByHours = getSessionsByHours;

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
                        var prog = response.data;

                        // TODO : hack categories
                        prog.categories['codelab-web'] = prog.categories.codelabweb;
                        prog.categories['codelab-cloud'] = prog.categories.codelabcloud;
                        prog.categories['mobile'] = prog.categories.android;
                        prog.categories['discovery'] = prog.categories.decouverte;
                        delete prog.categories.codelabweb;
                        delete prog.categories.codelabcloud;
                        delete prog.categories.android;
                        delete prog.categories.decouverte;

                        // Sort speakers by id
                        prog.speakers = prog.speakers.sort(function (a, b) {
                            if (a.id < b.id) return -1;
                            if (a.id > b.id) return 1;
                            return 0;
                        });

                        localStorage.setItem('prog', JSON.stringify(prog));
                        return prog;
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

        function getSessionsByCategories() {
            return getProg()
                .then(function (prog) {
                    var categories = prog.categories;
                    var sessions = {};

                    // Returns an array indexed by categories
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

        function getSessionsByHours() {
            return getProg().then(function (prog) {
                var hours = prog.hours;
                var sessions = {};

                // returns an array indexed by hours
                for (var key in hours) {
                    if (hours.hasOwnProperty(key)) {
                        sessions[key] = prog.sessions.filter(function (s) {
                            return s.hour == key;
                        })
                    }
                }
                return {
                    hours : hours,
                    sessions: sessions
                };
            });
        }

        function getSpeakers() {
            return getProg()
                .then(function (prog) {
                    return prog.speakers;
                }).catch(function (error) {
                    console.error(error);
                });
        }

    }]);


