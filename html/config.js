const CONFIG = {

    server: {
        name: 'OPERATION',
        nameBold: 'TEST',
        subtitle: '// YOUR MILSIM SERVER //',
        hudLabel: 'DE-WEST-01',
        ip: '45.131.108.121',
        port: '30120', //  standard port //
        maxSlots: 64,
        radioLabel: 'CONFLICT RADIO',
        utcOffset: 1,
    },

    colors: {
        odGreen: '#4a5c3a',
        darkGreen: '#1a2213',
        armyTan: '#c8b882',
        accent: '#8fbc3a',
        alert: '#d4a017',
        red: '#b22222',
        white: '#e8e4d4',
        dark: '#0d0f0a',
    },

    slideshow: [
        'img/slide1.jpg',
        'img/slide2.jpg',
        'img/slide3.jpg',
        'img/slide4.jpg',
        'img/slide5.jpg',
    ],
    slideshowInterval: 5000,

    playlist: [
        { title: 'THUNDERSTRUCK', file: 'music/track2.mp3' },
        { title: 'OPERATION BLACKOUT', file: 'music/intro.mp3' },
    ],
    defaultVolume: 0.02,

    playerList: {
        refreshInterval: 10,
    },

    loadingSteps: [
        'CONNECTING TO SERVER...',
        'LOADING BASE RESOURCES...',
        'INITIALIZING MAPS...',
        'LOADING VEHICLES & WEAPONS...',
        'SYNCHRONIZING PLAYERS...',
        'LOADING WEAPONS & EQUIPMENT...',
        'CONFIGURING UI...',
        'ESTABLISHING CONNECTION...',
        'CHECKING PERMISSIONS...',
        'READY FOR DEPLOYMENT...',
    ],

};
