class User

  name: 'Unknown'
  email: 'jhon@doe.com'

  constructor: (params) ->
    @[key] = value for key, value of params


module.exports = User
