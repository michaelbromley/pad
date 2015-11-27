var gulp = require('gulp'),
    ts = require('gulp-typescript');

/**
 * This is used just for building and deploying the server to the /server folder.
 */
gulp.task('build-server', function() {
    return gulp.src([
            'typings/tsd.d.ts',
            'src/server/server.ts',
            'src/dataStore/padStore.ts',
            'src/app/common/model.ts'
        ])
        .pipe(ts({
        }))
        .pipe(gulp.dest('server'));
});