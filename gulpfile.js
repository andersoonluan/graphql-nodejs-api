const gulp = require('gulp');
const clean = require('gulp-clean');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');


// Tarefa de Scripts do Gulp
gulp.task('scripts', ['static'], () => {

    const tsResult = tsProject.src()
        .pipe(tsProject());

        return tsResult.js
            .pipe(gulp.dest('dist'));
});

gulp.task('static', ['clean'], () => {
    return gulp
        .src(['src/**/*.json'])
        .pipe(gulp.dest('dist'))
});

// Tarefa responsável por realizar limpeza.
gulp.task('clean', () => {

    return gulp
        .src('dist')
        .pipe(clean());

});

// Tarefa responsável por chamar as demais tasks
gulp.task('build', ['scripts']);


// Definir automaticamente a chamada do Build
gulp.task('watch', ['build'], () => {
    return gulp.watch(['src/**/*.ts', 'src/**/*.json'], ['build']);
})
gulp.task('default', ['watch']);