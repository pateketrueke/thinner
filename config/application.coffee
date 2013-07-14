# Exports an object that defines
#  all of the configuration needed by the projects'
#  depended-on grunt tasks.
#
# You can familiarize yourself with all of Lineman's defaults by checking out the parent file:
# https://github.com/testdouble/lineman/blob/master/config/application.coffee
#

# lineman-lib-template config options:

includeVendorInDistribution = false #set to true if you want your distribution to contain JS files in vendor/js

lineman = require(process.env["LINEMAN_MAIN"])
grunt = lineman.grunt
_ = grunt.util._
application = lineman.config.extend "application",

  loadNpmTasks: [
    "grunt-contrib-copy"
    "grunt-bower-task"
    "grunt-blanket"
  ]

  prependTasks:
    common: ["bower:install"]

  appendTasks:
    dist: ["copy"]

  removeTasks:
    common: ["less", "handlebars", "jst", "images:dev", "webfonts:dev", "pages:dev"]
    dev: ["server"]
    dist: ["cssmin", "images:dist", "webfonts:dist", "pages:dist"]


  watch:
    coffee:
      tasks: ["coffee", "concat"]

    lint:
      files: ["<%= files.js.app.files %>"]

    js:
      files: ["<%= files.js.vendor.files %>", "<%= files.js.app.files %>"]
      tasks: ["concat"]

  clean:
    js:
      src: [
        "coverage"
        "<%= files.coffee.generated %>"
        "<%= files.coffee.generatedSpec %>"
        "<%= files.js.vendor.concatenated %>"
        "<%= files.js.app.concatenated %>"
        "<%= files.js.concatenatedSpec %>"
      ]

  jshint:
    files: ["<%= files.js.app.files %>"]

  blanket:
    compile:
      options: {}
      files:
        "coverage/": "generated/js/app/"

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

    app:
      src: [
        "<%= files.coffee.generated %>"
        "<%= files.js.app.files %>"
      ]
      dest: "<%= files.js.app.concatenated %>"

  uglify:
    js:
      src: ["<%= files.js.app.concatenated %>"]
      dest: "<%= files.js.app.minifiedDist %>"

  copy:
    dist:
      options:
        flatten: on
      files:
        "<%= files.js.app.concatenatedDist %>": "<%= files.js.app.concatenated %>"


delete application.concat.css
delete application.concat.js

module.exports = application
