let gulp = require('gulp');
let browserify = require('gulp-browserify');
let watch = require('gulp-watch');

gulp.task("js", function() {
    return gulp.src('src/assets/js/main.js')
        .pipe(browserify())
        .pipe(gulp.dest('dist/js'))
});

gulp.task("copy", function() {
    return gulp.src(["src/**/*.html", "src/**/*.css", "src/img/**"], {base: 'src'})
        .pipe(gulp.dest('dist/'));
})

gulp.task("watch", function() {
    gulp.start(["js", "copy"]); 
    watch("src/assets/**/*.js", function() {
        gulp.start("js");
    });
});