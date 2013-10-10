
app.router.map (match) ->
  match('/').to 'home'
  match('/foo').to 'test'
  match('/hi/new').to 'make'
  match('/hi/:name').to 'show'
  match('/example').to 'no_handler'
  match('/do/:test').to 'test_view'
  match('/some_path').to 'my.handler'
  match('/some/actions').to 'explode_this'
