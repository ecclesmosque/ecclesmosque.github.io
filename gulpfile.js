
var autoprefixer = require('gulp-autoprefixer');
var babel = require('gulp-babel');
var browserify = require('browserify');
var browserSync = require('browser-sync').create();
var buffer = require('vinyl-buffer');
var cache = require('gulp-cache');
var cleanCSS = require('gulp-clean-css');
var del = require('del'); // rm -rf
var eslint = require('gulp-eslint');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var imagemin = require('gulp-imagemin');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var sass = require('gulp-sass');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var watchify = require('watchify');

require('gulp-graph')(gulp);

var config = {
  jekyll: ['pages', 'posts', 'layouts', 'includes', 'data'],
  JEKYLL_ENV: 'development'
};

function isProduction() {
  return config.JEKYLL_ENV === 'production';
}

gulp.task('clean', function () {
  return del.sync(['_site', 'assets/styles', 'assets/scripts']);
});

gulp.task('jekyll-compile', [], function (next) {
  var spawn = require('child_process').spawn;

  // clone the actual env vars to avoid overrides
  var envs = Object.create(process.env);
  envs.JEKYLL_ENV = config.JEKYLL_ENV;

  var jekyll = spawn('bundle', ['exec', 'jekyll', 'build', '--incremental'], { stdio: 'inherit', env: envs });

  jekyll.on('exit', function (code) {
    next(code === 0 ? null : 'ERROR: Jekyll process exited with code: ' + code);
  });
});

gulp.task('html-proofer', ['jekyll-compile', 'styles', 'scripts'], function (next) {
  if (config.JEKYLL_ENV === 'production') {
    next(null);
  } else {
    var spawn = require('child_process').spawn;
    var htmlproofer = spawn('bundle',
      [
        'exec',
        'htmlproofer',
        '--url-swap',
        '.*ecclesmosque.org.uk/:/',
        './_site'
      ], { stdio: 'inherit' });

    htmlproofer.on('exit', function (code) {
      next(code === 0 ? null : 'ERROR: htmlproofer process exited with code: ' + code);
    });
  }
});

gulp.task('serve', ['build'], function () {
  browserSync.init({
    server: '_site'
  });

  config.jekyll.forEach(function (conentType) {
    gulp.watch('_' + conentType + '/**/*.*', ['jekyll-compile']);
  });

  gulp.watch('_config.yml', ['jekyll-compile']);
  gulp.watch('_assets/styles/**/*.scss', ['styles']);
  gulp.watch('_assets/scripts/**/*.js', ['eslint', 'scripts']);

  gulp.watch('_site/*.html').on('change', browserSync.reload);
});

gulp.task('serve-prod', ['setup-environment', 'build'], function () {
  browserSync.init({
    server: '_site'
  });
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
        console.log('Task - styles:', error);
        this.emit('end');
      }
    }))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(replace(/\.\.\/font\//igm, '/assets/fonts/')) // fix for https://github.com/fontello/fontello/issues/573
    .pipe(autoprefixer('last 2 versions'))
    .pipe(sourcemaps.init())
    .pipe(gulpif(isProduction, rename({ suffix: '.min' })))
    .pipe(gulpif(isProduction, cleanCSS()))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('_site/assets/styles/')) // for BrowserSync
    .pipe(gulp.dest('assets/styles/')) // for pruduction
    .pipe(browserSync.stream({match: '**/*.css'}));
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
    cache: {},
    packageCache: {},
    plugin: [watchify],
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
    .pipe(sourcemaps.init())
    // Add transformation tasks to the pipeline here.
    .pipe(gulpif(isProduction, rename({ suffix: '.min' })))
    .pipe(gulpif(isProduction, uglify()))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('assets/scripts/'))
    .pipe(browserSync.stream({match: '**/*.js'}));
});

gulp.task('icons-update', [], function (next) {
  var spawn = require('child_process').spawn;

  var fontello = spawn('fontello-cli', [
    'open',
    '--config', './_assets/icons/config.json'
  ]);

  fontello.on('exit', function (code) {
    next(code === 0 ? null : 'ERROR: fontello-cli process exited with code: ' + code);
  });
});

gulp.task('icons-download', [], function (next) {
  var spawn = require('child_process').spawn;

  var fontello = spawn('fontello-cli', [
    'install',
    '--config', './_assets/icons/config.json',
    '--font', './assets/fonts',
    '--css', './_assets/styles/icons'
  ]);

  fontello.on('exit', function (code) {
    // rename *.css files to _*.scss
    if (code === 0) {
      gulp.src('./_assets/styles/icons/**/*.css')
      .pipe(rename(function (path) {
        path.basename = '_' + path.basename;
        path.extname = '.scss';
      }))
      .pipe(gulp.dest('./_assets/styles/icons/'))
      .on('end', function () {
        del.sync(['./_assets/styles/icons/**/*.css']);
        next(null);
      });
    } else {
      next('ERROR: fontello-cli process exited with code: ' + code);
    }
  });
});

gulp.task('build', ['clean', 'jekyll-compile', 'html-proofer', 'styles', 'eslint', 'scripts']);

gulp.task('setup-environment', function () {
  config.JEKYLL_ENV = 'production';
});

function terminate() {
  gulp.on('stop', () => { process.exit(0); });
  gulp.on('err', () => { process.exit(1); });
}

gulp.task('build-prod', ['setup-environment', 'build'], function (next) {
  next(terminate());
});

gulp.task('test', ['build'], function (next) {
  next(terminate());
});

gulp.task('default', ['serve']);
