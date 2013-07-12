app = null

describe 'Our application:', ->

  it 'will never happen without router.js', ->
    expect(-> new App).not.toThrow()

  it 'will fail easily without it, seriously', ->
    expect(-> new App -> null).toThrow()

  describe 'Well.. when it runs,', ->
    app = new App

    it 'will do not without modules', ->
      expect(app.run).toThrow()

    it 'will validate all their modules', ->
      expect(app.load).toThrow()
      expect(-> app.load [Blank]).toThrow()
      expect(-> app.load [Breaking]).toThrow()
      expect(-> app.load [Undefined]).toThrow()

    it 'will not run over invalid routes', ->
      expect(-> app.run ctx).toThrow()

    describe 'Looking at routes:', ->
      async = new AsyncSpec @

      app.load([Home, Other]).run ctx, '/'

      it 'should display "Hello world" at /', (done) ->
        expect(get()).toEqual 'Hello World'

      async.it 'should display "Hi dude!" at /hi/dude', (done) ->
        app.goto '/hi/dude'
        delay done, ->
          expect(get()).toEqual 'Hi dude!'

      async.it 'should display "testing" at /hi/new', (done) ->
        app.goto '/hi/new'
        delay done, ->
          expect(get()).toEqual 'new'

      it 'should keep the history (?)', ->
        app.redirect '/foo'
        app.redirect '/hi/new'
        app.redirect '/hi/other'

        expect(-> app.redirect '/x').toThrow()
        expect(app.history).toEqual ['/foo', '/hi/new', '/hi/other']

      describe 'Also, router.js', ->

        it 'can build our application routes', ->
          expect(-> app.url 'show').toThrow()
          expect(app.url 'make').toEqual '/hi/new'
          expect(app.url 'show', { name: 'foo' }).toEqual '/hi/foo'
