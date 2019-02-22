
var autoprefixer = require('gulp-autoprefixer');
var babel = require('gulp-babel');
var browserify = require('browserify');
var browserSync = require('browser-sync').create();
var buffer = require('vinyl-buffer');
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
var childProcess = require('child_process');

var config = {
  jekyll: ['pages', 'posts', 'layouts', 'includes', 'data'],
  JEKYLL_ENV: 'development',
  domains: {
    default: 'ecclesmosque.org.uk',
    alias: ['ecclesmosque.org.uk', 'ecclesmosque.org']
  }
};

function isProduction() {
  return config.JEKYLL_ENV === 'production';
}

gulp.task('clean', function () {
  return del(['_site', 'assets/styles', 'assets/scripts', 'npm-debug.log']);
});

gulp.task('scripts', function () {
  // set up the browserify instance on a task basis
  var b = browserify({
    cache: {},
    packageCache: {},
    plugin: !isProduction() ? [watchify] : [],
    entries: '_assets/scripts/app.js',
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
    .pipe(gulpif(isProduction(), rename({ suffix: '.min' })))
    .pipe(gulpif(isProduction(), uglify()))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('assets/scripts/'))
    .pipe(browserSync.stream({ match: '**/*.js' }));
});

gulp.task('jekyll-compile', gulp.series('scripts', function (next) {
  // clone the actual env vars to avoid overrides
  var envs = Object.create(process.env);
  envs.JEKYLL_ENV = config.JEKYLL_ENV;

  return childProcess.spawn('bundle',
    ['exec', 'jekyll', 'build', !isProduction() ? '--drafts' : '', isProduction() ? '--profile' : '', '--incremental'],
    { stdio: 'inherit', env: envs }
  ).on('exit', function (code) {
    next(code === 0 ? null : 'ERROR: Jekyll process exited with code: ' + code);
  });
}));

gulp.task('images', function () {
  return gulp.src('_assets/images/**/*')
    .pipe(plumber({
      errorHandler: function (error) {
        console.log('Task - images:', error);
        this.emit('end');
      }
    }))
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest('assets/images/'));
});


gulp.task('styles', function () {
  return gulp.src(['_assets/styles/**/*.scss'])
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
    .pipe(gulpif(isProduction(), rename({ suffix: '.min' })))
    .pipe(gulpif(isProduction(), cleanCSS()))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('_site/assets/styles/')) // for BrowserSync
    .pipe(gulp.dest('assets/styles/')) // for pruduction
    .pipe(browserSync.stream({ match: '**/*.css' }));
});

gulp.task('html-proofer', gulp.series('jekyll-compile', 'images', 'styles', 'scripts'), function (next) {
  function doHTMLProof(next) {
    var proofer = childProcess.spawn('bundle',
      [
        'exec',
        'htmlproofer',
        '--url-swap',
        '.*' + config.domains.default + '/:/',
        '--internal-domains',
        config.domains.alias.join(','),
        './_site'
      ],
      { stdio: 'inherit' }
    );

    proofer.on('exit', function (code) {
      if (code !== 0) {
        console.log('ERROR: htmlproofer process exited with code: ' + code);
        this.emit('end');
      }
      next(null);
    });
  }

  if (!isProduction()) {
    next(null);
  } else {
    return doHTMLProof(next);
  }
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

gulp.task('compile', gulp.series('clean', 'eslint', 'scripts', 'images', 'styles', 'jekyll-compile'));

gulp.task('serve', gulp.series('compile', function (next) {
  browserSync.init({
    server: '_site'
  });

  config.jekyll.forEach(function (contentType) {
    gulp.watch('**/_' + contentType + '/**/*.*', gulp.series('jekyll-compile'));
  });

  gulp.watch('_config.yml', gulp.series('jekyll-compile'));
  gulp.watch('_assets/styles/**/*.scss', gulp.series('styles'));
  gulp.watch('_assets/scripts/**/*.js', gulp.series('eslint', 'scripts'));

  gulp.watch('assets/**/*.js', gulp.series('jekyll-compile'));

  gulp.watch('_site/**/*').on('change', browserSync.reload);

  return next();
}));

gulp.task('setup-environment', function (next) {
  config.JEKYLL_ENV = 'production';
  next();
});

gulp.task('serve-prod', gulp.series('setup-environment', 'compile'), function () {
  browserSync.init({
    server: '_site'
  });
});

gulp.task('update-icons', function (next) {

  var fontello = childProcess.spawn('fontello-cli', [
    'open',
    '--config', './_assets/icons/config.json'
  ]);

  fontello.on('exit', function (code) {
    next(code === 0 ? null : 'ERROR: fontello-cli process exited with code: ' + code);
  });
});

gulp.task('download-icons', function (next) {
  var fontello = childProcess.spawn('./node_modules/.bin/fontello-cli', [
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

gulp.task('check-links', gulp.series('setup-environment', 'html-proofer'));

exports.build = gulp.series('setup-environment', 'compile');
exports.test = gulp.series('setup-environment', 'compile', 'html-proofer');
exports.default = gulp.series('serve');
