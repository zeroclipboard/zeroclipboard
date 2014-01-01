/*jshint -W106 */
/*jshint node:true */
module.exports = function(grunt) {
  'use strict';

  // Metadata
  var pkg = grunt.file.readJSON('package.json');

  // Shared configuration
  var localPort = 7320;  // "ZERO"

  // Project configuration.
  grunt.initConfig({
    // Task configuration
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      Gruntfile: ['Gruntfile.js'],
      js: ['src/javascript/ZeroClipboard/**/*.js'],
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/*.js']
      }
    },
    clean: {
      src: ['ZeroClipboard.*'],
      meta: ['bower.json', 'composer.json', 'LICENSE']
    },
    concat: {
      options: {
        stripBanners: true,
        process: {
          data: pkg
        }
      },
      js: {
        src: [
          'src/meta/source-banner.tmpl',
          'src/javascript/start.js',
          'src/javascript/ZeroClipboard/state.js',
          'src/javascript/ZeroClipboard/utils.js',
          'src/javascript/ZeroClipboard/flash.js',
          'src/javascript/ZeroClipboard/client.js',
          'src/javascript/ZeroClipboard/core.js',
          'src/javascript/ZeroClipboard/dom.js',
          'src/javascript/ZeroClipboard/event.js',
          'src/javascript/ZeroClipboard/deprecated.js',
          'src/javascript/end.js'
        ],
        dest: 'ZeroClipboard.js'
      }
    },
    uglify: {
      options: {
        preserveComments: 'some',
        report: 'min'
      },
      js: {
        options: {
          beautify: {
            beautify: true,
            // `indent_level` requires jshint -W106
            indent_level: 2
          },
          mangle: false,
          compress: false
        },
        src: ['ZeroClipboard.js'],
        dest: 'ZeroClipboard.js'
      },
      minjs: {
        src: ['ZeroClipboard.js'],
        dest: 'ZeroClipboard.min.js'
      }
    },
    mxmlc: {
      options: {
        rawConfig: '-static-link-runtime-shared-libraries=true'
      },
      swf: {
        files: {
          'ZeroClipboard.swf': ['src/flash/ZeroClipboard.as']
        }
      }
    },
    template: {
      options: {
        data: pkg
      },
      bower: {
        files: {
          'bower.json': ['src/meta/bower.json.tmpl']
        }
      },
      composer: {
        files: {
          'composer.json': ['src/meta/composer.json.tmpl']
        }
      },
      LICENSE: {
        files: {
          'LICENSE': ['src/meta/LICENSE.tmpl']
        }
      }
    },
    chmod: {
      options: {
        mode: '444'
      },
      src: ['ZeroClipboard.*'],
      meta: ['bower.json', 'composer.json', 'LICENSE']
    },
    connect: {
      server: {
        options: {
          port: localPort
        }
      }
    },
    qunit: {
      file: ['test/**/*.js.html'],
      http: {
        options: {
          urls: grunt.file.expand(['test/**/*.js.html']).map(function(testPage) {
            return 'http://localhost:' + localPort + '/' + testPage + '?noglobals=true';
          })
        }
      }
    },
    watch: {
      options: {
        spawn: false
      },
      Gruntfile: {
        files: '<%= jshint.Gruntfile %>',
        tasks: ['jshint:Gruntfile']
      },
      js: {
        files: '<%= jshint.js %>',
        tasks: ['jshint:js', 'unittest']
      },
      test: {
        files: '<%= jshint.test %>',
        tasks: ['jshint:test', 'unittest']
      }
    }
  });

  // These plugins provide necessary tasks
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-mxmlc');
  grunt.loadNpmTasks('grunt-template');
  grunt.loadNpmTasks('grunt-chmod');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');


  //
  // Task aliases and chains
  //

  grunt.registerTask('unittest', ['connect', 'qunit']);
  grunt.registerTask('test',     ['jshint', 'clean:src', 'concat', 'mxmlc', 'chmod:src', 'unittest']);
  grunt.registerTask('travis',   ['test']);

  // Default task
  grunt.registerTask('default',  ['jshint', 'clean', 'concat', 'uglify', 'mxmlc', 'template', 'chmod', 'unittest']);

};
