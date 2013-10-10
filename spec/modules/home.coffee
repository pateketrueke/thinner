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
