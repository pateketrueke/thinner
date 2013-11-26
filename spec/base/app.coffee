global = this

ctx = []

get = -> ctx.pop()
set = (args...) -> ctx.push if args.length is 1 then args.shift() else args


Router = require('routerjs')['default']
thinner = require('../../generated/coverage/main')

app = thinner.setup(
  router: new Router()
  el: 'body'
).scope()
