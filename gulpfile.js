var gulp        = require('gulp');
var insert      = require('gulp-insert');
var sass        = require('gulp-sass');
var runSequence = require('run-sequence');
var $           = require('gulp-load-plugins')();

var minifyHTML = require('gulp-minify-html');
var minifyInline = require('gulp-minify-inline');

gulp.task('sass', function () {
    gulp.src('app/css/*.scss')
        .pipe(sass())
        .pipe(gulp.dest("app/css"))
        
    gulp.src('app/css/skins/default/*.scss')
        .pipe(sass())
        .pipe(gulp.dest("app/css/skins/default"))
        
    gulp.src('app/pages/auth/*.scss')
        .pipe(sass())
        .pipe(gulp.dest("app/pages/auth"))
});

gulp.task('insert', function(){
    gulp.src(['app/css/skins/default/color-vars.css'])
        .pipe(insert.append('</style>'))
        .pipe(insert.prepend('<style is=\'custom-style\'>'))
        .pipe(gulp.dest('app/css/skins/default/'));
});

gulp.task('copy', function(){

    var colorVars = gulp.src(['app/css/skins/default/color-vars-body.css'])
        .pipe($.rename('color-vars.css'))
        .pipe(gulp.dest('app/css/skins/default'));

                
    // gulp.src(['app/components/pd-dashboard/pd-dashboard.html'])
    //     .pipe($.rename('pd-dashboard.vulcanized.html'))
    //     .pipe(gulp.dest('app/components/pd-dashboard'));
        
    return colorVars;
});

// gulp.task('vulcanize', function () {
//     return gulp.src('app/components/pd-dashboard/pd-dashboard.vulcanized.html')
//         .pipe($.vulcanize({
//             stripComments: true,
//             inlineCss: false,
//             inlineScripts: true,
//             excludes: [
//                 'bower_components/polymer/polymer.html'
//             ],
//             stripExcludes: []
//         }))
//         .pipe(gulp.dest('app/components/pd-dashboard'));
// });

gulp.task('minify-html', function() {
    var opts = {
        conditionals: true,
        spare:true,
        quotes: true,
        empty: true
    };

    return gulp.src('app/components/pd-dashboard/pd-dashboard.vulcanized.html')
        .pipe(minifyHTML(opts))
        .pipe(gulp.dest('app/components/pd-dashboard'));
});

gulp.task('minify-inline', function() {
    gulp.src('app/components/pd-dashboard/pd-dashboard.vulcanized.html')
        .pipe(minifyInline())
        .pipe(gulp.dest('app/components/pd-dashboard'))
});

gulp.task('default',  function (cb) {
    runSequence(
        ['sass', 'copy'],
        ['insert',
        'vulcanize'],
        'minify-html',
        'minify-inline',
        cb)
});