"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _map = require("lodash/map");

var _map2 = _interopRequireDefault(_map);

var _find = require("lodash/find");

var _find2 = _interopRequireDefault(_find);

var _matches = require("lodash/matches");

var _matches2 = _interopRequireDefault(_matches);

var _flatten = require("lodash/flatten");

var _flatten2 = _interopRequireDefault(_flatten);

var _values = require("lodash/values");

var _values2 = _interopRequireDefault(_values);

var _filter = require("lodash/filter");

var _filter2 = _interopRequireDefault(_filter);

var _sequence = require("./sequence");

var _sequence2 = _interopRequireDefault(_sequence);

var _generator = require("./generator");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Create a graph
 * @namespace graph
 * @param fragment - a Cortez object or a JSON-serialized Cortez instance
 * @param options - allowUndirected, onAddNode, onAddEdge, onRemoveNode, onRemoveEdge
 */
exports.default = function (getId, nodeFactory, edgeFactory) {
	return function (fragment) {
		var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		var _Object$assign = Object.assign({}, {
			nodeCount: 0,
			edgeCount: 0,
			nodes: {},
			edges: {}
		}, typeof fragment === "string" ? JSON.parse(fragment) : fragment),
		    nodes = _Object$assign.nodes,
		    edges = _Object$assign.edges,
		    nodeCount = _Object$assign.nodeCount,
		    edgeCount = _Object$assign.edgeCount;

		var nodeSeq = (0, _sequence2.default)(nodeCount);
		var edgeSeq = (0, _sequence2.default)(edgeCount);

		var pack = function pack() {
			var newGraph = empty();
			var mapping = {};

			for (var n in nodes) {
				if (nodes[n]) {
					mapping[n] = newGraph.addNode(Object.assign({}, nodes[n]));
				}
			}

			for (var e in edges) {
				if (edges[e]) {
					var id = newGraph.addAdge(Object.assign({}, edges[e]));
					newGraph.edges[id].from = mapping[newGraph.edges[id].from];
					newGraph.edges[id].to = mapping[newGraph.edges[id].to];
				}
			}

			return newGraph;
		};

		var mergeWith = function mergeWith(otherFragment) {
			var operand = fragment(otherFragment);
			var newGraph = pack();
			var mapping = {};

			for (var n in operand.nodes) {
				if (operand.nodes[n]) {
					mapping[n] = newGraph.addNode(Object.assign({}, operand.nodes[n]));
				}
			}

			for (var e in operand.edges) {
				if (operand.edges[e]) {
					var id = newGraph.addEdge(Object.assign({}, operand.edges[e]));
					newGraph.edges[id].from = mapping[newGraph.edges[id].from];
					newGraph.edges[id].to = mapping[newGraph.edges[id].to];
				}
			}

			return newGraph;
		};

		/**
   * Add a node to the graph
   * @function addNode
   * @memberof graph
   * @param node - a node object generated with cortez.node()
   * @fires options.onAddNode
   */
		var addNode = function addNode(node) {
			var id = nodeSeq.getNext();
			nodes[id] = Object.assign({}, node);

			nodes[id].id = id;
			nodes[id].graph = undefined;

			if (options.onAddNode) {
				options.onAddNode(nodes[id], options.context);
			}

			nodeCount++;
			return nodes[id];
		};

		/**
   * Add an edge to the graph
   * @function addEdge
   * @memberof graph
   * @param edge - an edge generated with cortez.edge()
   * @fires options.onAddEdge
   */
		var addEdge = function addEdge(edge) {
			var id = edgeSeq.getNext();
			edges[id] = Object.assign({}, edge);

			edges[id].id = id;
			edges[id].graph = undefined;

			if (!nodes[edge.from].outbound[edge.to]) {
				nodes[edge.from].outbound[edge.to] = [];
			}

			if (!nodes[edge.to].inbound[edge.from]) {
				nodes[edge.to].inbound[edge.from] = [];
			}

			nodes[edge.from].outbound[edge.to].push(id);
			nodes[edge.to].inbound[edge.from].push(id);
			nodes[edge.from].numOutbound++;
			nodes[edge.to].numInbound++;

			if (options.onAddEdge) {
				options.onAddEdge(edges[id], options.context);
			}

			edgeCount++;
			return edges[id];
		};

		/**
   * Remove a node from a graph
   * @function removeNode
   * @memberof graph
   * @param node - a node object or the id of a node
   * @fires options.onRemoveNode
   */
		var removeNode = function removeNode(node) {
			var id = getId(node);

			if (!nodes[id]) return;

			if (options.onRemoveNode) {
				options.onRemoveNode(nodes[id], options.context);
			}

			for (var g in nodes[id].inbound) {
				for (var e in nodes[id].inbound[g]) {
					removeEdge(nodes[id].inbound[g][e]);
				}
			}

			for (var _g in nodes[id].outbound) {
				for (var _e in nodes[id].outbound[_g]) {
					removeEdge(nodes[id].outbound[_g][_e]);
				}
			}

			nodeCount--;
			delete nodes[id];
		};

		/**
   * Remove an edge from a graph
   * @function removeEdge
   * @memberof graph
   * @param edge - an edge object or the id of an edge
   * @fires options.onRemoveEdge
   */
		var removeEdge = function removeEdge(edge) {
			var id = getId(edge);
			if (!edges[id]) return;

			if (options.onRemoveEdge) {
				options.onRemoveEdge(edges[id], options.context);
			}

			edgeCount--;
			delete edges[id];
		};

		/**
   * Retrieve a node given a node object or its id
   * @function getNode
   * @memberof graph
   * @param node - a node object or the id of a node
   */
		var getNode = function getNode(node) {
			return nodes[getId(node)];
		};

		/**
   * Retrieve an edge given an edge object or its id
   * @function getEdge
   * @memberof graph
   * @param node - an edge object or the id of an edge
   */
		var getEdge = function getEdge(edge) {
			return edges[getId(edge)];
		};

		/**
   * Checks if a couple of nodes has a directed edge connecting them
   * @function hasDirectEdge
   * @memberof graph
   * @param from - a node
   * @param to - a node
   */
		var hasDirectEdge = function hasDirectEdge(from, to) {
			return !!getNode(from).outbound[getId(to)];
		};

		/**
   * Checks if a couple of nodes has an undirected edge connecting them
   * @function hasUndirectedEdge
   * @memberof graph
   * @param from - a node
   * @param to - a node
   */
		// todo: maintain a flag for each entry in inbound/outbound to avoid the O(n) test and make this O(1)
		var hasUndirectedEdge = function hasUndirectedEdge(from, to) {
			return (0, _find2.default)(getNode(from).outbound[getId(to)], { directed: false });
		};

		/**
   * Checks if a couple of nodes has at least one edge connecting them
   * @function hasAnyEdge
   * @memberof graph
   * @param from - a node
   * @param to - a node
   */
		var hasAnyEdge = function hasAnyEdge(from, to) {
			if (hasDirectedEdge(from, to)) return true;
			return hasDirectedEdge(to, from);
		};

		/**
   * Retrieves a list of nodes
   * @function inflateNodes
   * @memberof graph
   * @param nodeIds - an array of ids of nodes to be retrieved
   */
		var inflateNodes = function inflateNodes(nodeIds) {
			return (0, _map2.default)(nodeIds, function (id) {
				return nodes[id];
			});
		};

		var inflateNodesGen = regeneratorRuntime.mark(function inflateNodesGen(nodeIdsGen) {
			return regeneratorRuntime.wrap(function inflateNodesGen$(_context) {
				while (1) {
					switch (_context.prev = _context.next) {
						case 0:
							return _context.delegateYield((0, _generator.yieldMap)(nodeIdsGen, function (id) {
								return nodes[id];
							}), "t0", 1);

						case 1:
						case "end":
							return _context.stop();
					}
				}
			}, inflateNodesGen, this);
		});

		/**
   * Retrieves a list of edges
   * @function inflateEdges
   * @memberof graph
   * @param edgeIds - an array of ids of edges to be retrieved
   */
		var inflateEdges = function inflateEdges(edgeIds) {
			return (0, _map2.default)(edgeIds, function (id) {
				return edges[id];
			});
		};

		var inflateEdgesGen = regeneratorRuntime.mark(function inflateEdgesGen(edgeIdsGen) {
			return regeneratorRuntime.wrap(function inflateEdgesGen$(_context2) {
				while (1) {
					switch (_context2.prev = _context2.next) {
						case 0:
							return _context2.delegateYield((0, _generator.yieldMap)(edgeIdsGen, function (id) {
								return edges[id];
							}), "t0", 1);

						case 1:
						case "end":
							return _context2.stop();
					}
				}
			}, inflateEdgesGen, this);
		});

		/**
   * Shortcut method to create an edge between two nodes
   * @function link
   * @memberof graph
   * @param from - a node
   * @param to - a node
   * @param payload - an object to be stored in the node
   * @param metadata - an additional object to be stored in the node
   * @param directed - whether the edge must be directed or not
   */
		var link = function link(from, to, payload, metadata, directed) {
			return addEdge(edgeFactory(getId(from), getId(to), payload, metadata, directed || !options.allowUndirected));
		};

		/**
   * Retrieve nodes matching a query
   * @function getNodes
   * @memberof graph
   * @param query - an object with a list of properties to be matched
   */
		var getNodes = function getNodes(query) {
			return query ? (0, _filter2.default)(nodes, function (entry) {
				return (0, _matches2.default)(query)(entry.payload);
			}) : nodes;
		};

		var getNodesByQueryGen = regeneratorRuntime.mark(function getNodesByQueryGen(query) {
			var matchQuery, isMatch;
			return regeneratorRuntime.wrap(function getNodesByQueryGen$(_context3) {
				while (1) {
					switch (_context3.prev = _context3.next) {
						case 0:
							matchQuery = (0, _matches2.default)(query);

							isMatch = function isMatch(item) {
								return matchQuery(item.payload);
							};

							return _context3.delegateYield((0, _generator.yieldMatching)((0, _generator.yieldAll)(nodes), isMatch), "t0", 3);

						case 3:
						case "end":
							return _context3.stop();
					}
				}
			}, getNodesByQueryGen, this);
		});

		/**
   * Returns a generator retrieving nodes matching a query
   * @function getNodesGen
   * @memberof graph
   * @param query - an object with a list of properties to be matched
   */
		var getNodesGen = regeneratorRuntime.mark(function getNodesGen(query) {
			return regeneratorRuntime.wrap(function getNodesGen$(_context4) {
				while (1) {
					switch (_context4.prev = _context4.next) {
						case 0:
							if (query) {
								_context4.next = 4;
								break;
							}

							return _context4.delegateYield((0, _generator.yieldAll)(nodes), "t0", 2);

						case 2:
							_context4.next = 5;
							break;

						case 4:
							return _context4.delegateYield(getNodesByQueryGen(query), "t1", 5);

						case 5:
						case "end":
							return _context4.stop();
					}
				}
			}, getNodesGen, this);
		});

		var squashEdges = function squashEdges(groups) {
			return (0, _flatten2.default)((0, _values2.default)(groups));
		};

		var squashEdgesGen = regeneratorRuntime.mark(function squashEdgesGen(groups) {
			return regeneratorRuntime.wrap(function squashEdgesGen$(_context5) {
				while (1) {
					switch (_context5.prev = _context5.next) {
						case 0:
							return _context5.delegateYield((0, _generator.yieldUnion)((0, _map2.default)(groups, function (group) {
								return (0, _generator.yieldAll)(group);
							})), "t0", 1);

						case 1:
						case "end":
							return _context5.stop();
					}
				}
			}, squashEdgesGen, this);
		});

		/**
   * Retrieve edges matching a query from a list of candidates
   * @function getEdges
   * @memberof graph
   * @param pool - a list of candidate ids of edges
   * @param query - an object with a list of properties to be matched
   */
		var getEdges = function getEdges(pool, query) {
			var edgeMap = (0, _map2.default)(pool, function (id) {
				return edges[id];
			});
			return query ? (0, _filter2.default)(edgeMap, function (entry) {
				return (0, _matches2.default)(query)(entry.payload);
			}) : edgeMap;
		};

		var getEdgesbyQueryGen = regeneratorRuntime.mark(function getEdgesbyQueryGen(generator, query) {
			var matchQuery, isMatch;
			return regeneratorRuntime.wrap(function getEdgesbyQueryGen$(_context6) {
				while (1) {
					switch (_context6.prev = _context6.next) {
						case 0:
							matchQuery = (0, _matches2.default)(query);

							isMatch = function isMatch(item) {
								return matchQuery(item.payload);
							};

							return _context6.delegateYield((0, _generator.yieldMatching)(generator, isMatch), "t0", 3);

						case 3:
						case "end":
							return _context6.stop();
					}
				}
			}, getEdgesbyQueryGen, this);
		});

		var getEdgesGen = regeneratorRuntime.mark(function getEdgesGen(edgeIdsGenerator, query) {
			var edgesGenerator;
			return regeneratorRuntime.wrap(function getEdgesGen$(_context7) {
				while (1) {
					switch (_context7.prev = _context7.next) {
						case 0:
							edgesGenerator = (0, _generator.yieldMap)(edgeIdsGenerator, function (id) {
								return edges[id];
							});

							if (query) {
								_context7.next = 5;
								break;
							}

							return _context7.delegateYield(edgesGenerator, "t0", 3);

						case 3:
							_context7.next = 6;
							break;

						case 5:
							return _context7.delegateYield(getEdgesbyQueryGen(edgesGenerator, query), "t1", 6);

						case 6:
						case "end":
							return _context7.stop();
					}
				}
			}, getEdgesGen, this);
		});

		/**
   * Retrieve edges extending from a given node
   * @function getEdgesFrom
   * @memberof graph
   * @param node - the source node
   * @param query - an object with a list of properties to be matched
   */
		var getEdgesFrom = function getEdgesFrom(node, query) {
			return getEdges(squashEdges(node.outbound), query);
		};

		var getEdgesFromGen = regeneratorRuntime.mark(function getEdgesFromGen(node, query) {
			return regeneratorRuntime.wrap(function getEdgesFromGen$(_context8) {
				while (1) {
					switch (_context8.prev = _context8.next) {
						case 0:
							return _context8.delegateYield(getEdgesGen(squashEdgesGen(node.outbound), query), "t0", 1);

						case 1:
						case "end":
							return _context8.stop();
					}
				}
			}, getEdgesFromGen, this);
		});

		/**
   * Retrieve edges reaching a given node
   * @function getEdgesTo
   * @memberof graph
   * @param node - the target node
   * @param query - an object with a list of properties to be matched
   */
		var getEdgesTo = function getEdgesTo(node, query) {
			return getEdges(squashEdges(node.inbound), query);
		};

		var getEdgesToGen = regeneratorRuntime.mark(function getEdgesToGen(node, query) {
			return regeneratorRuntime.wrap(function getEdgesToGen$(_context9) {
				while (1) {
					switch (_context9.prev = _context9.next) {
						case 0:
							return _context9.delegateYield(getEdgesGen(squashEdgesGen(node.inbound), query), "t0", 1);

						case 1:
						case "end":
							return _context9.stop();
					}
				}
			}, getEdgesToGen, this);
		});

		/**
   * Retrieve edges extending from a given node to another given node
   * @function getEdgesBetween
   * @memberof graph
   * @param node - the source node
   * @param node - the target node
   * @param query - an object with a list of properties to be matched
   */
		var getEdgesBetween = function getEdgesBetween(from, to, query) {
			return getEdges(getNode(from).outbound[getId(to)], query);
		};

		var getEdgesBetweenGen = regeneratorRuntime.mark(function getEdgesBetweenGen(from, to, query) {
			return regeneratorRuntime.wrap(function getEdgesBetweenGen$(_context10) {
				while (1) {
					switch (_context10.prev = _context10.next) {
						case 0:
							return _context10.delegateYield(getEdgesGen((0, _generator.yieldAll)(getNode(from).outbound[getId(to)]), query), "t0", 1);

						case 1:
						case "end":
							return _context10.stop();
					}
				}
			}, getEdgesBetweenGen, this);
		});

		/**
   * Retrieve nodes reached by edges that extend from a given node
   * @function getLinkedNodes
   * @memberof graph
   * @param node - the target node
   * @param query - an object with a list of properties to be matched
   */
		var getLinkedNodes = function getLinkedNodes(node, query) {
			return (0, _map2.default)(getEdgesFrom(node, query), function (edge) {
				return nodes[edge.to];
			});
		};

		var getLinkedNodesGen = regeneratorRuntime.mark(function getLinkedNodesGen(node, query) {
			return regeneratorRuntime.wrap(function getLinkedNodesGen$(_context11) {
				while (1) {
					switch (_context11.prev = _context11.next) {
						case 0:
							return _context11.delegateYield((0, _generator.yieldMap)(getEdgesFromGen(node, query), function (edge) {
								return nodes[edge.to];
							}), "t0", 1);

						case 1:
						case "end":
							return _context11.stop();
					}
				}
			}, getLinkedNodesGen, this);
		});

		/**
  * Retrieve nodes having edges that reach a given node
  * @function getLinkingNodes
  * @memberof graph
  * @param node - the target node
  * @param query - an object with a list of properties to be matched
  */
		var getLinkingNodes = function getLinkingNodes(node, query) {
			return (0, _map2.default)(getEdgesTo(node, query), function (edge) {
				return nodes[edge.from];
			});
		};

		var getLinkingNodesGen = regeneratorRuntime.mark(function getLinkingNodesGen(node, query) {
			return regeneratorRuntime.wrap(function getLinkingNodesGen$(_context12) {
				while (1) {
					switch (_context12.prev = _context12.next) {
						case 0:
							return _context12.delegateYield((0, _generator.yieldMap)(getEdgesToGen(node, query), function (edge) {
								return nodes[edge.from];
							}), "t0", 1);

						case 1:
						case "end":
							return _context12.stop();
					}
				}
			}, getLinkingNodesGen, this);
		});

		return {
			nodes: nodes,
			edges: edges,
			nodeCount: nodeCount,
			edgeCount: edgeCount,
			hasAnyEdge: !options.allowUndirected ? hasDirectEdge : hasAnyEdge,
			pack: pack,
			mergeWith: mergeWith,
			addNode: addNode,
			addEdge: addEdge,
			getNode: getNode,
			getEdge: getEdge,
			removeNode: removeNode,
			removeEdge: removeEdge,
			inflateNodes: inflateNodes,
			inflateNodesGen: inflateNodesGen,
			inflateEdges: inflateEdges,
			inflateEdgesGen: inflateEdgesGen,
			link: link,
			getNodes: getNodes,
			getNodesGen: getNodesGen,
			getEdgesFrom: getEdgesFrom,
			getEdgesFromGen: getEdgesFromGen,
			getEdgesTo: getEdgesTo,
			getEdgesToGen: getEdgesToGen,
			getEdgesBetween: getEdgesBetween,
			getEdgesBetweenGen: getEdgesBetweenGen,
			getLinkedNodes: getLinkedNodes,
			getLinkedNodesGen: getLinkedNodesGen,
			getLinkingNodes: getLinkingNodes,
			getLinkingNodesGen: getLinkingNodesGen
		};
	};
};