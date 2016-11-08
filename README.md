![mondorepo](assets/logo.png)

[![Dependencies Status](https://david-dm.org/sencha/mondorepo/status.svg)](https://david-dm.org/sencha/mondorepo)
[![npm version](https://badge.fury.io/js/mondorepo.svg)](https://badge.fury.io/js/mondorepo)
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)   

# mondorepo
> Management for collections of packages across teams

For the increasingly common scenario where teams need to work on more
than one `npm` package at a time, `mondorepo` enables collaboration on 
a collection of jointly developed repositories that may contain one or 
multiple projects themselves.

One project, multiple packages and repositories, all aware of each other at runtime.

## Motivation
The Node.js package ecosystem has been traditionally developed following the 
*one package per repository* rule, which is a workable solution for 
developing packages that are small in size or complexity and live in 
relative isolation.

As projects' scale increases this approach has a couple significant problems. 

1. The amount of code in a complex project often increases beyond what would 
   ideally live in a single package.
2. Most times, multiple teams of developers need to collaborate on 
   **concurrently developed packages** managed in separate repositories.

Traditional approaches to solve these problems are:

1. Use relative paths across a huge codebase
2. Include jointly developed packages inside the main project's `node_modules` directory.
3. Following the `monorepo` approach (`mono` not `mondo`).

While there are potential advantages to each of these approaches, here at Sencha we decided
to tackle the problem in a way that projects remain modular and sub packages can be developed
on their own.

We call these `mondorepos`.

### mondorepos ("`mondo`: large, big")

As an alternative to monolithic repositories, `mondorepo` enables teams to collaborate
 on big complex projects that span across multiple repositories. Each subpackage can be a
 `mondorepo` on its own and so on.
 
An example of this project structure would look like this:

    Repository: 'awesomecorp/MyAwesomeProject'
    MyAwesomeProject/
        index.js
        package.json      // <- contains a reference to "awesomecorp/My-pkg" under "mondo.uses.My-pkg"

    Repository: 'awesomecorp/My-pkg'
    MyAwesomeProject/
        index.js
        package.json
        
Running `mondo install` will connect all used repositories (declared inside `mondo.uses`) and make `My-pkg`
available to be used on a simple `require('My-pkg')` statement, isn't that neat?
  
This effectively means that each subpackage can be developed on its own if needed, but also
can be included as part of any other project that wants to jointly develop a bunch of its own requirements.

## Getting started

### Install `mondorepo` globally
We prefer `yarn` but `npm` is also fine:

    $ yarn global add mondorepo
    
### Bring all other repositories used by your project into play
Once you checked out a project that uses `mondorepo`, just run:

    $ mondo install

If you have a set of known forks configured and wish to use them when installing the project, run:

    $ mondo install --forks

### Getting help
For help on how to use the CLI tool run:

    $ mondo help

For help configuring your project as a `mondorepo`, check our [Getting started guide](docs/gettingstarted.md).

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on the code of conduct, and the
process for submitting pull requests.

## Versioning

`mondorepo` uses [SemVer](http://semver.org/) for versioning. For the versions available, see the
[tags on this repository](https://github.com/sencha/mondorepo/tags). 

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
