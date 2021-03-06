/*
  copy.js
  ===========
  copies images and javascript folders to public
*/

const gulp = require('gulp')

const config = require('./config.json')

gulp.task('copy-assets', function () {
  return gulp.src([
    `${config.paths.assets}/**`,
    `!${config.paths.assets}/sass/**`
  ])
    .pipe(gulp.dest(config.paths.public))
})

gulp.task('copy-component-assets', function () {
  return gulp.src([config.paths.components + '/**/*.js'])
    .pipe(gulp.dest(config.paths.public + 'javascripts/components'))
})
