# cortez v0.1.12
> Graph data structure



## Installation

	npm i --save cortez


## Why?

Cortez is a graph data structure written in ES6 decoupling structure from content to allow merging of different graphs and concurrent graph modification in a distributed environment.

The aim of this library is to provide a performant proxy to work with relatively smaller subsets of huge graphs persisted in databases in a distributed architecture. Cortez should eventually make it possible to extract a fragment of a bigger graph, work on it by adding/removing/updating nodes or edges and then apply the changes to the original graph.

The library is currently at a very early stage.



# Features / Usage

The ES5 code is in the dist folder, while the src folder contains the ES6 sources.

Plain and generator-based versions of all query and graph traversal methods.





## Documentation

Install the package and open docs/index.html in the browser to review the methods documentation. You can also look at the test suite for real usage examples.





## Roadmap

- Extend support for undirected graphs
- Refine support for auto-edges
- Complete and expose fragment merging functionality
- Add a suite of basic algorithms such as graph search and coverage
- Provide better usage documentation and hints/best practices
- Provide benchmarks




## Licensing

This package is released under the [MIT License](https://opensource.org/licenses/MIT)

