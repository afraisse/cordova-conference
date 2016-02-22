/**
 * Created by Adrian on 22/02/2016.
 */
angular.module('conf.schedule', [])
    .controller('scheduleController', ['StorageService', 'SessionService', '$cordovaToast', function(StorageService, SessionService, $cordovaToast) {

        var vm = this;
        vm.hours;
        vm.sessions;
        vm.favorites = [];

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

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function isFav(session) {
            return vm.favorites.indexOf(session.id) > -1;
        }

    }]);