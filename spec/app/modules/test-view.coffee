module.exports = (app) ->
  class TestViewHandler
    enter: ->
      app.set 'x', @['my-view']

    partials:
      'my-view': require('./test-view_my-view')
