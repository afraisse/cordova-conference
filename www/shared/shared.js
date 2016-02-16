angular.module('conf.shared', [])
    .controller('menuController', function(){

        var changePage = function(pageLocation) {
            console.log('changing location ', pageLocation);
            app.menu.setMainPage(pageLocation, { closeMenu : true});
        }


        this.goToSessions = function() { changePage('modules/session/sessions.html');}
        this.goToSpeakers = function() { changePage('modules/speaker/speakers.html');}
        this.goToHome = function() { app.menu.setMainPage('modules/home/home.html', {closeMenu: true});}
        this.goToTechniques = function() { changePage('modules/technique/techniques.html');}
        this.goToAbout = function() { changePage('modules/about/about.html');}

    });

// TODO - Ajouter ici des services transverses à tous les modules

