/**
 * Created by Adrian on 22/02/2016.
 */
angular.module('conf.schedule', [])
    .controller('scheduleController', ['StorageService', 'SessionService', '$cordovaToast', '$cordovaActionSheet',
        function (StorageService, SessionService, $cordovaToast, $cordovaActionSheet) {

            var vm = this;
            vm.hours;
            vm.sessions;
            vm.favorites = [];

            var actionOpts = {
                title: "Gestion des favoris",
                addCancelButtonWithLabel: 'Annuler',
                androidEnableCancelButton: true,
            };

            StorageService.getSessionsByHours()
                .then(function (data) {
                    console.log(data.sessions);
                    vm.hours = data.hours;
                    vm.sessions = data.sessions;
                });

            SessionService.getFavorites().then(function (data) {
                vm.favorites = data;
            }, function (err) {
                $cordovaToast.showShortBottom("Couldn't retrieve favorites");
            });

            vm.isFav = isFav;
            vm.onTapSession = onTapSession;

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            function isFav(sessionId) {
                return vm.favorites.indexOf(sessionId) > -1;
            }

            function onTapSession(sessionId) {
                console.log(sessionId);
                var options = actionOpts;
                if (isFav(sessionId)) {
                    options.buttonLabels = ['Supprimer'];
                    $cordovaActionSheet.show(options).then(function (btnIndex) {
                        switch (btnIndex) {
                            case 1 :
                                SessionService.removeFavorite(sessionId).then(function () {
                                    vm.favorites.splice(vm.favorites.indexOf(sessionId), 1);
                                    $cordovaToast.showShortBottom("Removed from favorites");
                                }, function () {
                                    $cordovaToast.showShortBottom("Unable to remove favorite");
                                });
                                break;
                            case 2 :
                                break;
                            default :
                                console.error("Invalid btn index");
                                $cordovaToast.showShortBottom("Please retry");
                        }
                    });
                } else {
                    options.buttonLabels = ['Ajouter'];
                    $cordovaActionSheet.show(options).then(function (btnIndex) {
                        switch (btnIndex) {
                            case 1 :
                                SessionService.saveFavorite(sessionId).then(function () {
                                    vm.favorites.push(sessionId);
                                    $cordovaToast.showShortBottom("Saved to favorites");
                                }, function () {
                                    $cordovaToast.showShortBottom("Unable to save favorite");
                                });
                                break;
                            case 2 :
                                break;
                            default :
                                console.error("Invalid btn index");
                                $cordovaToast.showShortBottom("Please retry");
                        }
                    });
                }

            }

        }]);