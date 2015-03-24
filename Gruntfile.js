/* jshint node:true */
var path = require('path');
var saucelabsBrowsers = require(path.resolve('test', 'saucelabs-browsers.js'));

var sourceFiles = [
    'Gruntfile.js',
    'src/*.js',
    'src/**/*.js',
    'test/**/test.*.js'
];

module.exports = exports = function(grunt) {
    'use strict';

    var BANNER = '/*!\n' +
                 '    localForage -- Offline Storage, Improved\n' +
                 '    Version ' + grunt.file.readJSON('package.json').version + '\n' +
                 '    https://mozilla.github.io/localForage\n' +
                 '    (c) 2013-2015 Mozilla, Apache License 2.0\n' +
                 '*/\n';

    grunt.initConfig({
        concat: {
            options: {
                separator: ''
            },
            localforage: {
                files: {
                    'dist/localforage.js': [
                        // https://github.com/jakearchibald/es6-promise
                        'bower_components/es6-promise/promise.js',
                        'src/utils/**/*.js',
                        'src/drivers/**/*.js',
                        'src/localforage.js'
                    ],
                    'dist/localforage.nopromises.js': [
                        'src/utils/**/*.js',
                        'src/drivers/**/*.js',
                        'src/localforage.js'
                    ]
                },
                options: {
                    banner: BANNER
                }
            }
        },
        connect: {
            test: {
                options: {
                    base: '.',
                    hostname: '*',
                    port: 9999,
                    middleware: function(connect) {
                        return [
                            function(req, res, next) {
                                res.setHeader('Access-Control-Allow-Origin',
                                              '*');
                                res.setHeader('Access-Control-Allow-Methods',
                                              '*');

                                return next();
                            },
                            connect.static(require('path').resolve('.'))
                        ];
                    }
                }
            }
        },
        es3_safe_recast: {
            dist: {
                files: [{
                    src: ['dist/localforage.js'],
                    dest: 'dist/localforage.js'
                }]
            },
            nopromises: {
                files: [{
                    src: ['dist/localforage.nopromises.js'],
                    dest: 'dist/localforage.nopromises.js'
                }]
            }
        },
        jscs: {
            source: sourceFiles
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            source: sourceFiles
        },
        mocha: {
            unit: {
                options: {
                    urls: [
                        'http://localhost:9999/test/test.component.html',
                        'http://localhost:9999/test/test.nodriver.html',
                        'http://localhost:9999/test/test.main.html',
                        'http://localhost:9999/test/test.min.html',
                        'http://localhost:9999/test/test.require.html',
                        'http://localhost:9999/test/test.callwhenready.html',
                        'http://localhost:9999/test/test.customdriver.html'
                    ]
                }
            }
        },
        open: {
            site: {
                path: 'http://localhost:4567/'
            }
        },
        'saucelabs-mocha': {
            all: {
                options: {
                    username: process.env.SAUCE_USERNAME,
                    key: process.env.SAUCE_ACCESS_KEY,
                    urls: ['http://localhost:9999/test/test.main.html'],
                    tunnelTimeout: 5,
                    build: process.env.TRAVIS_JOB_ID,
                    concurrency: 3,
                    browsers: saucelabsBrowsers,
                    testname: 'localForage Tests'
                }
            }
        },
        shell: {
            options: {
                stdout: true
            },
            component: {
                command: path.resolve('node_modules', 'component', 'bin',
                                      'component-build') +
                         ' --dev -o test -n localforage.component'
            },
            'publish-site': {
                command: 'rake publish ALLOW_DIRTY=true'
            },
            'serve-site': {
                command: 'bundle exec middleman server'
            }
        },
        uglify: {
            localforage: {
                files: {
                    'dist/localforage.min.js': ['dist/localforage.js'],
                    'dist/localforage.nopromises.min.js': [
                        'dist/localforage.nopromises.js'
                    ],
                    'site/localforage.min.js': ['dist/localforage.js']
                },
                options: {
                    banner: BANNER
                }
            }
        },
        watch: {
            build: {
                files: ['src/*.js', 'src/**/*.js'],
                tasks: ['build']
            },
            /*jshint scripturl:true */
            'mocha:unit': {
                files: [
                    'dist/localforage.js',
                    'test/runner.js',
                    'test/test.*.*'
                ],
                tasks: ['jshint', 'jscs', 'shell:component', 'mocha:unit']
            }
        },
        umd: {
            // There is apparently no easy way to glob this but it should be
            // looked at again if this works.
            'localstorage': {
                src: 'src/drivers/localstorage.js',
                dest: 'umd/drivers/localstorage.js',
                objectToExport: 'localStorageWrapper',
                globalAlias: 'localStorageWrapper',
                deps: {
                    args: ['localforageSerializer'],
                    'default': ['localforageSerializer'],
                    'amd': ['../utils/serializer.js'],
                    'cjs': ['../utils/serializer.js']
                }
            },
            'indexeddb': {
                src: 'src/drivers/indexeddb.js',
                dest: 'umd/drivers/indexeddb.js',
                objectToExport: 'asyncStorage',
                globalAlias: 'asyncStorage'
            },
            'websql': {
                src: 'src/drivers/websql.js',
                dest: 'umd/drivers/websql.js',
                objectToExport: 'webSQLStorage',
                globalAlias: 'webSQLStorage',
                deps: {
                    args: ['localforageSerializer'],
                    'default': ['localforageSerializer'],
                    'amd': ['../utils/serializer.js'],
                    'cjs': ['../utils/serializer.js']
                }
            },
            'serializer': {
                src: 'src/utils/serializer.js',
                dest: 'umd/utils/serializer.js',
                objectToExport: 'localforageSerializer',
                globalAlias: 'localforageSerializer'
            },
            'localforage': {
                src: 'src/localforage.js',
                dest: 'umd/localforage.js',
                objectToExport: 'localforage',
                globalAlias: 'localforage',
                deps: {
                    args: [
                        'localStorageWrapper',
                        'asyncStorage',
                        'webSQLStorage',
                        'localforageSerializer'
                    ],
                    'default': [
                        'localStorageWrapper',
                        'asyncStorage',
                        'webSQLStorage',
                        'localforageSerializer'
                    ],
                    'amd': {
                        items:[
                            './utils/serializer.js',
                            './drivers/websql.js',
                            './drivers/localstorage.js',
                            './drivers/indexeddb.js'
                        ]
                    },
                    'cjs': {
                        items:[
                            './utils/serializer.js',
                            './drivers/websql.js',
                            './drivers/localstorage.js',
                            './drivers/indexeddb.js'
                        ]
                    }
                }
            }
        },
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('default', ['build', 'connect', 'watch']);
    grunt.registerTask('build', ['concat', 'es3_safe_recast', 'uglify']);
    grunt.registerTask('publish', ['build', 'shell:publish-site']);
    grunt.registerTask('serve', ['build', 'connect:test', 'watch']);
    grunt.registerTask('site', ['shell:serve-site']);

    var umdTasks = [
        'umd:localstorage',
        'umd:indexeddb',
        'umd:websql',
        'umd:serializer',
        'umd:localforage'
    ];
    grunt.registerTask('umdAll', umdTasks);

    // These are the test tasks we run regardless of Sauce Labs credentials.
    var testTasks = [
        'build',
        'jshint',
        'jscs',
        'shell:component',
        'connect:test',
        'mocha'
    ];
    grunt.registerTask('test:local', testTasks.slice());

    // Run tests using Sauce Labs if we are on Travis or have locally
    // available Sauce Labs credentials. Use `grunt test:local` to skip
    // Sauce Labs tests.
    // if (process.env.TRAVIS_JOB_ID ||
    //     (process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY)) {
    //     testTasks.push('saucelabs-mocha');
    // }

    grunt.registerTask('test', testTasks);
};
