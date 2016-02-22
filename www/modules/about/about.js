/**
 * Created by Adrian on 22/02/2016.
 */
angular.module('conf.about', [])
    .controller('aboutController', ['$cordovaInAppBrowser', function ($cordovaInAppBrowser) {


        var vm = this;

        vm.version = '1.0';
        vm.openProfile = openProfile;

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function openProfile() {
            $cordovaInAppBrowser.open('https://twitter.com/adrianFraisse', '_blank', {});
        }

    }]);
