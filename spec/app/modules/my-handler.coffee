module.exports = (app) ->
  class MyHandler
    model: ->
      throw 'fail'
