"use strict";
let Repo = require('./src/Repo');
let repo = Repo.open('./playground/orion');
// let repo = new Repo({path: './playground/install-test'});

// repo.uses;
// console.log(repo.allRepos);
// console.log(repo.allPackageAliases);


console.log(repo.allPackages);
