fx_version 'cerulean'
game      'gta5'

name        'fx_loadingscreen'
description 'FiveM MilSim Loading Screen'
author      'fluxxxc'
version     '1.0'

loadscreen 'html/index.html'
loadscreen_manual_shutdown 'yes'

files {
    'html/index.html',
    'html/style.css',
    'html/config.js',
    'html/script.js',
    'html/music/*.mp3',
    'html/music/*.ogg',
    'html/img/*.jpg',
    'html/img/*.png',
    'html/img/*.webp',
}

client_scripts {
    'client/cl_main.lua',
}

server_scripts {
    'server/sv_main.lua',
}
