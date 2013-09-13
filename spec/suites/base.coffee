global = this

ctx = []

get = -> ctx.pop()
set = (args...) -> ctx.push args.join ''

class stdClass
  toString: -> '__CLASS__'
  constructor: (app, @params) ->
    { @router } = app
    { @send } = app.context
