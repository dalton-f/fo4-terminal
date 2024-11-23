const mix = require("laravel-mix");

mix
  .js("src/js/app.js", "dist/js/app.js")
  .postCss("src/css/app.pcss", "dist/css/app.css", [require("tailwindcss")]);
