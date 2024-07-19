const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const sass = require('gulp-sass')(require('sass'))
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const minimist = require('minimist')
const browserSync = require('browser-sync').create()

let envOptions = {
  string: 'env',
  default: {
    env: 'develop',
  },
}

let options = minimist(process.argv.slice(2), envOptions)

gulp.task('pug', () => {
  return gulp.src('./src/*.pug').pipe($.pug()).pipe(gulp.dest('./dist/'))
})

gulp.task('scss', () => {
  return gulp
    .src('./src/scss/*.scss')
    .pipe($.sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe($.postcss([autoprefixer()]))
    .pipe($.if(options.env === 'prod', $.postcss([cssnano()])))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/css'))
})

gulp.task('babel', () => {
  return gulp
    .src('./src/js/*.js')
    .pipe($.sourcemaps.init())
    .pipe(
      $.babel({
        presets: ['@babel/env'],
      })
    )
    .pipe($.concat('all.js'))
    .pipe($.if(options.env === 'prod', $.uglify()))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/js'))
})

gulp.task('image', () => {
  return gulp.src('./src/image/*', { encoding: false }).pipe(gulp.dest('./dist/image'))
})

gulp.task('clean', () => {
  return gulp.src('./dist', { read: false }).pipe($.clean())
})

gulp.task('browser-sync', function () {
  browserSync.init({
    server: {
      baseDir: './dist',
    },
    port: 8080,
  })
})

gulp.task(
  'watch',
  gulp.parallel('browser-sync', () => {
    gulp.watch('./src/*.pug', gulp.series('pug'))
    gulp.watch('./src/scss/*.scss', gulp.series('scss'))
    gulp.watch('./src/js/*.js', gulp.series('babel'))
  })
)

gulp.task('bulid', gulp.series('clean', 'pug', 'scss', 'babel', 'image'))

gulp.task('default', gulp.series('pug', 'scss', 'babel', 'image', 'watch'))
