const Container = require('switchit').Container;

const Add = require('./Add');
const List = require('./List');
const Remove = require('./Remove');

class Fork extends Container {
}

Fork.define({
    help: 'Commands to manage the global set of known forks',
    commands: {
        add: Add,
        list: List,
        remove: Remove,
        '': List
    }
});

module.exports = Fork;