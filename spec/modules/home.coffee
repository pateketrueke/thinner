class Home
  initialize_module: (mapper) ->
    mapper.draw (match) =>
      match('/').to 'home'
      match('/hi/new').to 'make'
      match('/hi/:name').to 'show'

      make: -> set 'new'
      home: -> set 'Hello World'
      show:
        model: (params) -> new User params
        setup: (user) -> set "Hi #{user.name}!"

    mapper.home.events.testEvent = (handler) -> set 'testing'

