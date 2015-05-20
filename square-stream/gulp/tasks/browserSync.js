var browserSync = require('browser-sync').create();
var gulp        = require('gulp');
var fs          = require('fs');
var pkg         = require('../../package.json');

gulp.task('browserSync', ['build'], function() {
  browserSync.init({
    server: {
      baseDir: [pkg.folders.src, pkg.folders.dest]
    }
  });
});