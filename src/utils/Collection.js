class Collection {
    constructor() {
        this.lookup = {};
        this.items = [];
    }

    *[Symbol.iterator]() {
        for (let x of this.items) {
            yield x;
        }
    }

    get map() {
        return this.items.map.bind(this.items);
    }

    get reduce() {
        return this.items.reduce.bind(this.items);
    }

    get filter() {
        return this.items.filter.bind(this.items);
    }

    get forEach() {
        return this.items.forEach.bind(this.items);
    }

    get length() {
        return this.items.length;
    }

    add(...items) {
        for (let item of items) {
            const key = item.name;

            if (!this.lookup[key]) {
                this.lookup[key] = this.items.length;
                this.items.push(item);
            }
        }
    }

    addAll(items) {
        if (Array.isArray(items)) {
            this.add(...items);
        } else {
            this.add(...items.items);
        }
    }

    clone() {
        const c = new Collection();
        c.addAll(this);
        return c;
    }


    get(key) {
        if (typeof key === "string") {
            key = this.lookup[key];
        }

        return this.items[key] || null;
    }

    getAt(index) {
        if (index < this.items.length) {
            return this.items[index];
        }

        throw new Error(`Index ${index} is out of range ${this.items.length}`);
    }

    remove(item) {
        const key = item.name;

        if (this.lookup[key]) {
            const index = this.lookup[key];
            this.items.splice(index, 1);
            delete this.lookup[key];

            for (let i = index; i < this.items.length; i++) {
                const it = this.items[i];
                this.lookup[it.name] = i;
            }
        }
    }

    contains(item) {
        return this.includes(item);
    }

    includes(item) {
        return this.items.includes(item);
    }

    indexOf(item) {
        let index;
        if (typeof item === "string") {
            index = this.lookup[item];
        } else {
            index = this.lookup[item.name];
            if (this.items[index] !== item) {
                index = -1;
            }
        }

        if (index === undefined) {
            index = -1;
        }

        return index;
    }
}

module.exports = Collection;
