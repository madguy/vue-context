const mix = require('laravel-mix');

mix
    .setPublicPath('test')
    .js('test/js/src/index.js', 'js/dist/index.js')
    .vue({ version: 3 })
    .sourceMaps();
