describe 'Our application:', ->

  it 'will never happen without router.js', ->
    expect(-> new Router).not.toThrow()

  it 'could be configured through setup() method', ->
    mohawk.setup x: 'y'
    mohawk.setup -> a: 'b'
    mohawk.setup -> @foo = 'bar'
    mohawk.setup (config) -> config.key = 'val'

  describe 'Well.. when it runs,', ->
    app = mohawk.loader().run(->)
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

    it 'will allow pass itself as context (?)', ->
      obj = app.factory stdClass
      expect(String(obj)).toEqual '__CLASS__'
      expect(obj.router).toEqual app.router
      expect(obj.send).toEqual app.send

      obj = app.factory stdClass, x: 'y', a: 'b'
      expect(obj.params).toEqual { x: 'y', a: 'b' }

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

      describe 'By the way:', ->
        it 'we can build our application routes with url()', ->
          expect(-> app.url 'show').toThrow()
          expect(app.url 'make').toEqual '/hi/new'
          expect(app.url('show', { name: 'foo' })).toEqual '/hi/foo'

        it 'we can use send() as context mixin (?)', ->
          app.context.globals.foo = 'bar'
          app.send (params) ->
            expect(@globals.foo).toEqual 'bar'
            expect(@globals.bar).toBeUndefined()
            expect(params).toEqual { foo: 'bar', x: 'y' }
          , { foo: 'bar' }, { x: 'y' }

          test = app.send [
            -> 'foo'
            -> @globals.foo
          ]

          expect(test).toEqual 'bar'

        it 'we can expose useful functions as helpers', ->
          app.context.helpers.foo = -> 'bar'
          app.context.helpers.url_for = -> app.url arguments...

          app.send ->
            expect(@helpers.foo()).toEqual 'bar'
            expect(@helpers.url_for 'make').toEqual '/hi/new'
