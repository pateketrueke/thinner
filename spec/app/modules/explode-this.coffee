module.exports = (app) ->
  class ExplodeThisHandler
    constructor: ->
      $('body').append '<a data-action="baz" class="js-action"></a>'

    actions:
      'baz.click': 'buzz'

    buzz: ->
      app.set 'x', 'xy'

    exit: ->
      $('.js-action').remove()
