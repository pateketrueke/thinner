class Other
  constructor: (app) ->
    app.router.map (match) ->
      match('/foo').to 'test'

thinner (App) ->
  class App.test
