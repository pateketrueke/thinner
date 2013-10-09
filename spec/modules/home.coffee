thinner (App) ->
  class App.home
    enter: -> set 'Hello World'
    events:
      testEvent: (handler) -> set 'testing'

  class App.make
    enter: -> set 'new'

  class App.show
    model: (params) -> new User params
    setup: (user) -> set "Hi #{user.name}!"

  class App.Home
    constructor: ->
      app.router.map (match) ->
        match('/').to 'home'
        match('/hi/new').to 'make'
        match('/hi/:name').to 'show'

