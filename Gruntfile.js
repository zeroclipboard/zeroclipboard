/*jshint -W106 */
module.exports = function(grunt) {

  // Metadata
  var pkg = grunt.file.readJSON('package.json');

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
      dist: ['ZeroClipboard.*', 'bower.json', 'LICENSE']
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
          'src/javascript/ZeroClipboard/utils.js',
          'src/javascript/ZeroClipboard/client.js',
          'src/javascript/ZeroClipboard/core.js',
          'src/javascript/ZeroClipboard/dom.js',
          'src/javascript/ZeroClipboard/event.js',
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
      dist: ['ZeroClipboard.*', 'bower.json', 'LICENSE']
    },
    nodeunit: {
      all: ['test/*.js']
    }
  });

  // These plugins provide necessary tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-mxmlc');
  grunt.loadNpmTasks('grunt-chmod');
  grunt.loadNpmTasks('grunt-template');


  //
  // Task aliases and chains
  //

  // Default task
  grunt.registerTask('default', ['jshint', 'clean', 'concat', 'uglify', 'mxmlc', 'template', 'chmod', 'nodeunit']);

  // Other tasks
  grunt.registerTask('test',   ['jshint', 'nodeunit']);
  grunt.registerTask('travis', ['test']);

};
