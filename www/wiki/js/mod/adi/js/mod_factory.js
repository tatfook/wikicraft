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
	
	app.generateSectionClassName = function(className){
		return this.params.desgin.id + '-' + className;
	}

	app.generateComponentClassName = function(className){
		return this.componentStyleName + '-' + className;
	}
	
	app.createModCommand = function(params, styles, component){
		return {
			render : function(wikiblock){
				wikiblock.$scope.params = params;//app.getEditorParams({}, params);
				wikiblock.$scope.mode   = wikiblock.mode;

				return component;
			},
			getEditorParams : params,
			getStyleLists   : styles
		}
	}

	app.getEditorParams = function(modParams, params_template) {
		modParams = modParams || {};

		for (var key in params_template) {
			if (key == "design") {
				modParams.design      = modParams.design || {};
				modParams.design.text = modParams.design.text || params_template[key].text;
			} else {
				modParams[key]          = modParams[key] || {};
				modParams[key]["$data"] = params_template[key];
				modParams[key]["text"]  = modParams[key]["text"] || params_template[key]["text"];
			}
		}
		
		return modParams;
	}
});

