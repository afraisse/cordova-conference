angular.module('conf.sessionDetail',[])
    .controller('sessionDetailController', function() {

        var vm = this;

        var page = app.navi.getCurrentPage();
        vm.session = page.options.session;
    });