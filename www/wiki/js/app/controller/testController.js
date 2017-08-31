/**
 * Created by wuxiangan on 2017/1/6.
 */

define([
		'app',
		'helper/util',
		'helper/mdconf',
		'text!html/test.html',
], function (app, util, mdconf, htmlContent) {
	app.registerController("testController", ['$scope','$http','$auth', function ($scope, $http, $auth ) {
		function init() {
			var str =`
# Defaults

  Since this is markdown you can still have regular text
  to explain what the hell is going on.

## Upload

  - max: 200mb
  
  
  - dir: /tmp

### Thumbnail sizes

  - 50x50
  - 300x300
  - 600x600
  - 900x900

## S3

  - api key: 111111
  - secret: 222222

### Buckets

  - avatars: myapp-avatars
  - assets: myapp-assets
  - files: myapp-files

# Production

## Upload

  - max: 1gb
  - dir: /data/uploads

## Sites

| hostname     | build   | coverage  |
| :----------- | :------:| --------: |
| google.com   | pas\\|sing |       94% |
| facebook.com | passing |       97% |
| twitter.com  | failed  |       81% |
| myspace.com  | unkown  |       0%  |

				`;
			var obj = mdconf.toJson(str);
			console.log(mdconf.toMd(obj));
		}

		$scope.$watch("$viewContentLoaded", init);

	}]);

	return htmlContent;
});

