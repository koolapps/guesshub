
## Setup

To bootstrap dependencies etc.

    ./script/bootstrap

To start dev env:

    ./script/build-dev


## How does this work?

Uses [component](https://github.com/component) to manage third party deps, modules, and building.

### Structure

`boot` is the main app entry point, any new modules should be created `component create` and 
required from other modules. It uses CommonJS module pattern which is what node uses. Look at the 
sample apps sections in the component/component page to learn more about the file structure.

### Third party module registry

    component search $MODULE_NAME    

http://component.io/

https://github.com/component
