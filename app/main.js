var Router = require('router')['default'],
    thinner = require('thinner');

var app = thinner.setup({
  router: new Router()
}).scope();
