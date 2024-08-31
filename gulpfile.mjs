import gulp from 'gulp';

import autoprefixer from 'gulp-autoprefixer';
import babel from 'gulp-babel';
import browserify from 'browserify';

// var browserSync = require("browser-sync").create();
import browserSync from 'browser-sync';
browserSync.create();

import buffer from 'vinyl-buffer';
import cleanCSS from 'gulp-clean-css';
import { deleteAsync, deleteSync } from 'del';
import gulpIf from 'gulp-if';
// import imagemin from 'gulp-imagemin';
import plumber from 'gulp-plumber';
import rename from 'gulp-rename';
import replace from 'gulp-replace';
// var sass = require("gulp-sass")(require("sass"));
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);

import source from 'vinyl-source-stream';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import watchify from 'watchify';

import { spawn } from 'node:child_process';

const config = {
  jekyll: ['pages', 'posts', 'layouts', 'includes', 'data'],
  JEKYLL_ENV: 'development',
  domains: {
    default: 'ecclesmosque.org.uk',
    alias: ['ecclesmosque.org.uk', 'ecclesmosque.org'],
  },
};

function isProduction() {
  return config.JEKYLL_ENV === 'production';
}

gulp.task('clean', function () {
  return deleteAsync(['_site', 'assets/styles', 'assets/scripts', 'npm-debug.log']);
});

gulp.task('scripts', function () {
  // set up the browserify instance on a task basis
  var b = browserify({
    cache: {},
    packageCache: {},
    plugin: !isProduction() ? [watchify] : [],
    entries: '_assets/scripts/app.js',
    debug: true,
  });

  function bundle() {
    return (
      b
        .bundle()
        .pipe(
          plumber({
            errorHandler: function (error) {
              console.log(error.message);
              this.emit('end');
            },
          })
        )
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(babel())
        .pipe(sourcemaps.init())
        // Add transformation tasks to the pipeline here.
        .pipe(gulpIf(isProduction(), rename({ suffix: '.min' })))
        .pipe(gulpIf(isProduction(), uglify()))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('assets/scripts/'))
        .pipe(browserSync.stream({ match: '**/*.js' }))
    );
  }

  b.on('update', bundle);
  return bundle();
});

gulp.task(
  'jekyll-compile',
  gulp.series('scripts', function (next) {
    // clone the actual env vars to avoid overrides
    var envs = Object.create(process.env);
    envs.JEKYLL_ENV = config.JEKYLL_ENV;

    return spawn('bundle', ['exec', 'jekyll', 'build', !isProduction() ? '--drafts' : '', isProduction() ? '--profile' : '', '--incremental'], {
      stdio: 'inherit',
      env: envs,
    }).on('exit', function (code) {
      next(code === 0 ? null : 'ERROR: Jekyll process exited with code: ' + code);
    });
  })
);

gulp.task('images', function () {
  return (
    // We have no images to minimize at the moment so return
    gulp.src('.')
    // gulp
    //   .src('_assets/images/**/*')
    //   .pipe(
    //     plumber({
    //       errorHandler: function (error) {
    //         console.log('Task - images:', error);
    //         this.emit('end');
    //       },
    //     })
    //   )
    //   .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    //   .pipe(gulp.dest('assets/images/'))
  );
});

gulp.task('styles', function () {
  return gulp
    .src(['_assets/styles/**/*.scss'])
    .pipe(
      plumber({
        errorHandler: function (error) {
          console.log('Task - styles:', error);
          this.emit('end');
        },
      })
    )
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(replace(/\.\.\/font\//gim, '/assets/fonts/')) // fix for https://github.com/fontello/fontello/issues/573
    .pipe(autoprefixer('last 2 versions'))
    .pipe(sourcemaps.init())
    .pipe(gulpIf(isProduction(), rename({ suffix: '.min' })))
    .pipe(gulpIf(isProduction(), cleanCSS()))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('_site/assets/styles/')) // for BrowserSync
    .pipe(gulp.dest('assets/styles/')) // for pruduction
    .pipe(browserSync.stream({ match: '**/*.css' }));
});

gulp.task('html-proofer', gulp.series('jekyll-compile', 'images', 'styles', 'scripts'), function (next) {
  function doHTMLProof(next) {
    var proofer = spawn(
      'bundle',
      ['exec', 'htmlproofer', '--url-swap', '.*' + config.domains.default + '/:/', '--internal-domains', config.domains.alias.join(','), './_site'],
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

gulp.task('compile', gulp.series('clean', 'scripts', 'images', 'styles', 'jekyll-compile'));

gulp.task('update-assets', function () {
  return gulp.src(['assets/**/*']).pipe(gulp.dest('_site/assets/'));
});

gulp.task(
  'serve',
  gulp.series('compile', function (next) {
    browserSync.init({
      server: '_site',
    });

    config.jekyll.forEach(function (contentType) {
      gulp.watch('**/_' + contentType + '/**/*.*', gulp.series('jekyll-compile'));
    });

    gulp.watch('_config.yml', gulp.series('jekyll-compile'));
    gulp.watch('_assets/styles/**/*.scss', gulp.series('styles'));
    gulp.watch('_assets/scripts/**/*.js', gulp.series('scripts'));

    gulp.watch('assets/**/*.*', gulp.series('update-assets'));

    gulp.watch('_site/**/*').on('change', browserSync.reload);

    return next();
  })
);

gulp.task('setup-environment', function (next) {
  config.JEKYLL_ENV = 'production';
  next();
});

gulp.task('serve-prod', gulp.series('setup-environment', 'compile'), function () {
  browserSync.init({
    server: '_site',
  });
});

gulp.task('update-icons', function (next) {
  var fontello = spawn('fontello-cli', ['open', '--config', './_assets/icons/config.json']);

  fontello.on('exit', function (code) {
    next(code === 0 ? null : 'ERROR: fontello-cli process exited with code: ' + code);
  });
});

gulp.task('download-icons', function (next) {
  var fontello = spawn('./node_modules/.bin/fontello-cli', [
    'install',
    '--config',
    './_assets/icons/config.json',
    '--font',
    './assets/fonts',
    '--css',
    './_assets/styles/icons',
  ]);

  fontello.stdout.on('data', function (data) {
    console.log(data.toString());
  });

  fontello.on('exit', function (code, stdout, stderr) {
    console.log({ stdout, stderr });
    // rename *.css files to _*.scss
    if (code === 0) {
      gulp
        .src('./_assets/styles/icons/**/*.css')
        .pipe(
          rename(function (path) {
            path.basename = '_' + path.basename;
            path.extname = '.scss';
          })
        )
        .pipe(gulp.dest('./_assets/styles/icons/'))
        .on('end', function () {
          deleteSync(['./_assets/styles/icons/**/*.css']);
          next(null);
        });
    } else {
      next('ERROR: fontello-cli process exited with code: ' + code);
    }
  });
});

gulp.task('check-links', gulp.series('setup-environment', 'html-proofer'));
gulp.task('build', gulp.series('setup-environment', 'compile'));
gulp.task('test', gulp.series('setup-environment', 'compile', 'html-proofer'));
gulp.task('default', gulp.series('serve'));
