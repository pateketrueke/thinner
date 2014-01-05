describe 'Our application:', ->
  app = require('./app/main')
  app.run ->

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

    it 'expose a reasonable version for debug', ->
      thinner = require('../dist/thinner')

      expect(thinner.version).not.toBeUndefined()
      expect(thinner.version.major).toMatch /^\d+$/
      expect(thinner.version.minor).toMatch /^\d+$/
      expect(thinner.version.micro).toMatch /^\d+$/
      expect(thinner.version.date).toMatch /^\d{8}$/

    describe 'Looking at routes:', ->
      it 'should display "Hello World" at /', (done) ->
        app.go('/').then ->
          expect(app.get('x')).toBe 'Hello World'
          expect(app.get('hi')).toBeUndefined()
          done()

      it 'should display "Hi dude!" at /hi/dude', (done) ->
        app.go('/hi/dude').then ->
          expect(app.get('x')).toBe 'Hi dude!'
          expect(app.get('hi')).toBe 'everybody'
          done()

      it 'should display "new" at /hi/new', (done) ->
        app.go('/hi/new').then ->
          expect(app.get('x')).toBe 'new'
          done()

      it 'should trigger some events, i.e. "testEvent"', (done) ->
        app.go('home', { x: 'y' }).then ->
          app.router.trigger 'testEvent'
          expect(app.get('testing')).toBeTruthy()
          done()

      it 'should handle promises when redirecting', (done) ->
        app.go('home').then ->
          done()

      it 'should handle registered data-actions', (done) ->
        app.go('explodeThis').then ->
          $('.js-action').trigger 'click'
          expect(app.get('x')).toBe 'xy'
          done()

      it 'implements plugin-in views silently', (done) ->
        app.go('/do/nothing').then ->
          fn = app.get('x')

          expect(-> fn()).toThrow()
          expect(typeof fn).toBe 'function'

          done()
