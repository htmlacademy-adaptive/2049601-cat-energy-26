import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import minify from 'gulp-csso';
import htmlmin from 'gulp-htmlmin';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import rename from 'gulp-rename';
import del from 'del';
import svgmin from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import squoosh from 'gulp-libsquoosh';
import webp from 'gulp-webp';
import terser from 'gulp-terser';
import csso from 'postcss-csso';

// Styles

export const styles = () => {
  return gulp.src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

//HTML

const html = () => {
  return gulp.src('source/*.html')
  .pipe(gulp.dest('build'))
}

//Scripts

const scripts = () => {
  return gulp.src('source/js//*.js')
  .pipe(terser())
  .pipe(gulp.dest('build/js'))
}

//Images

const optimizeImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
  .pipe(squoosh())
  .pipe(gulp.dest('build/img'))
}

const copyImages = () => {
  return gulp.src('source/img/**/*.{jpg,png,svg}')
  .pipe(gulp.dest('build/img'))
}

//Webp

const createWebp = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
  .pipe(squoosh({webp: {}}))
  .pipe(gulp.dest('build/img'))
}

//SVG

const svg = () => {
  return gulp.src(['source/img/*.svg, !source/img/sprite/*.svg]'])
  .pipe(svgmin())
  .pipe(gulp.dest('build/img'))
}

const sprite = () => {
  return gulp.src('source/img/sprite/*.svg')
  .pipe(svgmin())
  .pipe(svgstore({ inlineSvg: true }))
  .pipe(rename("sprite.svg"))
  .pipe(gulp.dest("build/img"))
}
//Copy

const copy = (done) => {
  gulp.src([
  "source/fonts/*.{woff2,woff}",
  "source/*.ico",
  "source/*.webmanifest",
  ], {
  base: "source"
  })
  .pipe(gulp.dest("build"))
  done();
}

//Clean

const clean = () => {
  return del("build");
};

// Server

function server(done) {
  browser.init({
    server: {
      baseDir: 'source'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

//Reloud

const reload = (done) => {
  browser.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles));
  gulp.watch('source/js/*.js', gulp.series(scripts));
  gulp.watch('source/*.html', gulp.series(html, reload));
}

//Build

export const build  = gulp.series (
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    createWebp,
    svg,
    sprite
  ),
);

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    createWebp,
    svg,
    sprite
  ),
  gulp.series(
    server,
    watcher
  )
);
