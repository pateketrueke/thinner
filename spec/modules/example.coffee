mohawk (App) ->
  class App.Module
    initialize_module: (mapper) ->
      mapper.draw (match) ->
        match('/example').to 'no_handler'
        match('/some_path').to 'my.handler'

  class App.myHandler
