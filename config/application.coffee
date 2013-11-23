# Exports an object that defines
#  all of the configuration needed by the projects'
#  depended-on grunt tasks.
#
# You can familiarize yourself with all of Lineman's defaults by checking out the parent file:
# https://github.com/testdouble/lineman/blob/master/config/application.coffee
#

# lineman-lib-template config options:

lineman = require(process.env["LINEMAN_MAIN"])
grunt = lineman.grunt
_ = grunt.util._

module.exports = lineman.config.extend "application",
  loadNpmTasks: [
    "grunt-browserify"
    "grunt-contrib-copy"
    "grunt-bower-task"
    "grunt-blanket"
  ]

  prependTasks:
    common: ["bower:install"]

  appendTasks:
    dist: ["copy:dist", "uglify:js"]
    common: ["concat:app", "concat:spec", "concat:testm", "concat:vendor", "browserify"]

  removeTasks:
    common: ["less", "handlebars", "jst", "images:dev", "webfonts:dev", "pages:dev", "concat"]
    dev: ["server"]
    dist: ["cssmin", "images:dist", "webfonts:dist", "pages:dist", "uglify"]

  watch:
    coffeeSpecs:
      tasks: ["coffee", "concat:spec", "blanket", "browserify"]

    lint:
      files: ["<%= files.js.app.files %>"]

    js:
      files: ["<%= files.js.app.files %>"]
      tasks: ["concat:app", "browserify"]

  clean:
    js:
      src: [
        "dist"
        "generated"
        "vendor/components"
      ]

  jshint:
    files: ["<%= files.js.app.files %>"]

  blanket:
    compile:
      options: {}
      files:
        "generated/coverage": "generated/js/app"

  coffee:
    options:
      bare: on

  bower:
    options:
      copy: off
      targetDir: "vendor/components"
    install: {}

  concat:
    vendor:
      src: "<%= files.js.vendor.files %>"
      dest: "<%= files.js.vendor.concatenated %>"

    testm:
      src: "<%= files.js.testm.files %>"
      dest: "<%= files.js.testm.concatenated %>"

    spec:
      src: "<%= files.js.specHelpers %>"
      dest: "<%= files.js.concatenatedHelpers %>"

    app:
      options:
        process: (src, filepath) ->
          _(src.split "\n").map((line) -> line.replace(/^\/\/!/, '')).join "\n"
      files:
        "<%= files.js.app.concatenated %>": "<%= files.js.app.files %>"

  copy:
    dist:
      files: [
        { src: "<%= files.js.app.concatenated %>", dest: "<%= files.js.app.concatenatedDist %>" }
      ]

  browserify:
    dev:
      files:
        "<%= files.js.app.concatenatedDev %>": "<%= files.coffee.generatedSpec %>"
      options:
        alias: [
          "generated/coverage/main.js:thinner"
        ]

  uglify:
    js:
      src: "<%= files.js.app.concatenatedDist %>"
      dest: "<%= files.js.app.minifiedDist %>"
