describe 'Our application:', ->

  thinner.setup ->
  thinner.setup {}
  thinner.setup { x: 'y' }
  thinner.setup { templates: { x: (v) -> v.x() } }

  app.run ->
    it 'can render() JST-templates', ->
      app.helpers.x = -> 'y'
      expect(app.render 'x').toBe 'y'

    it 'can store/retrieve registry values', ->
      app.set 'x', 'y'
      expect(app.get 'x').toBe 'y'

    it 'will not run over invalid routes', ->
      expect(-> app.go('/abc')).toThrow()
      expect(-> app.go('whatever')).toThrow()
      expect(-> app.go('no_handler')).toThrow()

    it 'we can build our application routes with url()', ->
      expect(-> app.url 'show').toThrow()
      expect(app.url 'make').toBe '/hi/new'
      expect(app.url('show', { name: 'foo' })).toBe '/hi/foo'

    describe 'Looking at routes:', ->
      async = new AsyncSpec @

      async.it 'should display "Hello World" at /', (done) ->
        app.go '/'
        delay done, ->
          expect(get()).toBe 'Hello World'

      async.it 'should display "Hi dude!" at /hi/dude', (done) ->
        app.go '/hi/dude', off
        delay done, ->
          expect(get()).toBe 'Hi dude!'

      async.it 'should display "testing" at /hi/new', (done) ->
        app.go '/hi/new', off
        delay done, ->
          expect(get()).toBe 'new'

      async.it 'should trigger some events, i.e. "testEvent"', (done) ->
        app.go 'home', { x: 'y' }, off
        delay done, ->
          app.router.trigger 'testEvent'
          expect(get()).toBe 'testing'

      async.it 'should handle promises when redirecting', (done) ->
        app.go('home').then done

      async.it 'should care about onpopstate events', (done) ->
        app.go { to: 'test' }
        app.go '/some_path'
        history.back -1
        delay done, ->
          path = document.location.pathname
          expect(path).toBe '/foo'
          app.go '/'

      async.it 'should handle registered data-actions', (done) ->
        app.go('explode_this', false).then ->
          $('.js-action').trigger 'click'
          expect(get()).toBe 'xy'
          app.go '/'
          done()

      async.it 'implements plugin-in views silently', (done) ->
        app.go('/do/nothing', false).then ->
          fn = get()

          expect(-> fn()).toThrow()
          expect(typeof fn).toBe 'function'

          app.go '/'
          done()
