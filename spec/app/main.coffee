jsdom = require('jsdom')
Router = require('routerjs').default
thinner = require('../../dist/thinner')
global.jQuery = global.$ = require('jQuery')

app = thinner.setup(
  router: new Router()
  el: $('body')
).scope()

app.router.map (match) ->
  match('/').to 'home'
  match('/hi/new').to 'make'
  match('/hi/:name').to 'show'
  match('/do/:test').to 'test_view'
  match('/some_path').to 'my.handler'
  match('/some/actions').to 'explode_this'

thinner (App) ->
  App.home = require('./modules/home')(app)
  App.show = require('./modules/show')(app)
  App.make = require('./modules/make')(app)
  App.testView = require('./modules/test-view')(app)
  App.explodeThis = require('./modules/explode-this')(app)


module.exports = app
