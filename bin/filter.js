#!/usr/bin/env node
const inspect = require('../dist/index')
const { argv } = require('node:process');
const fs = require("fs");

const filter_for = [
  // List of packages to filter for
].map((x) => x.toLowerCase());

const depMaps = {};
const seen = [];

function walk(tree, path = []) {
  for(let dep in tree.dependencies) {
    const depTreeDep = tree.dependencies[dep];

    if( depTreeDep.dev ) continue;

    const key = dep + '=' + depTreeDep.version;

    if(!seen.includes(depTreeDep)) {
      seen.push(depTreeDep)
      walk(depTreeDep, [...path, key])
    }
    
    if (!filter_for.includes(dep)) continue;
    
    let depPaths = depMaps[key];
    if ( !depPaths) depPaths = [];
    depPaths.push(path);
    depMaps[key] = depPaths;
  }
}

inspect.buildDepTreeFromFiles(argv[2],argv[3], argv[4], false)
  .then((tree) => {
    walk(tree, [tree.name + '=' + tree.version]);
    console.log(JSON.stringify(depMaps))
  })
  .catch(console.error);
