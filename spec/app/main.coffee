global.jQuery = global.$ = require('jQuery')

thinner = require('../../dist/thinner')
Router = require('routerjs').default

# initialization
app = thinner.setup(
  router: new Router()
  el: $('body')
).scope()

# per-module loading (legacy)
thinner (App) ->
  app.router.map (match) ->
    match('/').to 'home'

  App.home = require('./modules/home')(app)

# per-group route matching (new approach)
thinner (App) ->

  App.make =
    path: '/hi/new'
    handler: require('./modules/make')

# nested-group route matching (new approach equivalent)
app.route
  init:
    path: '/hi'
    handler: require('./modules/init')
    routes:
      show:
        path: '/:name'
        handler: require('./modules/show')

# hash-like style (new approach equivalent)
app.route
  testView:
    path: '/do/:test'
    handler: require('./modules/test-view')

# single route (new approach equivalent)
app.route 'explodeThis',
  path: '/some/actions'
  handler: require('./modules/explode-this')


module.exports = app
