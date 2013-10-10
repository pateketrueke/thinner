## Operation and data consumption

[router.js](https://github.com/tildeio/router.js) is the base router used by Ember.js, fabulous project.

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

**bower.json**
```json
{
  "dependencies": {
    "thinner": "*",
    "ractive": "*",
    "lodash": "*"
  }
}
```

**index.html**

```html
<script src="bower_components/thinner/dist/bundle/jquery.js"></script>
<script src="bower_components/thinner/dist/bundle/rsvp-latest.js"></script>
<script src="bower_components/thinner/dist/bundle/route-recognizer.js"></script>
<script src="bower_components/thinner/dist/bundle/router.js"></script>
<script src="bower_components/thinner/dist/Thinner.js"></script>
```

Of course you can write your application using CoffeeScript:

**app.coffee**

```coffeescript
((app) ->

  thinner (module) ->
    class module.helloWorld
      enter: -> console.log 'Hello World!'

  app.router.map (match) ->
    match('/').to 'hello_world'

  app.run ->
    app.go '/'

)(thinner.loader())
```

using plain JavaScript:

**app.js**

```javascript
(function (app) {

  thinner(function (module) {
    module.helloWorld = function () {};
    module.helloWorld.prototype.enter = function () {
      console.log('Hello World!');
    };
  });

  app.router.map(function (match) {
    match('/').to('hello_world');
  });

  app.run(function () {
    app.go('/');
  });

})(thinner.loader());
```

or just cloning [this](https://github.com/pateketrueke/lineman-template) Lineman template.

[![Build Status](https://travis-ci.org/pateketrueke/thinner.png)](https://travis-ci.org/pateketrueke/thinner)
