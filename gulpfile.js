var autoprefixer = require('gulp-autoprefixer');
var babel = require('gulp-babel');
var browserify = require('browserify');
var browserSync = require('browser-sync');
var buffer = require('vinyl-buffer');
var cache = require('gulp-cache');
var cleanCSS = require('gulp-clean-css');
var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var eslint = require('gulp-eslint');

gulp.task('jekyll-watch', function (gulpCallBack) {
  var spawn = require('child_process').spawn;
  var jekyll = spawn('bundle', ['exec', 'jekyll','build', '--incremental', '--watch'], { stdio: 'inherit' });

  jekyll.on('exit', function (code) {
    gulpCallBack(code === 0 ? null : 'ERROR: Jekyll process exited with code: ' + code);
  });
});

gulp.task('jekyll-build', function (gulpCallBack) {
  var spawn = require('child_process').spawn;
  var jekyll = spawn('bundle', ['exec', 'jekyll','build', '--incremental'], { stdio: 'inherit' });

  jekyll.on('exit', function (code) {
    gulpCallBack(code === 0 ? null : 'ERROR: Jekyll process exited with code: ' + code);
  });
});

gulp.task('browser-sync', function () {
  browserSync({
    server: {
      baseDir: '_site/'
    }
  });
});

gulp.task('bs-reload', function () {
  browserSync.reload();
});

gulp.task('images', function () {
  gulp.src('_assets/images/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('assets/images/'));
});

gulp.task('styles', function () {
  gulp.src(['_assets/styles/**/*.scss'])
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
      }
    }))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoprefixer('last 2 versions'))
    .pipe(gulp.dest('assets/styles/'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('assets/styles/'))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('eslint', function () {
  // ESLint ignores files with "node_modules" paths.
  // So, it's best to have gulp ignore the directory as well.
  // Also, Be sure to return the stream from the task;
  // Otherwise, the task may end before the stream has finished.
  return gulp.src(['_assets/scripts/**/*.js', '!node_modules/**'])
    // eslint() attaches the lint output to the "eslint" property
    // of the file object so it can be used by other modules.
    .pipe(eslint())
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe(eslint.format())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failAfterError last.
    .pipe(eslint.failAfterError());
});

gulp.task('scripts', function () {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: '_assets/scripts/entry.js',
    debug: true
  });

  return b.bundle()
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
      }
    }))
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(babel())
    .pipe(gulp.dest('assets/scripts/'))
    .pipe(sourcemaps.init({ loadMaps: true }))
    // Add transformation tasks to the pipeline here.
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('assets/scripts/'))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('dev', ['jekyll-watch', 'styles', 'eslint', 'scripts', 'browser-sync'], function () {
  gulp.watch('_assets/styles/**/*.scss', ['styles', 'bs-reload']);
  gulp.watch('_assets/scripts/**/*.js', ['eslint', 'scripts', 'bs-reload']);
  gulp.watch('*.html', ['bs-reload']);
});

gulp.task('test', ['jekyll-build', 'styles', 'eslint', 'scripts']);
