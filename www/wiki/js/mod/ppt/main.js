define([
    'app',
    'reveal',
    'text!wikimod/ppt/main.html',
    // './lib/js/classList.js',
    './lib/js/head.min.js',
    // './lib/js/html5shiv.js'
], function(app, reveal, htmlContent) {
    'use strict';
    
    function registerController(){
        app.registerController("pptController", ["$scope", function($scope){

            var link = document.createElement( 'link' );
			link.rel = 'stylesheet';
			link.type = 'text/css';
			link.href = window.location.search.match( /print-pdf/gi ) ? '/wiki/js/mod/ppt/css/print/pdf.css' : '/wiki/js/mod/ppt/css/print/paper.css';
			document.getElementsByTagName( 'head' )[0].appendChild( link );
            
            $scope.$watch('$viewContentLoaded', function(){
                Reveal.initialize();
            });

            $scope.hello = "Hello World!";
        }]);
    }

    return {
        render: function(){
            registerController();
            return htmlContent;
        }
    }
});