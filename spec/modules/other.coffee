thinner (App) ->
  class App.test

  class App.Other
    constructor: ->
      app.router.map (match) ->
        match('/foo').to 'test'

