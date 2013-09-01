class Other
  initialize_module: (mapper) ->
    # safe
    @set = -> set arguments...
    @get = -> get arguments...

    mapper.draw (match) ->
      match('/foo').to 'test'

      test:
        events:
          testEvent: (handler) -> @set 'thing'
