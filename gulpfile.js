
let project_folder = require('path').basename(__dirname);
let source_folder  = '#src';

let  path = {
  build: {
    html:   project_folder + '/',
    css:    project_folder + '/css/',
    scss:   project_folder + '/css/',
    js:     project_folder + '/js/',   
    img:    project_folder + '/img/',   
    fonts:  project_folder + '/fonts/', 
  },
  src: {
    html:   [source_folder + '/*.html', '!'+ source_folder + '/_*.html'],
    scss:    source_folder + '/sass/style.sass',
    css:    source_folder + '/css/*.css',
    js:     source_folder + '/js/*.js',   
    img:    source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',   
    fonts:  source_folder + '/fonts/*',
  },
  watch: {
    html:   source_folder + '/**/*.html',    
    css:    source_folder + '/css/**/*.css',  
    scss:    source_folder + '/sass/**/*.sass', 
    js:     source_folder + '/js/**/*.js',   
    img:    source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
    fonts:  source_folder + '/fonts/'   
  },
  clean: './' + project_folder + '/'
};

let {src, dest} = require('gulp'),
    gulp = require('gulp'),
    bs = require('browser-sync').create(),
    fileinclude = require('gulp-file-include'),
    del = require('del'),
    sass = require('gulp-sass');
    autoprefixer = require('gulp-autoprefixer'),
    group_media = require('gulp-group-css-media-queries'),
    clean_css = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify-es').default,
    imagemin = require('gulp-imagemin'),
    webp = require('gulp-webp'),
    webphtml = require('gulp-webp-html'),
    webpcss = require('gulp-webpcss'),
    ttf2woff = require('gulp-ttf2woff');

function browserSync(params) {
  bs.init({
    server:{
      baseDir: './' + project_folder + '/'
    },
    port:3000,
    notify: false
  });
}

function html() {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(webphtml())
    .pipe(dest(path.build.html))
    .pipe(bs.stream());
}

function scss(params) {
  return src(path.src.scss)
    .pipe(
      sass({
        outputStyle: 'expanded'
      })
    )
    .pipe(
      group_media()
    )
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 5 versions'],
        cascade: true
      })
    )
    .pipe(webpcss())
    .pipe(dest(path.build.scss))
    .pipe(clean_css())
    .pipe(
      rename({
        extname: '.min.css'
      })
    )
    .pipe(dest(path.build.scss))
    .pipe(bs.stream());
}
function css(params) {
  return src(path.src.css)
    .pipe(
      group_media()
    )
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 5 versions'],
        cascade: true
      })
    )
    .pipe(webpcss())
    .pipe(dest(path.build.css))
    .pipe(clean_css())
    .pipe(dest(path.build.css))
    .pipe(bs.stream());
}


function js() {
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(dest(path.build.js))
    .pipe(
      uglify()
    )
    .pipe(
      rename({
        extname: '.min.js'
      })
    )
    .pipe(dest(path.build.js))
    .pipe(bs.stream());
}


function images() {
  return src(path.src.img)
    .pipe(
      webp({
        quality: 70
      })
    )
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false}],
        interlaced: true,
        optimizationLevel: 3 // 0 to 7
      })
    )
    .pipe(dest(path.build.img))
    .pipe(bs.stream());
}

function fonts() {
  src(path.src.fonts)
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonts));
  return src(path.src.fonts)
    .pipe(dest(path.build.fonts));
}

function watchFiles() {
   gulp.watch([path.watch.html], html);
   gulp.watch([path.watch.scss], scss);
   gulp.watch([path.watch.css], css);
   gulp.watch([path.watch.js], js);
   gulp.watch([path.watch.img], images);
}

function clean(params) {
  return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(js, scss, css, html, images, fonts));
let watch = gulp.parallel(build, watchFiles, browserSync);


exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.scss = scss;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;


