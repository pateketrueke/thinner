describe 'Our application:', ->

  it 'will never happen without router.js', ->
    expect(-> new Router).not.toThrow()

  describe 'Well.. when it runs,', ->
    app = Mohawk.loader().run(->)

    it 'will validate all their modules', ->
      expect(app.load).toThrow()
      expect(-> app.load []).toThrow()
      expect(-> app.load Blank).toThrow()
      expect(-> app.load Breaking).toThrow()
      expect(-> app.load Undefined).toThrow()
      expect(-> app.load { Sample }).toThrow()
      expect(-> app.load ['Irregular value']).toThrow()

    it 'will show which module are loaded', ->
      app.load [Home, Other]

      keys = []
      keys.push key for key, module of app.modules

      expect(-> app.load Other).toThrow()
      expect(['Module', 'Home', 'Other']).toEqual keys

    it 'will not run over invalid routes', ->
      expect(-> app.context.go('/abc')).toThrow()
      expect(-> app.context.go('whatever')).toThrow()
      expect(-> app.context.go('no_handler')).toThrow()

    describe 'Looking at routes:', ->
      async = new AsyncSpec @

      async.it 'should display "Hello World" at /', (done) ->
        app.context.go '/'
        delay done, ->
          expect(get()).toEqual 'Hello World'

      async.it 'should display "Hi dude!" at /hi/dude', (done) ->
        app.context.go '/hi/dude', off
        delay done, ->
          expect(get()).toEqual 'Hi dude!'

      async.it 'should display "testing" at /hi/new', (done) ->
        app.context.go '/hi/new', off
        delay done, ->
          expect(get()).toEqual 'new'

      async.it 'should trigger some events, i.e. "testEvent"', (done) ->
        app.context.go 'home', off
        delay done, ->
          app.router.trigger 'testEvent'
          expect(get()).toEqual 'testing'

      async.it 'should handle promises when redirecting', (done) ->
        app.context.go('home').then done

      async.it 'should care about onpopstate events', (done) ->
        app.context.go 'test'
        app.context.go '/some_path'
        history.back -1
        delay done, ->
          path = document.location.pathname
          expect(path).toEqual '/foo'
          app.context.go '/'

      describe 'By the way:', ->
        it 'we can build our application routes with url()', ->
          expect(-> app.context.url 'show').toThrow()
          expect(app.context.url 'make').toEqual '/hi/new'
          expect(app.context.url('show', { name: 'foo' })).toEqual '/hi/foo'

        it 'we can use send() as context mixin (?)', ->
          app.context.globals.foo = 'bar'
          app.context.send ->
            expect(@globals.foo).toEqual 'bar'
            expect(@globals.bar).toBeUndefined()

          test = app.context.send [
            -> 'foo'
            -> @globals.foo
          ]

          expect(test).toEqual 'bar'

        it 'we can expose useful functions as helpers', ->
          app.context.helpers.foo = -> 'bar'
          app.context.helpers.url_for = -> app.context.url arguments...

          app.context.send ->
            expect(@helpers.foo()).toEqual 'bar'
            expect(@helpers.url_for 'make').toEqual '/hi/new'
