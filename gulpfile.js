'use strict'

const gulp = require('gulp')
,     sass = require('gulp-sass')
,     concat = require('gulp-concat')
,     babel = require('gulp-babel')
,     autoprefixer = require('gulp-autoprefixer')
,     uglify = require('gulp-uglify')
,     plumber = require('gulp-plumber')
,     sourcemaps = require('gulp-sourcemaps')
,     browserSync = require('browser-sync').create()
,     notify = require('gulp-notify')
,     cleanCSS = require('gulp-clean-css');

const reload = browserSync.reload;

gulp.task('styles', () => {
    return gulp.src('dev/styles/**/*.scss')
        .pipe(plumber({
          errorHandler: notify.onError("Error: <%= error.message %>")
        }))
        .pipe(sourcemaps.init())
            .pipe(sass())
            .pipe(cleanCSS())
            .pipe(concat('style.css'))
            .pipe(autoprefixer('last 2 versions', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/styles/'))
        .pipe(reload({stream:true}));
});

gulp.task('watch', () => {
    gulp.watch('dev/styles/**/*.scss', ['styles']);
    gulp.watch('dev/scripts/*.js', ['scripts']);
    gulp.watch('public/*.html', reload);
});

gulp.task('scripts', () => {
    return gulp.src('dev/scripts/main.js')
        .pipe(plumber({
          errorHandler: notify.onError("Error: <%= error.message %>")
        }))
        .pipe(sourcemaps.init())
            .pipe(babel({
                presets:['es2015']
            }))
            .pipe(concat('main.min.js'))
            .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./public/scripts/'))
        .pipe(reload({stream:true}));
});

gulp.task('browser-sync', () => {
    browserSync.init({
        server: 'public'
    })
});

gulp.task('default', ['browser-sync', 'styles', 'scripts', 'watch']);

function onError(err) {
    console.log(err);
    this.emit('end');
}
