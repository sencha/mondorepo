"use strict";
const Repo = require('./Repo');
const Resolver = require('./Resolver');
const RequireHooker = require('./RequireHooker');
const repo = Repo.open(process.cwd());
const resolver = new Resolver();

resolver.addAliases(repo.allPackageAliases);
RequireHooker.hook(resolver);
