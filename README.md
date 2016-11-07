# Projet Cordova-Conférence EMN

This is an Academic project at Ecole des Mines de Nantes. It was designed as the evaluation of the "Mobile Development with Cordova" class in 3rd year.

It showcases the usage of Cordova, backed by AngularJS along with the OnsenUI framework to design beautifull, hybrid apps.

## Liste des plugins utilisés : 

- cordova-plugin-actionsheet 2.2.2 "ActionSheet"
- cordova-plugin-camera 2.1.0 "Camera"
- cordova-plugin-contacts 2.0.1 "Contacts"
- cordova-plugin-device 1.1.1 "Device"
- cordova-plugin-file 4.1.1 "File"
- cordova-plugin-file-transfer 1.5.0 "File Transfer"
- cordova-plugin-inappbrowser 1.2.1 "InAppBrowser"
- cordova-plugin-media-capture 1.2.0 "Capture"
- cordova-plugin-network-information 1.2.0 "Network Information"
- cordova-plugin-whitelist 1.2.1 "Whitelist"
- cordova-plugin-x-socialsharing 5.0.10 "SocialSharing"
- cordova-plugin-x-toast 2.4.2 "Toast"
- cordova-sqlite-storage 0.8.4-dev "Cordova sqlite storage plugin (core version)"

## Fonctionnalités

Toutes les fonctionnalités demandées on été réalisées. J'ai utilisé AngularJS et ngCordova pour l'architecture.
Afin d'organiser au mieux le code et exploiter l'injection de dépendances d'Angular, j'ai créé des services :
- SessionService qui utilise une base SQLite pour sauvegarder des informations sur les sessions ainsi que des notes et des medias
- StorageService qui utilise le LocalStorage HTML5 pour sauvegarder les données en provenance du site DevFest, qui sont hackées pour traiter les cas marginaux d'incohérences de clés.

J'ai également utilisé CordovaToast pour produire du feedback utilisateur.
