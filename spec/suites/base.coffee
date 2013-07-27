history.replaceState = ->
history.pushState = ->


ctx = []

get = -> ctx.pop()
set = (args...) -> ctx.push args.join ''
