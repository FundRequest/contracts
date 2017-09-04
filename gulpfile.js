var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');

var paths = {
    images: ['app/**/*.png', 'app/**/*.jpg', 'app/**/*.ico'],
    scripts: ['app/js/**/**.js', 'node_modules/truffle-contract/build/truffle-contract.js', 'node_modules/web3/build/web3.js'],
    fonts: ['app/**/*.eot', 'app/**/*.svg', 'app/**/*.woff', 'app/**/*.woff2', 'app/**/*.ttf', 'app/**/*.otf'],
    css: ['app/css/reset.css', 'app/css/font-awesome.min.css', 'app/css/general.css', 'app/css/countdown.css', 'app/css/app.css'],
    pages: ['app/**/**.html'],
    contracts: ["app/contracts/*.json"]
};

var destination = 'build';

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use any package available on npm
gulp.task('clean', function() {
    // You can use multiple globbing patterns as you would with `gulp.src`
    return del([destination]);
});

gulp.task('images', function() {
    return gulp.src(paths.images)
    // Pass in options to the task
        .pipe(gulp.dest(destination));
});

gulp.task('fonts', function() {
    return gulp.src(paths.fonts)
    // Pass in options to the task
        .pipe(gulp.dest(destination));
});

gulp.task('css', function() {
    return gulp.src(paths.css)
        .pipe(concat('main-1.0.css'))
        // Pass in options to the task
        .pipe(gulp.dest(destination + '/css'));
});

gulp.task('scripts', function() {
    return gulp.src(paths.scripts)
    // Pass in options to the task
        .pipe(gulp.dest(destination + '/js'));
});

gulp.task('pages', function() {
    return gulp.src(paths.pages)
    // Pass in options to the task
        .pipe(gulp.dest(destination));
});

gulp.task('contracts', function() {
    return gulp.src(paths.contracts)
    // Pass in options to the task
        .pipe(gulp.dest(destination + '/contracts'));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['scripts']);
    gulp.watch(paths.pages, ['pages']);
    gulp.watch(paths.css, ['css']);
    gulp.watch(paths.images, ['images']);
});

gulp.task('set-dist', function() {
    return destination = 'dist';
});

gulp.task('set-build', function() {
    return destination = 'build';
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['pages', 'css', 'scripts', 'fonts', 'images', 'contracts', 'watch']);

gulp.task('build', ['set-build', 'pages', 'css', 'scripts', 'fonts', 'images', 'contracts']);

gulp.task('dist', ['set-dist', 'pages', 'css', 'scripts', 'fonts', 'images', 'contracts']);
