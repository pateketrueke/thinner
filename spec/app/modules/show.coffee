User = require('../classes/user')

module.exports = (app) ->
  class ShowHandler
    model: (params) -> new User params
    setup: (user) -> app.set 'x', "Hi #{user.name}!"
