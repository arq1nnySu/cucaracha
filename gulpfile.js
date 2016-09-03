var gulp = require('gulp');
var browserSync  = require('browser-sync');
var del = require('del');
var vinylPaths = require('vinyl-paths');
var babelify = require('babelify');
var browserify = require('browserify');
var path = require('path');
var merge = require('merge-stream');
var source = require('vinyl-source-stream');

var DIST = 'dist';

var dist = function(subpath) {
  return !subpath ? DIST : path.join(DIST, subpath);
};

gulp.task('build', function () {
  browserify({
    entries: './src/index.js',
    debug: true
  })
    .transform(babelify)
    .bundle()
    .pipe(source('output.js'))
    .pipe(gulp.dest(dist()))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('copy', function () {
  var app = gulp.src([
    'src/**/*'
    ], {
      dot: true
    }).pipe(gulp.dest(dist()))

    var bower = gulp.src([
      'bower_components/**/*'
    ]).pipe(gulp.dest(dist('bower_components')));

    return merge(app, bower)
    .pipe(browserSync.reload({stream: true}));
});


gulp.task('browserSync', function () {
  browserSync({
    server: {
      baseDir: dist()
    }
  });
});

gulp.task('watchFiles', function () {
  gulp.watch('src/**/*.html', ['copy']);
  gulp.watch('src/**/*.js', ['build']);
});

gulp.task('clean', function () {
  gulp.src('./dist', {read: false})
    .pipe(vinylPaths(del));
});


gulp.task('default', ['clean', 'copy', 'build', 'browserSync', 'watchFiles']);