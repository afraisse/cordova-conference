angular.module('conf.home', [])
    .controller('homeController', function(){
        this.title = 'Application Conference';

        var changePage = function(pageLocation) {
            console.log('changing location ', pageLocation);
            app.navi.pushPage(pageLocation);
        }


        this.goToSessions = function() { changePage('modules/session/sessions.html');}
        this.goToSpeakers = function() { changePage('modules/speaker/speakers.html');}
    });



