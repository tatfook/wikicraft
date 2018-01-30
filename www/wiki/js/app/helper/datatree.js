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
            item.__inner__id = datatree.uuid();
            var tempItem = datatree.copyObj(item);
            tempItem.children = null;
            tempItem.__inner__parent__id = parentId;
            var tempRes = prev.concat(tempItem);

            return (item.children && item.children.length) 
                ? tempRes.concat(datatree.flattenTreeByChildren(item.children, item.__inner__id))
                : tempRes;

        }, []);

        return result;
    }

    datatree.getPathOfItemInflattenedData = function(item, flattenedData) {
        if (!item.__inner__parent__id) return '/';
        if (item.__inner__parent__id) {
            var parentItem = flattenedData.filter(function(x) {
                return x.__inner__id === item.__inner__parent__id;
            })[0];
            return datatree.getPathOfItemInflattenedData(parentItem, flattenedData) + parentItem.name + '/'
        };
    }

    datatree.addSiblingInflattenedDataBeforeItem = function(item, flattenedData, newItem) {
        var newItem = newItem || {
            __inner__id: datatree.uuid(),
            name: '',
            __inner__parent__id: item.__inner__parent__id
        };

        flattenedData.splice(flattenedData.indexOf(item), 0, newItem);

        return newItem;
    }

    datatree.addSiblingInflattenedDataAfterItem = function(item, flattenedData, newItem) {
        var newItem = newItem || {
            __inner__id: datatree.uuid(),
            name: '',
            __inner__parent__id: item.__inner__parent__id
        };

        // get next sibling item
        
        // if not get parent next sibling item
        // and go on...
        //      if get any, insert before the item you have found
        // or until non,
        //      insert at the bottom of the list

        var closetSibling = findClosetSibling(item, flattenedData);
        if (closetSibling) {
            return datatree.addSiblingInflattenedDataBeforeItem(closetSibling, flattenedData, newItem);
        }

        // insert at the bottom of the list
        flattenedData.push(newItem);
        return newItem;

        //find item's next sibling or item's parent's next sibling or go on ... 
        function findClosetSibling(item, flattenedData) {
            var nextSiblingItem = findNextSibling(item, flattenedData);
            if (nextSiblingItem) return nextSiblingItem;

            var parentItem = datatree.findParentItemInflattenedData(item, flattenedData);
            if (parentItem) return findClosetSibling(parentItem, flattenedData);

            return;
        }

        function findNextSibling(item, flattenedData) {
            var siblings = flattenedData.filter(function(xItem) {
                return areTheySiblings(item, xItem);
            });
            var nextSiblingItem = siblings[siblings.indexOf(item) + 1];
            return nextSiblingItem;
        }

        function areTheySiblings(item, xItem) {
            if (!item.__inner__parent__id && !xItem.__inner__parent__id) return true;
            if (item.__inner__parent__id === xItem.__inner__parent__id) return true;
            return false;
        }
    }

    datatree.findParentItemInflattenedData = function(item, flattenedData) {
        return flattenedData.filter(function(xItem) {
            return xItem.__inner__id === item.__inner__parent__id;
        })[0];
    }

    datatree.addChildOfItemInflattenedData = function(item, flattenedData) {
        flattenedData.splice(flattenedData.indexOf(item) + 1, 0, {
            __inner__id: datatree.uuid(),
            name: '',
            __inner__parent__id: item.__inner__id
        });
    }

    datatree.removeItemItemInflattenedData = function(item, flattenedData) {
        var startIndex = flattenedData.indexOf(item);
        var removeLength = flattenedData.reduce(function(prev, x) {
            if (item.__inner__id === x.__inner__id) {
                return prev.concat(x);
            }

            var xIsChildOfPrevItems = prev.filter(function(prevItem) {
                return prevItem.__inner__id === x.__inner__parent__id 
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
                return x.__inner__parent__id === item.__inner__id;
            }).reduce(function(prevIsEmpty, x) {
                if (!prevIsEmpty) return prevIsEmpty;
                return prevIsEmpty && datatree.isItemEmpty(x, flattenedData, keys)
            }, true)
        }

        function xIsEmpty(x) {
            var nameAndKeys = keys.concat({key: 'name'}); //name is necessary
            return nameAndKeys.filter(function(keyItem) {
                var value = x[keyItem.key];
                if (typeof value === 'string') return !!value.trim();
                if (typeof value === 'boolean') return true;
                return !!value;
            }).length === 0;
        }
    }

    datatree.makeTreeWithInnerParentId = function (data) {
        //combine with original data
        var result = [];
        var getItemById = function (data, id) {
            for (var index in data) {
                if (data[index] && data[index].__inner__id === id) {
                    return data[index]
                }
            }
        };

        data.forEach(function(item) {
            if (!item.__inner__parent__id) {
                result.push(item);
                return;
            }
            var parentItem = getItemById(data, item.__inner__parent__id);
            parentItem.children = parentItem.children || [];
            parentItem.children.push(item);
        });

        //copy and remove __inner__*key* in result
        result = cloneObjWithoutCertainKeyRecursively(result, /^__inner__/);

        // console.log('result: ', result);

        return result;
    }

    function cloneObjWithoutCertainKeyRecursively(obj, keyPatternRegex) {
        if (obj === null || typeof(obj) !== 'object' || '__inner__isActiveClone' in obj)
            return obj;
  
        var temp = Array.isArray(obj) ? [] : {};
  
        for (var key in obj) {
          if (!keyPatternRegex.test(key) && Object.prototype.hasOwnProperty.call(obj, key)) {
            obj['__inner__isActiveClone'] = null;
            temp[key] = cloneObjWithoutCertainKeyRecursively(obj[key], keyPatternRegex);
            delete obj['__inner__isActiveClone'];
          }
        }

        return temp;
    }

    return datatree;
});