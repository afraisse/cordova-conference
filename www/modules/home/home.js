angular.module('conf.home', [])
    .controller('homeController', function(){
        this.title = 'Application Conference';

        var changePage = function(pageLocation) {
            console.log('changing location ', pageLocation);
            app.menu.setMainPage(pageLocation, { closeMenu : true});
        }

        this.goToSessions = function() { changePage('modules/session/sessions.html');}
        this.goToSpeakers = function() { changePage('modules/speaker/speakers.html');}
    });



