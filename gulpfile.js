var gulp = require('gulp');
var browserSync = require('browser-sync');
var del = require('del');
var vinylPaths = require('vinyl-paths');
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

gulp.task('build', function () {
  browserify({
    entries: './src/index.js',
    debug: true
  })
    .transform(babelify)
    .bundle()
    .pipe(source('output.js'))
    .pipe(gulp.dest('./dist'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('copy', function () {
  gulp.src('src/index.html')
    .pipe(gulp.dest('./dist'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('browserSync', function () {
  browserSync({
    server: {
      baseDir: './dist'
    }
  });
});

gulp.task('watchFiles', function () {
  gulp.watch('src/index.html', ['copy']);
  gulp.watch('src/**/*.js', ['build']);
});

gulp.task('clean', function () {
  gulp.src('./dist', {read: false})
    .pipe(vinylPaths(del));
});


gulp.task('default', ['clean', 'copy', 'build', 'browserSync', 'watchFiles']);