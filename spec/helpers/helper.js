var root = this;

root.context = root.describe;
root.xcontext = root.xdescribe;
root._$blanket = root._$jscoverage;

root.element = function (name) { return document.createElement(name); };

root.delay = function (resume, callback) {
  setTimeout(function () {
    callback();
    resume();
  }, 260);
};
