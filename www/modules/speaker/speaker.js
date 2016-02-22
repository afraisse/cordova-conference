angular.module('conf.speaker', ['ngCordova'])
    .controller('speakerController', ['StorageService', '$sce', '$filter', function (StorageService, $sce, $filter) {

        var vm = this;
        vm.speakers = [];

        vm.renderHTML = renderHTML;
        vm.showDetail = showDetail;

        StorageService.getSpeakers()
            .then(function(data) {
               vm.speakers = data;
            });

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function renderHTML(htmlCode) {
            return $sce.trustAsHtml($filter('limitTo')(htmlCode, 100));
        }

        function showDetail(speaker) {
            app.navi.pushPage('modules/speaker/detail.html', {speaker: speaker});
        }

    }])
    .controller('speakerDetailController', ['$sce', '$cordovaContacts', '$cordovaInAppBrowser', function ($sce, $cordovaContacts, $cordovaInAppBrowser) {

        var vm = this;

        vm.speaker = app.navi.getCurrentPage().options.speaker;
        vm.checked = false;
        vm.confContact = buildContact();
        vm.deviceContact = null;

        vm.toggle = toggle;
        vm.renderHTML = renderHTML;
        vm.getSocialClass = getSocialClass;
        vm.openURL = openURL;

        $cordovaContacts.find({filter: vm.speaker.id, fields: ['nickname']})
            .then(function (contactFound) {
                vm.checked = contactFound.length > 0;
                vm.deviceContact = contactFound[0];
            }, function (error) {
                vm.checked = false;
                console.log(error);
            });

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function buildContact() {
            var urls = vm.speaker.socials.map(function (social) {
                return new ContactField('url', social.link, false);
            });
            var contactName = {
                formatted: vm.speaker.firstname + ' ' + vm.speaker.lastname,
                familyName: vm.speaker.lastname,
                givenName: vm.speaker.firstname
            };
            return {
                nickname: vm.speaker.id,
                displayName: contactName.formatted,
                contactName: contactName,
                organizations: [new ContactOrganization(true, "company", vm.speaker.company)],
                urls: urls,
                note: vm.speaker.about
            }
        }

        function toggle() {
            if (vm.checked) {
                $cordovaContacts.save(vm.confContact).then(
                    function (contact) {
                        vm.deviceContact = contact;
                    }, function (error) {
                        console.log(error);
                        vm.checked = false;
                    });
            } else {
                $cordovaContacts.remove(vm.deviceContact).then(function () {
                    vm.deviceContact = null;
                }, function (error) {
                    console.log(error);
                    vm.checked = true;
                });
            }
        };

        function renderHTML(htmlCode) {
            return $sce.trustAsHtml(htmlCode);
        }

        function getSocialClass(sClass) {
            // TODO : hack socials, depuis le flux devfest on reçoit 'site' au lieu de 'link'
            if (sClass == 'site') return 'link';
            else return sClass;
        }

        function openURL(url) {
            $cordovaInAppBrowser.open(url, '_blank', {});
        }

    }]);