angular.module('conf.speakerDetail',[])
    .controller('speakerDetailController', function() {

        var vm = this;

        var page = app.navi.getCurrentPage();
        vm.speaker = page.options.speaker;
    });