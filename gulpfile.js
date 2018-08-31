
const gulp = require('gulp'),
	fileinclude = require('gulp-file-includer'),
	htmlMin = require('gulp-htmlmin'),	//压缩html
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	autoprefixer = require('gulp-autoprefixer'),
	useref = require('gulp-useref'),
	gulpif = require('gulp-if'),
	cleanCSS = require('gulp-clean-css'),
	ugLify = require('gulp-uglify'),
	jshint = require('gulp-jshint'),  //js语法检查
	babel = require('gulp-babel'),
	jsImport = require('gulp-js-import'),
	changed = require('gulp-changed'),
	concat = require('gulp-concat'),
	remember = require('gulp-remember'),
	spritesmith = require('gulp.spritesmith'),  //制作雪碧图插件
	imageMin = require('gulp-imagemin'),	//压缩图片
	pngquant = require('imagemin-pngquant'),	// 深度压缩
	cache = require('gulp-cache'),	//压缩图片可能会占用较长时间，使用 gulp-cache 插件可以减少重复压缩。
	cssUrlVersion = require('fas-css-urlversion'),
	del = require('del'),
	rev = require('gulp-rev'),	//添加css/js版本号到.json文件中
	revCollector = require('gulp-rev-collector'),//添加html中css、js版本号
	runSequence = require('run-sequence'),
	gulpHtmlVersion = require('gulp-html-version'),
	browserSync = require("browser-sync").create(),	//浏览器实时刷新
	reload = browserSync.reload;
	var px2rem = require('gulp-px2rem-plugin');
const isProd = process.env.NODE_ENV === 'production';
const dist = isProd ? 'build' : 'dist';
const moveFile = {
    js: 'src/js/*.min.js',
};
const config = {
    cssSrc: ['src/scss/**/*.scss'],
    cssDist: dist + '/static/css',
    jsSrc: ['src/js/**/*.js', '!src/js/lib/*.js', '!src/js/common/*.js'],
    jsDist: dist + '/static/js',
    imgSrc: 'src/images/**/*',
    imgDist: dist + '/static/images',
    htmlSrc: 'src/*.html',
    htmlDist: dist + '/*.html',
    fontSrc: 'src/fonts/**/*',
    fontDist: dist + '/static/fonts'
};

gulp.task('delete', (cb) => {
  	return del([
	    'dist/',
	    // 我们不希望删掉这个文件，所以取反这个匹配模式
	    '!dist/images'
	], cb);
});

gulp.task('html', () => {
	const options = {
	    removeComments: true,	//清除HTML注释
	    collapseWhitespace: false,	//压缩HTML
	    removeScriptTypeAttributes: false,	//删除<script>的type="text/javascript"
	    removeStyleLinkTypeAttributes: false,	//删除<style>和<link>的type="text/css"
	    minifyJS: false,	//压缩页面JS
	    minifyCSS: false //压缩页面CSS
	};

	return gulp.src(['src/*.html'])
		.pipe(changed(config.htmlDist, {hasChanged: changed.compareSha1Digest}))
		.pipe(fileinclude({  
		    prefix: '@@',	//变量前缀 @@include
		    basepath: 'src/pages',	//引用文件路径
		    indent: true  //保留文件的缩进
		}))
		.pipe(useref())
		.pipe(gulpif('*.js', ugLify()))
        .pipe(gulpif('*.css', cleanCSS()))
		.pipe(htmlMin({
			collapseWhitespace: false,
			removeComments: true,
			html5: true
		}))
		.pipe(gulpHtmlVersion({
		    paramName: 'v',
		    paramType: 'timestamp',
		    suffix: ['css', 'js', 'jpg', 'png', 'gif']
		}))
		.pipe(gulp.dest('dist'))
		.pipe(browserSync.reload({stream: true}));

});

gulp.task('scss', () => {
	//解决gulp-sass 在include时的报错     
	return new Promise(function(resolve, reject) {
	    return setTimeout(function() {
	        return gulp.src(config.cssSrc)
	        // `changed` 任务需要提前知道目标目录位置
    		// 才能找出哪些文件是被修改过的
    		.pipe(changed(config.cssDist, {hasChanged: changed.compareSha1Digest}))
    		// 只有被更改过的文件才会通过这里
	        // .pipe(gulpif(!isProd, sourcemaps.init()))
	        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
	        // .pipe(gulpif(!isProd, sourcemaps.write()))
	        .pipe(autoprefixer({
	            browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'],
	            cascade: false
	        }))
	        .on('error', function(e) {
	            return reject(e) && this.end();
	        })
	        .pipe(cssUrlVersion())
	        .pipe(gulp.dest('src/css'))
	        .on('end', resolve)
	        .pipe(browserSync.reload({stream: true}));
	    }, 500);
	}).catch(function(e) {
	    return console.warn(e.messageFormatted);
	});
});
//js合并（公用的脚本和插件脚本）
gulp.task('concatBaseJs', function () {
	return gulp.src(['src/js/common/*.js'])
	.pipe(changed(dist + '/static/js/common', {hasChanged: changed.compareSha1Digest}))
	.pipe(babel({  //转换成 ES5
        presets: ['es2015']  
    }))
	// .pipe(gulpif(!isProd, sourcemaps.init()))
	.pipe(babel({
		presets: ['env']
	}))
	.pipe(ugLify())
	// .pipe(gulpif(!isProd, sourcemaps.write()))
	.pipe(remember('js-task'))
	.pipe(concat('base.js'))
	.pipe(gulp.dest(dist + '/static/js/common'))
	.pipe(browserSync.reload({stream: true}));
  });
