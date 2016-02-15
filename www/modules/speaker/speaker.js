angular.module('conf.speaker', ['ngCordova'])
    .controller('speakerController', ['$http', '$sce', '$filter', function ($http, $sce, $filter) {

        var vm = this;
        vm.speakers = [];

        vm.renderHTML = renderHTML;
        vm.showDetail = showDetail;

        $http.get('data/devfest-2015.json')
            .then(function (response) {
                vm.speakers = response.data.speakers.sort(function (a, b) {
                    if (a.id < b.id) return -1;
                    if (a.id > b.id) return 1;
                    return 0;
                });
            });

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function renderHTML(htmlCode) {
            return $sce.trustAsHtml($filter('limitTo')(htmlCode, 100));
        }

        function showDetail(speaker) {
            app.navi.pushPage('modules/speaker/detail.html', {speaker: speaker});
        }

    }])
    .controller('speakerDetailController', ['$sce', '$cordovaContacts', function ($sce, $cordovaContacts) {

        var vm = this;

        vm.speaker = app.navi.getCurrentPage().options.speaker;
        vm.checked = false;
        vm.confContact = buildContact();
        vm.deviceContact = null;

        vm.toggle = toggle;
        vm.renderHTML = renderHTML;

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

    }]);