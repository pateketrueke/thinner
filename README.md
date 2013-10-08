## Operation and data consumption

[router.js](https://github.com/tildeio/router.js) is the basis router used on [Ember.js](http://emberjs.com/), it's a fabulous project.

  - It provides you a strong mechanism to handle application states
  - It even provides you with a model-like mechanism for consume your data

## Presentation and data manipulation

[Ractive.js](http://ractivejs.org/) is another giant to mention, it even does run without any router!

  - It has data binding and event management included
  - It uses a raw objects as model data source

## Workflow and boilerplates

[Lineman.js](http://linemanjs.com/) ables you work whatever you like to do.

  - Built for grunt, run anything you can
  - Leaves you to organize your source code

## Common utilities

  - [jQuery](http://jquery.com/) for DOM, Promises, Events, etc.
  - [Lo-Dash](http://lodash.com) for data manipulation and FP.

## Thinner

In order to work you'll add the dependencies listed below:

**vendor.yaml**

```yaml
js:
  - thinner/dist/bundle/jquery.js
  - thinner/dist/bundle/lodash.compat.js  # optional
  - thinner/dist/bundle/Ractive-legacy.js # optional
  - thinner/dist/bundle/rsvp-latest.js
  - thinner/dist/bundle/route-recognizer.js
  - thinner/dist/bundle/router.js
  - thinner/dist/Thinner.js
```

Of course you can replace all this dependencies by hand or using [Bower](http://bower.com/),

**example.coffee**

```coffeescript
thinner (MyApp) ->
  class MyApp.Main
    constructor: (app) ->
      app.router.map (match) ->
        match('/').to 'hello_world'

  class MyApp.helloWorld
    enter: -> console.log 'Hello World!'
```

**app.js**

```javascript
var app = thinner.loader().run(function () {
  app.go('/').then(function () {
    console.log('start');
  });
});
```

Or just clone [this](https://github.com/pateketrueke/lineman-template) Lineman template.

[![Build Status](https://travis-ci.org/pateketrueke/thinner.png)](https://travis-ci.org/pateketrueke/thinner)
