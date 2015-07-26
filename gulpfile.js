var gulp = require('gulp'),
    react = require('gulp-react'),
    babel = require('gulp-babel');


gulp.task('jsx', function() {
    return gulp.src([
        'src/**/*.jsx',
        'src/**/*.js'
    ])
        //.pipe(react())
        .pipe(babel({
            modules: 'system'
        }))
        .pipe(gulp.dest('build/'));
});

gulp.task('index', function() {
    return gulp.src('src/index.html')
        .pipe(gulp.dest('build/'));
});

gulp.task('watch', ['jsx', 'index'], function() {
   gulp.watch(['src/**/*.jsx', 'src/**/*.js'], ['jsx']);
   gulp.watch('src/index.html', ['index']);
});

gulp.task('default', ['jsx', 'index']);