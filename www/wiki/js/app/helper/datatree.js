define([], function () {

    var datatree = {};
    datatree.uuid = function() {return Date.now() + Math.random() + ''};

    datatree.copyObj = function(obj) {
        var result = Array.isArray(obj) ? [] : {};
        for (var key in obj) result[key] = obj[key];
        return result;
    }

    datatree.flattenTreeByChildren = function (data, parentId) {
        //create totally new data
        var result = data.reduce(function(prev, item) {
            item.id = item.id || datatree.uuid();
            var tempItem = datatree.copyObj(item);
            tempItem.children = null;
            tempItem.parentId = parentId;
            var tempRes = prev.concat(tempItem);

            return (item.children && item.children.length) 
                ? tempRes.concat(datatree.flattenTreeByChildren(item.children, item.id))
                : tempRes;

        }, []);

        return result;
    }

    datatree.getPathOfItemInflattenedData = function(item, flattenedData) {
        if (!item.parentId) return '/';
        if (item.parentId) {
            var parentItem = flattenedData.filter(function(x) {
                return x.id === item.parentId;
            })[0];
            return datatree.getPathOfItemInflattenedData(parentItem, flattenedData) + parentItem.name + '/'
        };
    }

    datatree.addSiblingInflattenedDataBeforeItem = function(item, flattenedData) {
        flattenedData.splice(flattenedData.indexOf(item), 0, {
            id: datatree.uuid(),
            name: '',
            parentId: item.parentId
        });
    }
    
    datatree.addSiblingInflattenedDataAfterItem = function(item, flattenedData) {
        flattenedData.splice(flattenedData.indexOf(item) + 1, 0, {
            id: datatree.uuid(),
            name: '',
            parentId: item.parentId
        });
    }

    datatree.addChildOfItemInflattenedData = function(item, flattenedData) {
        flattenedData.splice(flattenedData.indexOf(item) + 1, 0, {
            id: datatree.uuid(),
            name: '',
            parentId: item.id
        });
    }

    datatree.removeItemItemInflattenedData = function(item, flattenedData) {
        var startIndex = flattenedData.indexOf(item);
        var removeLength = flattenedData.reduce(function(prev, x) {
            if (item.id === x.id) {
                return prev.concat(x);
            }

            var xIsChildOfPrevItems = prev.filter(function(prevItem) {
                return prevItem.id === x.parentId 
            }).length > 0;

            if (xIsChildOfPrevItems) {
                return prev.concat(x);
            };

            return prev;
        }, []).length;

        flattenedData.splice(flattenedData.indexOf(item), removeLength);
    }

    datatree.clearEmptyItemsInFlattenedData = function(flattenedData, keys) {
        return flattenedData.filter(function(item) {
            return !datatree.isItemEmpty(item, flattenedData, keys);
        });
    }

    datatree.isItemEmpty = function(item, flattenedData, keys) {
        var isEmpty = xIsEmpty(item);
        if (!isEmpty) return false;

        if (isEmpty) {
            return isEmpty && flattenedData.filter(function(x) {
                return x.parentId === item.id;
            }).reduce(function(prevIsEmpty, x) {
                if (!prevIsEmpty) return prevIsEmpty;
                return prevIsEmpty && datatree.isItemEmpty(x, flattenedData, keys)
            }, true)
        }

        function xIsEmpty(x) {
            var nameAndKeys = keys.concat('name'); //name is necessary
            return nameAndKeys.filter(function(keyItem) {
                var value = x[keyItem.key];
                if (typeof value === 'string') return !!value.trim();
                if (typeof value === 'boolean') return true;
                return !!value;
            }).length === 0;
        }
    }

    datatree.makeTreeWithParentId = function (data) {
        //combine with original data
        var result = [];
        var getItemById = function (data, id) {
            for (var index in data) {
                if (data[index] && data[index].id === id) {
                    return data[index]
                }
            }
        };

        data.forEach(function(item) {
            if (!item.parentId) {
                result.push(item);
                return;
            }
            var parentItem = getItemById(data, item.parentId);
            parentItem.children = parentItem.children || [];
            parentItem.children.push(item);
        });

        return result;
    }

    return datatree;
});