var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync  = require('browser-sync');
var reload = browserSync.reload;
var del = require('del');
var vinylPaths = require('vinyl-paths');
var runSequence = require('run-sequence');
var babelify = require('babelify');
var historyApiFallback = require('connect-history-api-fallback');
var browserify = require('browserify');
var path = require('path');
var merge = require('merge-stream');
var source = require('vinyl-source-stream');

var DIST = 'dist';


var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

var dist = function(subpath) {
  return !subpath ? DIST : path.join(DIST, subpath);
};

var styleTask = function(stylesPath, srcs) {
  return gulp.src(srcs.map(function(src) {
      return path.join('src', stylesPath, src);
    }))
    .pipe($.changed(stylesPath, {extension: '.css'}))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe($.minifyCss())
    .pipe(gulp.dest(dist(stylesPath)))
    .pipe($.size({title: stylesPath}));
};

var optimizeHtmlTask = function(src, dest) {
  var assets = $.useref();

  return gulp.src(src)
    .pipe(assets)
    // Concatenate and minify JavaScript
    .pipe($.if('*.js', $.uglify({
      preserveComments: 'some'
    })))
    // Concatenate and minify styles
    // In case you are still using useref build blocks
    .pipe($.if('*.css', $.minifyCss()))
    .pipe($.useref())
    // Minify any HTML
    .pipe($.if('*.html', $.minifyHtml({
      quotes: true,
      empty: true,
      spare: true
    })))
    // Output files
    .pipe(gulp.dest(dest))
    .pipe($.size({
      title: 'html'
    }));
};

// Compile and automatically prefix stylesheets
gulp.task('styles', function() {
  return styleTask('styles', ['**/*.css']);
});

// Ensure that we are not missing required files for the project
// "dot" files are specifically tricky due to them being hidden on
// some systems.
gulp.task('ensureFiles', function(cb) {
  var requiredFiles = ['.bowerrc'];

  ensureFiles(requiredFiles.map(function(p) {
    return path.join(__dirname, p);
  }), cb);
});


gulp.task('build', function () {
  var index = browserify({
    entries: ['./src/index.js'],
    debug: true
  })
    .transform(babelify)
    .bundle()
    .pipe(source('output.js'))
    .pipe(gulp.dest(dist()))
    .pipe(browserSync.reload({stream: true}));

    // var elements = browserify({
    //   entries: ['./src/elements/elements.js'],
    //   debug: true
    // })
    // .transform(babelify)
    // .bundle()
    // .pipe(source('elements.js'))
    // .pipe(gulp.dest(dist("elements")))
    // .pipe(browserSync.reload({stream: true}));
});

// Transpile all JS to ES5.
gulp.task('js', function() {
  return gulp.src(['src/elements/*.{js,html}'])
   .pipe($.sourcemaps.init())
   .pipe($.if('*.html', $.crisper({scriptInHead: false}))) // Extract JS from .html files
   .pipe($.if('*.js', $.babel({
     presets: ['es2015']
   })))
   .pipe($.sourcemaps.write('.'))
   .pipe(gulp.dest(dist("elements")));
});

gulp.task('copy', function () {
  return gulp.src([
    'src/index.html',
    '!src/elements',
    '!src/bower_components',
    '!**/.DS_Store'
  ], {
      dot: true
    }).pipe(gulp.dest(dist()))
});

gulp.task('copyBower', function () {
  return gulp.src([
    'bower_components/**/*'
  ]).pipe(gulp.dest(dist('bower_components')));
});

// Watch files for changes & reload
gulp.task('serve', ['default'], function() {
  browserSync({
    port: 3000,
    notify: false,
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function(snippet) {
          return snippet;
        }
      }
    },
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: {
      baseDir: ['dist'],
      middleware: [historyApiFallback()]
    }
  });

  gulp.watch(['src/**/*.html'], ['copy', 'vulcanize']);
  gulp.watch(['src/styles/**/*.css'], ['styles']);
  gulp.watch(['src/**/*.js'], ['build']);
  gulp.watch(['src/images/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function() {
  browserSync({
    port: 3001,
    notify: false,
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function(snippet) {
          return snippet;
        }
      }
    },
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: dist(),
    middleware: [historyApiFallback()]
  });
});


gulp.task('browserSync', function () {
  browserSync({
    port: 3000,
    notify: false,
    server: {
      baseDir: ['src'],
    }
  });
});

gulp.task('watchFiles', function () {
  gulp.watch(['app/**/*.html', '!app/bower_components/**/*.html'], ['js', reload]);
  gulp.watch(['app/styles/**/*.css'], ['styles', reload]);
  gulp.watch(['app/scripts/**/*.js'], reload);
  gulp.watch(['app/images/**/*'], reload);
});

// Scan your HTML for assets & optimize them
gulp.task('html', function() {
  return optimizeHtmlTask(
    ['dist/**/*.html', '!dist/{elements,test,bower_components}/**/*.html'],
    dist());
});



// Vulcanize granular configuration
gulp.task('vulcanize', function() {
  return gulp.src('./src/elements/elements.html')
    .pipe($.vulcanize({
      stripComments: true,
      inlineCss: true,
      inlineScripts: true
    }))
    .pipe(gulp.dest(dist('elements')))
    .pipe($.size({title: 'vulcanize'}));
});


// Clean output directory
gulp.task('clean', function() {
  return del([dist()]);
});

// Build production files, the default task
gulp.task('default', ['clean'], function(cb) {
  // Uncomment 'cache-config' if you are going to use service workers.
  runSequence(
    ['copy', 'copyBower', 'styles'],
    ['html'],
    'build',
    // 'js',
    'vulcanize', // 'cache-config',
    cb);
});



// gulp.task('default', ['clean', 'copy', 'build', 'browserSync', 'watchFiles']);