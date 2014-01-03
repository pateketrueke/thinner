module.exports = (app) ->
  class HomeHandler
    enter: -> app.set 'x', 'Hello World'
    events:
      testEvent: (handler) -> app.set 'testing', on
