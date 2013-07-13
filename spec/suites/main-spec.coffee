describe 'Our application:', ->

  it 'will never happen without router.js', ->
    expect(-> new App(null, '/')).not.toThrow()

  describe 'Well.. when it runs,', ->
    app = new App null, '/'

    it 'will do not without modules', ->
      expect(app.run).toThrow()

    it 'will validate all their modules', ->
      expect(app.load).toThrow()
      expect(-> app.load Blank).toThrow()
      expect(-> app.load Breaking).toThrow()
      expect(-> app.load Undefined).toThrow()

    it 'will not run over invalid routes', ->
      expect(new App(null, '/x/y/z').load(Other).run).toThrow()

    describe 'Looking at routes:', ->
      async = new AsyncSpec @

      app.load([Home, Other]).run ctx, '/'

      it 'should display "Hello world" at /', (done) ->
        expect(get()).toEqual 'Hello World'

      async.it 'should display "Hi dude!" at /hi/dude', (done) ->
        app.go '/hi/dude', off
        delay done, ->
          expect(get()).toEqual 'Hi dude!'
          expect(app.history.length).toEqual 1

      async.it 'should display "testing" at /hi/new', (done) ->
        app.go '/hi/new', off
        delay done, ->
          expect(get()).toEqual 'new'
          expect(app.history.length).toEqual 1

      it 'should keep the history (?)', ->
        app.go '/foo'
        app.go '/hi/new'
        app.go '/hi/other'

        expect(-> app.go '/x').toThrow()
        expect(app.history).toEqual ['/', '/foo', '/hi/new', '/hi/other']

      describe 'By the way:', ->

        it 'can build our application routes', ->
          expect(-> app.url 'show').toThrow()
          expect(app.url 'make').toEqual '/hi/new'
          expect(app.url 'show', { name: 'foo' }).toEqual '/hi/foo'

        async.it 'can use send() as context mixin (?)', (done) ->
          app.context.locals.foo = 'bar'
          app.context.send ->
            expect(@locals.foo).toEqual 'bar'
            expect(@locals.bar).toBeUndefined()
            done()
