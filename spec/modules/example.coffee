module 'example', (My) ->
  class My.Module
    initialize_module: (mapper) ->
      mapper.draw (match) ->
        match('/example').to 'no_handler'
        match('/some_path').to 'my_handler'

  class My.myHandler
