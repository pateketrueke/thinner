class Home
  initialize_module: (mapper) ->
    mapper.draw (match) ->
      match('/').to 'home'
      match('/hi/new').to 'make'
      match('/hi/:name').to 'show'

      make: -> set 'new'
      home:
        setup: -> set 'Hello World'
        events:
          testEvent: (handler) -> set 'testing'
      show:
        model: (params) -> new User params
        setup: (user) -> set "Hi #{user.name}!"
