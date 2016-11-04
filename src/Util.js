const Util = {
    clone (item) {
        if (item == null) {
            return item;
        }

        var type = Object.prototype.toString.call(item),
            clone = item,
            i, key;

        if (type === '[object Date]') {
            clone = new Date(item.getTime());
        }
        else if (type === '[object Array]') {
            clone = [];

            for (i = item.length; i--; ) {
                clone[i] = Util.clone(item[i]);
            }
        }
        else if (type === '[object Object]' && item.constructor === Object) {
            clone = {};

            for (key in item) {
                clone[key] = Util.clone(item[key]);
            }
        }

        return clone;
    },

    merge (destination, source) {
        if (source) {
            for (let key in source) {
                let value = source[key];

                if (value && value.constructor === Object) {
                    let sourceKey = destination[key];

                    if (sourceKey && sourceKey.constructor === Object) {
                        merge(sourceKey, value);
                    }
                    else {
                        destination[key] = Util.clone(value);
                    }
                }
                else {
                    destination[key] = value;
                }
            }
        }

        return destination;
    }
};

module.exports = Util;
