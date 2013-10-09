global = this

ctx = []

get = -> ctx.pop()
set = (args...) -> ctx.push if args.length is 1 then args.shift() else args
