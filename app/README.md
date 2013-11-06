
## Setup

Install [component](https://github.com/component)

    npm install component -g

Run

    make

open `index.html` in your browser.


Install [watch](https://github.com/visionmedia/watch) for a nicer workflow and run

    watch make


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
