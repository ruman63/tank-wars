let gulp = require('gulp');
let browserify = require('gulp-browserify');
let watch = require('gulp-watch');

gulp.task("build-js", function() {
    return gulp.src('assets/js/main.js')
        .pipe(browserify())
        .pipe(gulp.dest('js'))
});

gulp.task("watch", function() {
    watch("assets/js/**/*.js", function() {
        gulp.start("build-js");
    });
});