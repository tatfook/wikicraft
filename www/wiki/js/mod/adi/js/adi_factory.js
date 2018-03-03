define([
    'app',
	'helper/util',
	'jss',
	'jss-preset-default'
], function (
	app,
	util,
	jss,
	jssPresetDefault
) {
	let beThemeAddStarted = false;

	function checkThemeExist() {
		if(!app.isEditMode()){
			return;
		}

		let editor        = app.objects.editor;
		let mainMdwiki    = app.objects.mainMdwiki;
		let blockList     = mainMdwiki.getBlockList();
		let hasTheme      = false;
		let filePath      = config.hash();
		let filePathArray = filePath.split("/");
		let isThemeFile   = filePathArray[3] == '_theme' ? true : false;

		if (!isThemeFile) {
			for(let item in blockList) {
				if(blockList[item].cmdName == 'adi/js/theme') {
					hasTheme = true;
					break;
				}
			}

			if(!hasTheme && !beThemeAddStarted) {
				beThemeAddStarted = true;

				app.addThemeBlock(function(){
					mainMdwiki.render(editor.getValue(), undefined, true);
					beThemeAddStarted = false;
				});
			}
		}
	}
	
	app.isEditMode = function(){
		if(app.objects.mainMdwiki && app.objects.mainMdwiki.mode == 'editor'){
			return true;
		}else{
			return false;
		}
	}

	app.generateClassSheet = function(className, data){
        let setting = {createGenerateClassName : function(){
            // let counter = 0
    
            return function(rule, sheet){
                return className + '-' + rule.key;// + '-' + counter++;
            }
        }};
    
        jss.default.setup(setting);
        jss.create(jssPresetDefault.default());
    
        let sheet = jss.default.createStyleSheet(data)

        return sheet;
	}

	app.generateClassStyle = function(className, data){
		let sheet = app.generateClassSheet(className, data);

		return sheet.toString().replace(/\\/g, "");
	};
	
	app.generateSectionClassName = function(className){
		return this.params.design.id + '-' + className;
	}

	app.generateComponentClassName = function(className){
		return this.componentStyleName + '-' + className;
	}
	
	app.createModCommand = function(params, design, component){
		return {
			render : function(wikiblock){
				let combine = util.mixin(params, wikiblock.modParams);

				wikiblock.$scope.params = combine;//app.getEditorParams({}, params);
				wikiblock.$scope.mode   = wikiblock.mode;

				checkThemeExist();

				return component;
			},
			params : params,
			design : design
		}
	}

	// app.getEditorParams = function(modParams, params_template) {
	// 	modParams = modParams || {};

	// 	for (var key in params_template) {
	// 		if (key == "design") {
	// 			modParams.design      = modParams.design || {};
	// 			modParams.design.text = modParams.design.text || params_template[key].text;
	// 		} else {
	// 			modParams[key]          = modParams[key] || {};
	// 			modParams[key]["$data"] = params_template[key];
	// 			modParams[key]["text"]  = modParams[key]["text"] || params_template[key]["text"];
	// 		}
	// 	}
		
	// 	return modParams;
	// }
});

