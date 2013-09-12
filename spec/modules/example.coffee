mohawk (App) ->

  class App.Module
    initialize_module: (mapper) ->
      mapper.draw (match) ->
        match('/example').to 'no_handler'
        match('/some_path').to 'my.handler'
        match('/some/actions').to 'explode_this'

  class App.explodeThis
    constructor: ->
      $('body').append '<a data-action="baz" class="js-action"></a>'

    actions:
      'baz.click': 'buzz'

    buzz: ->
      set 'xy'

    exit: ->
      $('.js-action').remove()

  class App.myHandler
    model: ->
      throw 'fail'

  class App.notFound
    exception: (e) ->
      throw e