//js复制lib
gulp.task('jsLib', () => {
	return gulp.src(['src/js/lib/*.js'])
		.pipe(changed(dist + '/static/js/lib', {hasChanged: changed.compareSha1Digest}))
		// .pipe(sourcemaps.write('./',{addComment: false}))
		.pipe(gulp.dest(dist + '/static/js/lib'))
		.pipe(browserSync.reload({stream: true}));
});

//js压缩混淆
gulp.task('js', () => {
	return gulp.src(config.jsSrc)
		.pipe(changed(config.jsDist, {hasChanged: changed.compareSha1Digest}))
		.pipe(babel({  //转换成 ES5
			presets: ['es2015']  
		}))
		// .pipe(sourcemaps.init())
		//注释jshint相关代码
		// .pipe(jshint({
		//     esnext: true
		// }))
		// .pipe(jshint.reporter('default', { verbose: true }))
		.pipe(babel({
		    presets: ['env']
		}))
		.pipe(ugLify())
		// .pipe(sourcemaps.write('./',{addComment: false}))
		.pipe(gulp.dest(config.jsDist))
		.pipe(browserSync.reload({stream: true}));
});

gulp.task('move', () =>
    gulp.src(moveFile.js)
    .pipe(gulp.dest(config.jsDist))
);

gulp.task('images', () => {
    return gulp.src('src/images/**/*.+(png|jpg|gif|svg)')
        .pipe(changed(config.imgDist, {hasChanged: changed.compareSha1Digest}))
        .pipe(cache(imageMin({
            interlaced: true,
            optimizationLevel: 7,
            progressive: true,	// 无损压缩JPG图片
            svgoPlugins: [{removeViewBox: false}], // 不移除svg的viewbox属性
            use: [pngquant()] // 使用pngquant插件进行深度压缩
        })))
        .pipe(gulp.dest(config.imgDist))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('sprites', () => {
    return gulp.src('src/images/icon/*.png')
    .pipe(spritesmith({
        imgName: 'images/sprite.png', //合并后大图的名称
        cssName: 'scss/icon/_sprite.scss',
        padding: 5, // 每个图片之间的间距，默认为0px
        cssFormat: 'scss'
    }))
    .pipe(gulp.dest('src/'))
});

gulp.task('fonts', () => {
    return gulp.src(config.fontSrc)
    .pipe(gulp.dest(config.fontDist))
});

//copy css
gulp.task('css', function() {
	return gulp.src('src/css/**/*.css')
	.pipe(px2rem({'width_design':750,'valid_num':4,'pieces':10,'ignore_px':[1,2],'ignore_selector':['.class1']}))
// 	width_design：设计稿宽度默认值640
// valid_num：默认生成REM后的小数位数值4
// pieces：将整屏切份。默认为10，相当于10rem = width_design（设计稿宽度）
// ignore_px：让部分PX不在转换成物权默认为空数组
// ignore_selector：让部分选择器不在转换为REM默认为空数组
    .pipe(cleanCSS())
    .pipe(gulp.dest(config.cssDist))
});

//按顺序执行任务
gulp.task('runSequence', (done) => {
	runSequence(
		['html'],
		['images'],
		['scss'],
		['css'],
		['sprites'],
		['js'],
		['jsLib'],
		['concatBaseJs'],
		['fonts'],
		['move'],
	done);
});

//构建
gulp.task('build', (done) => {
    runSequence(
    	['delete'],
        ['html'],
		['images'],
		['scss'],
		['css'],
		['sprites'],
		['js'],
		['jsLib'],
		['concatBaseJs'],
		['fonts'],
		['move'],
        done
    );
});

//启动热更新
gulp.task('dev', ['runSequence'], function() {
    browserSync.init({
        port: 3000,
        https: false,
        open: true,
        server: {
			baseDir: './dist',
            index: "index.html"
        }
    });
    gulp.watch(config.cssSrc, ['scss']);
	gulp.watch(config.jsSrc, ['js']);
	gulp.watch('src/js/common/*.js', ['concatBaseJs']);
	gulp.watch('src/js/lib/*.js', ['jsLib']);
    gulp.watch('src/**/*.html', ['html']);
    gulp.watch('src/css/**/*.css', ['css']);
    gulp.watch(config.imgSrc, ['images']);
    gulp.watch(config.fontSrc, ['fonts']);

});
