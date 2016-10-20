class RequireHooker {

    /**
     * @param resolver
     */
    static hook(resolver) {
        let _require = module.constructor.prototype.require;

        module.constructor.prototype.require = function(id) {
            id = resolver.resolve(id);
            return _require.call(this, id);
        };

        // This is how we can hook module search paths, if we would like to add more paths
        // to search for modules just contact to the paths variable
        // _findPath = Module._findPath,
        /*Module._findPath = function (request, paths, isMain) {
         return _findPath.call(this, request, paths, isMain);
         }*/
    }
}

module.exports = RequireHooker;
