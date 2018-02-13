
# 此目录用于将渲染md实现统一放于此， 进行代码位置重构, 代码位置如何重构因个人经验跟功底，实现代码已经很简化等问题，暂无想很好替换方案。。。



## 新wikimod渲染方式
## wiki module 

### 格式
```
格式：
    ```cmdName                          
	        moduleParams
	```
```

### md对象
mdName string md
md object 原生的md解析对象
mode string 渲染模式 normal preview editor
editor object 编辑器对象
containerId 容器Id 填此值可将渲染内容绑定此容器上 可避免更新整体闪烁

### 模块对象 block
mdName string md解析器名
modName string 模块名
cmdName string 命令名
modParams object|string}undefined 模块参数
isTemplate bool 是否为模板模块
applyModParams function 应用模块参数 编辑模式 将模块参数回写至编辑器
render function 模板渲染函数  md -> block -> wikimod -> html($render)
token object 模块对应的md解析object
mode string 模块所处模式 与编辑器模式对应  noraml, preview, editor 
templateContent string 模板内容 模板模块才具有此值

htmlContent string 模块渲染后的html文本 中间值
isChange bool 模块是否改变 中间值 用于是否需要刷新模块
wikimod object 模块返回对象

### 模块返回值对象mod wikimod = {mod:mod, cmdName:cndName}
getEditorParams function  获取模块的编辑参数通过模块参数
getModuleParams function  获取模块的模块参数通过编辑参数
getStyleParams function 通过当前模块参数和样式对象放回对应样式的模块参数 默认行为`angular.extend(modParams, style);`
getStyleList function 获取模块的样式参数, 返回值为样式参数列表
forceRender function 强制渲染 编辑模式 改动即调用 不做缓存 
render function 模块渲染回调 做缓存
renderAfter function 模块渲染结束后回调
usage function 模块帮助函数
