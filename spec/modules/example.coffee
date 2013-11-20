thinner (App) ->

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

  class App.testView
    enter: ->
      set @myView

  class App.testView.myView
    constructor: ->
      $('body').append '<div id="foo" />'
      $('body').append '<div id="bar" />'

    exit: ->
      $('#foo').remove()
      $('#bar').remove()

    view:
      el: '#foo'
      template: '#bar'
