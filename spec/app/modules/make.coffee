module.exports = (app) ->
  class MakeHandler
    enter: -> app.set 'x', 'new'
