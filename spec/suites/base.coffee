window._$blanket = window._$jscoverage

history.replaceState = ->
history.pushState = ->


ctx = []
app = null

get = -> ctx.pop()
set = (args...) -> ctx.push args.join ''

delay = (resume, callback) ->
  setTimeout ->
    callback()
    resume()
  , -1
