var root = this;

root.context = root.describe;
root.xcontext = root.xdescribe;
root._$blanket = root._$jscoverage = {};

// TODO: jQuery WAT

root.delay = function (resume, callback) {
  setTimeout(function () {
    callback();
    resume();
  }, 260);
};
