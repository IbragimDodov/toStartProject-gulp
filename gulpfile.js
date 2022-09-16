const gulp = require('gulp');
const less = require('gulp-less');
const stylus = require('gulp-stylus');
const sass = require('gulp-sass')(require('sass'));
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
const ts = require('gulp-typescript');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const htmlmin = require('gulp-htmlmin');
const size = require('gulp-size');
const gulpPug = require('gulp-pug');
const newer = require('gulp-newer');
const browserSync = require('browser-sync').create();
const del = require('del');

const paths = {
  pug: {
    src: './*.pug',
    dest: 'dist/'
  },
  html: {
    src: './*.html',
    dest: 'dist/'
  },
  styles: {
    src: ['src/styles/**/*.sass', 'src/styles/**/*.scss', 'src/styles/**/*.styl', 'src/styles/**/*.less'],
    dest: 'dist/css/'
  },
  scripts: {
    src: ['src/scripts/**/*.ts', 'src/scripts/**/*.js'],
    dest: 'dist/js/'
  },
  images: {
    src: 'src/img/**',
    dest: 'dist/img/'
  }
}

function clean() {
  return del(['dist/*', '!dist/img']) // всё будет удалено кроме ----> '!dist/img' 
}

function pug() {
  return gulp.src(paths.pug.src)
    .pipe(gulpPug())
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest(paths.pug.dest))
    .pipe(browserSync.stream())
}

function html() {
  return gulp.src(paths.html.src)
    // .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.stream())
}

function styles() {
  return gulp.src(paths.styles.src)
    .pipe(sourcemaps.init()) //должен быть вторым, после src
    // .pipe(less())
    // .pipe(stylus())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      cascade: false
    }))
    // .pipe(cleanCSS({level: 2}))
    .pipe(rename({
      basename: 'main',
      suffix: '.min'
    }))
    .pipe(sourcemaps.write('.')) //должен быть предпоследним, перед dest
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream())
}

function scripts() {
  return gulp.src(paths.scripts.src)
  .pipe(sourcemaps.init()) //должен быть вторым, после src
  // .pipe(ts({                    // если используем typescript
  //   noImplicitAny: true,
  //   outFile: 'main.min.js'
  // }))
  .pipe(babel({
    presets: ['@babel/env']
  }))
  // .pipe(uglify())
  .pipe(concat('main.min.js'))
  .pipe(sourcemaps.write('.')) //должен быть предпоследним, перед dest
  .pipe(size({
    showFiles: true
  }))
  .pipe(gulp.dest(paths.scripts.dest))
  .pipe(browserSync.stream())
}

function img() {
  return gulp.src(paths.images.src)
    .pipe(newer(paths.images.dest))
    .pipe(imagemin({
      progressive: true
    }))
    .pipe(size({
      showFiles: true
    }))
    .pipe(gulp.dest(paths.images.dest))
}

function watch() {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  })
  gulp.watch(paths.html.dest).on('change', browserSync.reload) 
  // gulp.watch(paths.pug.dest).on('change', browserSync.reload)  // Если используем pug
  gulp.watch(paths.html.src, html)
  // gulp.watch(paths.pug.src, pug) // Если используем pug
  gulp.watch(paths.styles.src, styles)
  gulp.watch(paths.scripts.src, scripts)
  gulp.watch(paths.images.src, img)
}

const build = gulp.series(clean, html, gulp.parallel(styles, scripts, img), watch)
// const build = gulp.series(clean, pug, gulp.parallel(styles, scripts, img), watch) // Если используем pug 


exports.clean = clean;
exports.img = img;
exports.pug = pug;
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.watch = watch;
exports.build = build;
exports.default = build;