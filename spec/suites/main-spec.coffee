describe 'Our application:', ->

  it 'will never happen without router.js', ->
    expect(-> new App).not.toThrow()

  describe 'Well.. when it runs,', ->
    app = new App

    it 'will do not without modules', ->
      expect((new App).run).toThrow()

    it 'will expose registered modules', ->
      expect(App.modules()).toEqual { 'Sample': App.Sample }

    it 'will validate all their modules', ->
      expect(app.load).toThrow()
      expect(-> app.load []).toThrow()
      expect(-> app.load Blank).toThrow()
      expect(-> app.load Breaking).toThrow()
      expect(-> app.load Undefined).toThrow()
      expect(-> app.load App.modules()).toThrow()
      expect(-> app.load ['Irregular value']).toThrow()

    it 'will show which module are loaded', ->
      keys = []
      keys.push key for key, module of app.modules

      expect(['Home', 'Other']).toEqual keys

    it 'will not run over invalid routes', ->
      expect(new App('/x/y/z').load(Other).run).toThrow()

    describe 'Looking at routes:', ->
      async = new AsyncSpec @

      app.load([Home, Other]).run()

      async.it 'should display "Hello world" at /', (done) ->
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
        app.context.go 'home'
        delay done, ->
          app.router.trigger 'testEvent'
          expect(get()).toEqual 'testing'

      describe 'By the way:', ->

        it 'we can add HTML-elements', ->
          main = element 'main'
          main.id = 'main'
          main.style.display = 'none'
          main.innerHTML = """
            <fieldset id="group">
              <legend>Samples</legend>
              <label data-extra-attribute></label>
              <span data-extra-attribute></span>
              <i class="icon-gear icon-spin"></i>
            </fieldset>
          """

          app.context.find('body').appendChild main

        it 'we can find() HTML-elements', ->
          samples =
            'group': '<fieldset'
            '#group': '<fieldset'
            '#group legend ~ i ': '<i'
            'legend ~ i ': '<i'
            'fieldset': '<fieldset'
            'fieldset legend': '<legend'
            'fieldset > legend': '<legend'
            '.icon-gear.icon-spin': '<i'
            '.icon-spin': '<i'

          for sample, tag of samples
            el = app.context.find sample
            html = String el.outerHTML or el[0]?.outerHTML
            test = html.substr 0, tag.length

            expect(test).toEqual tag

          expect(app.context.find([app.context.find 'body']).tagName).toEqual 'BODY'
          expect(app.context.find(app.context.find 'body').tagName).toEqual 'BODY'
          expect(app.context.find 'body').toEqual document.body

        it 'we can remove HTML-elements also', ->
          sample = app.context.find 'main'
          sample.parentNode.removeChild sample

          cached = app.context.find 'main'
          uncached = app.context.find 'main', false

          expect(cached).toEqual sample
          expect(uncached).not.toEqual sample

        it 'we can build our application routes with url()', ->
          expect(-> app.context.url 'show').toThrow()
          expect(app.context.url 'make').toEqual '/hi/new'
          expect(app.context.url('show', { name: 'foo' })).toEqual '/hi/foo'

        it 'we can use send() as context mixin (?)', ->
          app.context.globals.foo = 'bar'
          app.context.send ->
            expect(@globals.foo).toEqual 'bar'
            expect(@globals.bar).toBeUndefined()

        it 'we can expose useful functions as helpers', ->
          app.context.helpers.foo = -> 'bar'
          app.context.helpers.url_for = -> app.context.url arguments...
          app.context.helpers.link_to = -> app.context.link arguments...

          app.context.send ->
            expect(@helpers.foo()).toEqual 'bar'
            expect(@helpers.url_for 'make').toEqual '/hi/new'
            expect(@helpers.link_to('make').outerHTML).toEqual '<a href="/hi/new">make</a>'

        describe 'And our links:', ->
          it 'will be html-compliant', ->
            b = app.context.link 'make', innerHTML: 'Hello?'
            expect(b.outerHTML).toEqual '<a href="/hi/new">Hello?</a>'

          async.it 'will trigger redirections', (done) ->
            a = app.context.link 'make'
            a.click()

            delay done, ->
              expect(get()).toEqual 'new'
