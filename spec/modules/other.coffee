class Other
  constructor: (app) ->
    app.router.map (match) ->
      match('/foo').to 'test'

mohawk (App) ->
  class App.test
