**thinner** is built-in on top of [router.js](https://github.com/tildeio/router.js):

  - It provides a strong mechanism to handle application states
  - Also provides you with a model-like mechanism for consuming your data

In order to work, thinner needs:

  - route-recognizer.js ([source](https://github.com/tildeio/route-recognizer))
  - rsvp.js ([source](https://github.com/tildeio/rsvp.js))
  - router.js ([source](https://github.com/tildeio/router.js))

Also you can include [RactiveJS](https://github.com/Rich-Harris/Ractive) and [jQuery](https://github.com/jquery/jquery) to
provide action handling and data-binding within your views.

## Installation

You can install **thinner** using NPM or Bower, just remember the dependencies for it.

**app.js**

```javascript
var app = thinner.setup({
  router: new Router()
}).scope();


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
```

[![Build Status](https://travis-ci.org/pateketrueke/thinner.png)](https://travis-ci.org/pateketrueke/thinner)
