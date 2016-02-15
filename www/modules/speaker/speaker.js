angular.module('conf.speaker',[])
    .controller('speakerController', ['$http', '$sce', '$filter', function($http, $sce, $filter) {

        var vm = this;
        vm.speakers = [];

        $http.get('data/devfest-2015.json')
            .then(function(response) {
               vm.speakers = response.data.speakers;
            });

        vm.renderHTML = function(htmlCode) {
            return $sce.trustAsHtml($filter('limitTo')(htmlCode, 100));
        }

        vm.showDetail = function(speaker) {
            app.navi.pushPage('modules/speaker/detail.html', { speaker: speaker });
        }

    }]);