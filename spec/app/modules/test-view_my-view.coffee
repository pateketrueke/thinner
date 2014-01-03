class MyView
  constructor: ->
    $('body').append '<div id="foo" />'
    $('body').append '<div id="bar" />'

  exit: ->
    $('#foo').remove()
    $('#bar').remove()

  view:
    el: '#foo'
    template: '#bar'


module.exports = MyView
