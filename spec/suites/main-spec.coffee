describe 'Our application:', ->

  thinner.setup ->
  thinner.setup {}
  thinner.setup { x: 'y' }

  app = thinner.loader().run ->
  app.load [Home, Other]

  it 'will validate all their modules', ->
    expect(app.load).toThrow()
    expect(-> app.load []).toThrow()
    expect(-> app.load Breaking).toThrow()
    expect(-> app.load Undefined).toThrow()
    expect(-> app.load ['Irregular value']).toThrow()

  it 'will not run over invalid routes', ->
    expect(-> app.go('/abc')).toThrow()
    expect(-> app.go('whatever')).toThrow()
    expect(-> app.go('no_handler')).toThrow()

  it 'we can build our application routes with url()', ->
    expect(-> app.url 'show').toThrow()
    expect(app.url 'make').toEqual '/hi/new'
    expect(app.url('show', { name: 'foo' })).toEqual '/hi/foo'

  describe 'Looking at routes:', ->
    async = new AsyncSpec @

    async.it 'should display "Hello World" at /', (done) ->
      app.go '/'
      delay done, ->
        expect(get()).toEqual 'Hello World'

    async.it 'should display "Hi dude!" at /hi/dude', (done) ->
      app.go '/hi/dude', off
      delay done, ->
        expect(get()).toEqual 'Hi dude!'

    async.it 'should display "testing" at /hi/new', (done) ->
      app.go '/hi/new', off
      delay done, ->
        expect(get()).toEqual 'new'

    async.it 'should trigger some events, i.e. "testEvent"', (done) ->
      app.go 'home', { x: 'y' }, off
      delay done, ->
        app.router.trigger 'testEvent'
        expect(get()).toEqual 'testing'

    async.it 'should handle promises when redirecting', (done) ->
      app.go('home').then done

    async.it 'should care about onpopstate events', (done) ->
      app.go { to: 'test' }
      app.go '/some_path'
      history.back -1
      delay done, ->
        path = document.location.pathname
        expect(path).toEqual '/foo'
        app.go '/'

    async.it 'should handle registered data-actions', (done) ->
      app.go('explode_this', false).then ->
        $('.js-action').trigger 'click'
        expect(get()).toEqual 'xy'
        app.go '/'
        done()

    async.it 'implements plugin-in views silently', (done) ->
      app.go('/do/nothing', false).then ->
        fn = get()

        expect(-> fn()).toThrow()
        expect(typeof fn).toEqual 'function'

        app.go '/'
        done()
