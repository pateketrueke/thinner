class Other
  constructor: (app) ->
    app.router.map (match) ->
      match('/foo').to 'test'

Thinner (App) ->
  class App.test
