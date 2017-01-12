const Collection = require('./utils/Collection.js');
const Logger = require('./utils/Logger.js');

class Graph {
    constructor(item) {
        this._depends = new Collection();
        this._stack = [];
        this._map = {};
        this._entry = item;

        this._descend(item);
    }

    get depends() {
        return this._depends;
    }

    _descend(item) {
        if (this._map[item.name] === 1) {
            Logger.error(`${item.name} was found multiple times`);
            // issue we are here again error time
            // use _stack to show path to problem
        }

        // already processed
        if (this._map[item.name] === 2) {
            return;
        }

        this._map[item.name] = 1;
        this._stack.push(item);

        // do all the processing
        const children = item._children;


        if (children instanceof Collection) {
            for (let child of children) {
                this._descend(child);
            }
        } else if (Array.isArray(children)) {
            for (let childItem of children) {
                this._descend(childItem);
            }
        } else if (children) {
            for (let key in children) {
                this._descend(children[key]);
            }
        }

        if (this._entry !== item) {
            this._depends.add(item);
        }

        this._map[item.name] = 2;
        this._stack.pop();
    }
}

module.exports = Graph;
