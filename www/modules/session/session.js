angular.module('conf.session',[])
    .controller('sessionController', ['$http', function($http) {

        var vm = this;
        vm.sessions = [];
        vm.categories = [];

        $http.get('data/devfest-2015.json')
            .then(function(response) {
                vm.categories = response.data.categories;
                vm.sessions = response.data.sessions;
            }, function(response) {
                console.log(response);
            });

        vm.getSessions = function(category) {
            return vm.sessions.filter(function(session) {
               return session.type == category;
            });
        }

        vm.showDetail = function(session) {
            app.navi.pushPage('modules/session/detail.html', { session : session });
        }
    }]);

