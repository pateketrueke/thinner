global = this

ctx = []

get = -> ctx.pop()
set = (args...) -> ctx.push if args.length is 1 then args.shift() else args

class stdClass
  toString: -> '__CLASS__'
  constructor: (app, @params) ->
    { @router, @send } = app
