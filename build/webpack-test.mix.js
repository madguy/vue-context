const mix = require('laravel-mix');

mix
    .setPublicPath('test/js/dist')
    .js('test/js/src/index.js', 'index.js')
    .vue({ version: 2 })
    .sass('test/js/src/index.scss', 'index.css')
    .sourceMaps();
