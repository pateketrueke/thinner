module.exports = (app) ->
  class InitHandler
    enter: -> app.set 'hi', 'everybody'
