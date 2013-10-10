## Operation and data consumption

[router.js](https://github.com/tildeio/router.js) is the base router used by [Ember.js](http://emberjs.com/), fabulous project.

  - It provides a strong mechanism to handle application states
  - Also provides you with a model-like mechanism for consuming your data

## Presentation and data manipulation

[Ractive.js](http://ractivejs.org/) is another big boy worth mentioning, it runs without a router!

  - It includes data binding and event management
  - It uses raw objects as model data sources

## Workflow and boilerplates

[Lineman.js](http://linemanjs.com/) lets you work whatever you like to do.

  - Built for grunt, run anything you want
  - Organizing your source code is your responsability

## Common utilities

  - [jQuery](http://jquery.com/) used for DOM, Promises, Events, etc.
  - [Lo-Dash](http://lodash.com) used for data manipulation and FP

## Thinner

In order to work, thinner needs:

**vendor.yaml**

```yaml
js:
  - thinner/dist/bundle/jquery.js
  - thinner/dist/bundle/rsvp-latest.js
  - thinner/dist/bundle/route-recognizer.js
  - thinner/dist/bundle/router.js
  - thinner/dist/Thinner.js
```

Of course you can replace all this dependencies by hand or using [Bower](http://bower.com/),

**example.coffee**

```coffeescript
thinner (MyApp) ->
  app.router.map (match) ->
    match('/').to 'hello_world'

  class MyApp.helloWorld
    enter: -> console.log 'Hello World!'
```

**app.js**

```javascript
thinner.loader().run(function (app) {
  app.go('/').then(function () {
    console.log('start');
  });
});
```

Or just clone [this](https://github.com/pateketrueke/lineman-template) Lineman template.

[![Build Status](https://travis-ci.org/pateketrueke/thinner.png)](https://travis-ci.org/pateketrueke/thinner)
