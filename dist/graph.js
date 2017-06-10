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

var _generatorUtils = require("./generator-utils");

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
					var id = newGraph.addEdge(Object.assign({}, edges[e]));
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
			nodes[edge.from].numOutbound++;

			nodes[edge.to].inbound[edge.from].push(id);
			nodes[edge.to].numInbound++;

			if (options.allowUndirected && !edge.directed) {
				if (!nodes[edge.from].hasUndirectedEdges[edge.to]) {
					nodes[edge.from].hasUndirectedEdges[edge.to] = 0;
				}

				if (!nodes[edge.to].hasUndirectedEdges[edge.from]) {
					nodes[edge.to].hasUndirectedEdges[edge.from] = 0;
				}

				nodes[edge.from].hasUndirectedEdges[edge.to]++;
				nodes[edge.to].hasUndirectedEdges[edge.from]++;
			}

			if (options.onAddEdge) {
				options.onAddEdge(edges[id], options.context);
			}

			edgeCount++;
			return edges[id];
		};

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

		var removeEdge = function removeEdge(edge) {
			var id = getId(edge);

			var edgeObj = edges[id];
			if (!edgeObj) return;

			if (options.onRemoveEdge) {
				options.onRemoveEdge(edges[id], options.context);
			}

			if (options.allowUndirected && !edgeObj.directed) {
				nodes[edgeObj.from].hasUndirectedEdges[edgeObj.to]--;
				nodes[edgeObj.to].hasUndirectedEdges[edgeObj.from]--;
			}

			edgeCount--;
			delete edges[id];
		};

		var getNode = function getNode(node) {
			return nodes[getId(node)];
		};
		var getEdge = function getEdge(edge) {
			return edges[getId(edge)];
		};
		var isDirected = function isDirected(edge) {
			return edge.directed;
		};
		var hasDirectedEdge = function hasDirectedEdge(from, to) {
			return !!getNode(from).outbound[getId(to)];
		};

		var hasUndirectedEdge = function hasUndirectedEdge(from, to) {
			var hasUndirectedEdgesFrom = getNode(from).hasUndirectedEdges[getId(to)];
			if (hasUndirectedEdgesFrom !== undefined && hasUndirectedEdgesFrom > 0) return true;

			var hasUndirectedEdgesTo = getNode(to).hasUndirectedEdges[getId(from)];
			return hasUndirectedEdgesFrom !== undefined && hasUndirectedEdgesFrom > 0;
		};

		var hasAnyEdge = function hasAnyEdge(from, to) {
			if (hasDirectedEdge(from, to)) return true;
			return hasUndirectedEdge(from, to);
		};

		var inflateNodes = function inflateNodes(nodeIds) {
			return (0, _map2.default)(nodeIds, getNode);
		};
		var inflateEdges = function inflateEdges(edgeIds) {
			return (0, _map2.default)(edgeIds, getEdge);
		};

		var inflateNodesGen = regeneratorRuntime.mark(function inflateNodesGen(nodeIdsGen) {
			return regeneratorRuntime.wrap(function inflateNodesGen$(_context) {
				while (1) {
					switch (_context.prev = _context.next) {
						case 0:
							return _context.delegateYield((0, _generatorUtils.yieldMap)(nodeIdsGen, getNode), "t0", 1);

						case 1:
						case "end":
							return _context.stop();
					}
				}
			}, inflateNodesGen, this);
		});

		var inflateEdgesGen = regeneratorRuntime.mark(function inflateEdgesGen(edgeIdsGen) {
			return regeneratorRuntime.wrap(function inflateEdgesGen$(_context2) {
				while (1) {
					switch (_context2.prev = _context2.next) {
						case 0:
							return _context2.delegateYield((0, _generatorUtils.yieldMap)(edgeIdsGen, getEdge), "t0", 1);

						case 1:
						case "end":
							return _context2.stop();
					}
				}
			}, inflateEdgesGen, this);
		});

		var link = function link(from, to, payload, metadata, directed) {
			return addEdge(edgeFactory(getId(from), getId(to), payload, metadata, directed || !options.allowUndirected));
		};

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

							return _context3.delegateYield((0, _generatorUtils.yieldMatching)((0, _generatorUtils.yieldAll)(nodes), isMatch), "t0", 3);

						case 3:
						case "end":
							return _context3.stop();
					}
				}
			}, getNodesByQueryGen, this);
		});

		var getNodesGen = regeneratorRuntime.mark(function getNodesGen(query) {
			return regeneratorRuntime.wrap(function getNodesGen$(_context4) {
				while (1) {
					switch (_context4.prev = _context4.next) {
						case 0:
							if (query) {
								_context4.next = 4;
								break;
							}

							return _context4.delegateYield((0, _generatorUtils.yieldAll)(nodes), "t0", 2);

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
							return _context5.delegateYield((0, _generatorUtils.yieldUnion)((0, _map2.default)(groups, function (group) {
								return (0, _generatorUtils.yieldAll)(group);
							})), "t0", 1);

						case 1:
						case "end":
							return _context5.stop();
					}
				}
			}, squashEdgesGen, this);
		});

		var getEdges = function getEdges(directed, edgeIds, query) {
			var edgesList = (0, _map2.default)(edgeIds, getEdge);
			var anyDirectedness = directed === undefined;
			if (!query && anyDirectedness) {
				return edgesList;
			} else {
				var matchesQuery = (0, _matches2.default)(query);
				if (anyDirectedness) {
					var _matchesDirectedness = function _matchesDirectedness(edge) {
						return directed === isDirected(edge);
					};
					return (0, _filter2.default)(edgesList, function (entry) {
						return matchesQuery(entry.payload);
					});
				}

				return (0, _filter2.default)(edgesList, function (entry) {
					return matchesDirectedness(entry) && matchesQuery(entry.payload);
				});
			}

			return edgesList;
		};

		var getEdgesGen = regeneratorRuntime.mark(function getEdgesGen(directed, edgeIdsGenerator, query) {
			var edgesGenerator, anyDirectedness, matchesQuery, _matchesDirectedness2;

			return regeneratorRuntime.wrap(function getEdgesGen$(_context6) {
				while (1) {
					switch (_context6.prev = _context6.next) {
						case 0:
							edgesGenerator = (0, _generatorUtils.yieldMap)(edgeIdsGenerator, getEdge);
							anyDirectedness = directed === undefined;

							if (!(!query && anyDirectedness)) {
								_context6.next = 6;
								break;
							}

							return _context6.delegateYield(edgesGenerator, "t0", 4);

						case 4:
							_context6.next = 13;
							break;

						case 6:
							matchesQuery = (0, _matches2.default)(query);

							if (!anyDirectedness) {
								_context6.next = 11;
								break;
							}

							return _context6.delegateYield((0, _generatorUtils.yieldMatching)(edgesGenerator, function (edge) {
								return matchesQuery(edge.payload);
							}), "t1", 9);

						case 9:
							_context6.next = 13;
							break;

						case 11:
							_matchesDirectedness2 = function _matchesDirectedness2(edge) {
								return directed === isDirected(edge);
							};

							return _context6.delegateYield((0, _generatorUtils.yieldMatching)(edgesGenerator, function (edge) {
								return _matchesDirectedness2(edge) && matchesQuery(edge.payload);
							}), "t2", 13);

						case 13:
						case "end":
							return _context6.stop();
					}
				}
			}, getEdgesGen, this);
		});

		var getEdgesFrom = function getEdgesFrom(directed, node, query) {
			return getEdges(directed, squashEdges(node.outbound), query);
		};

		var getEdgesFromGen = regeneratorRuntime.mark(function getEdgesFromGen(directed, node, query) {
			return regeneratorRuntime.wrap(function getEdgesFromGen$(_context7) {
				while (1) {
					switch (_context7.prev = _context7.next) {
						case 0:
							return _context7.delegateYield(getEdgesGen(directed, squashEdgesGen(node.outbound), query), "t0", 1);

						case 1:
						case "end":
							return _context7.stop();
					}
				}
			}, getEdgesFromGen, this);
		});

		var getEdgesTo = function getEdgesTo(directed, node, query) {
			return getEdges(directed, squashEdges(node.inbound), query);
		};

		var getEdgesToGen = regeneratorRuntime.mark(function getEdgesToGen(directed, node, query) {
			return regeneratorRuntime.wrap(function getEdgesToGen$(_context8) {
				while (1) {
					switch (_context8.prev = _context8.next) {
						case 0:
							return _context8.delegateYield(getEdgesGen(directed, squashEdgesGen(node.inbound), query), "t0", 1);

						case 1:
						case "end":
							return _context8.stop();
					}
				}
			}, getEdgesToGen, this);
		});

		var getEdgesBetween = function getEdgesBetween(directed, from, to, query) {
			return getEdges(directed, getNode(from).outbound[getId(to)], query);
		};

		var getEdgesBetweenGen = regeneratorRuntime.mark(function getEdgesBetweenGen(directed, from, to, query) {
			return regeneratorRuntime.wrap(function getEdgesBetweenGen$(_context9) {
				while (1) {
					switch (_context9.prev = _context9.next) {
						case 0:
							return _context9.delegateYield(getEdgesGen(directed, (0, _generatorUtils.yieldAll)(getNode(from).outbound[getId(to)]), query), "t0", 1);

						case 1:
						case "end":
							return _context9.stop();
					}
				}
			}, getEdgesBetweenGen, this);
		});

		var getLinkedNodes = function getLinkedNodes(directed, node, query) {
			return (0, _map2.default)(getEdgesFrom(directed, node, query), function (edge) {
				return nodes[edge.to];
			});
		};

		var getLinkedNodesGen = regeneratorRuntime.mark(function getLinkedNodesGen(directed, node, query) {
			return regeneratorRuntime.wrap(function getLinkedNodesGen$(_context10) {
				while (1) {
					switch (_context10.prev = _context10.next) {
						case 0:
							return _context10.delegateYield((0, _generatorUtils.yieldMap)(getEdgesFromGen(directed, node, query), function (edge) {
								return nodes[edge.to];
							}), "t0", 1);

						case 1:
						case "end":
							return _context10.stop();
					}
				}
			}, getLinkedNodesGen, this);
		});

		var getLinkingNodes = function getLinkingNodes(directed, node, query) {
			return (0, _map2.default)(getEdgesTo(directed, node, query), function (edge) {
				return nodes[edge.from];
			});
		};

		var getLinkingNodesGen = regeneratorRuntime.mark(function getLinkingNodesGen(directed, node, query) {
			return regeneratorRuntime.wrap(function getLinkingNodesGen$(_context11) {
				while (1) {
					switch (_context11.prev = _context11.next) {
						case 0:
							return _context11.delegateYield((0, _generatorUtils.yieldMap)(getEdgesToGen(directed, node, query), function (edge) {
								return nodes[edge.from];
							}), "t0", 1);

						case 1:
						case "end":
							return _context11.stop();
					}
				}
			}, getLinkingNodesGen, this);
		});

		return {
			nodes: nodes,
			edges: edges,
			nodeCount: nodeCount,
			edgeCount: edgeCount,

			/**
    * Checks if a pair of nodes has at least one edge connecting them
    * @function hasAnyEdge
    * @memberof graph
    * @param from - a node
    * @param to - a node
    * @instance
    */
			hasAnyEdge: options.allowUndirected ? hasAnyEdge : hasDirectedEdge,

			/**
    * Checks if a pair of nodes has a directed edge connecting them
    * @function hasDirectedEdge
    * @memberof graph
    * @param from - a node
    * @param to - a node
    * @instance
    */
			hasDirectedEdge: hasDirectedEdge,

			/**
    * Checks if a pair of nodes has an undirected edge connecting them
    * @function hasUndirectedEdge
    * @memberof graph
    * @param from - a node
    * @param to - a node
    * @instance
    */
			hasUndirectedEdge: options.allowUndirected ? hasUndirectedEdge : undefined,

			pack: pack,
			mergeWith: mergeWith,

			/**
    * Add a node to the graph
    * @function addNode
    * @memberof graph
    * @param node - a node object generated with cortez.node()
    * @fires options.onAddNode
    * @instance
    */
			addNode: addNode,

			/**
    * Add an edge to the graph
    * @function addEdge
    * @memberof graph
    * @param edge - an edge generated with cortez.edge()
    * @fires options.onAddEdge
    * @instance
    */
			addEdge: addEdge,

			/**
    * Retrieve a node given a node object or its id
    * @function getNode
    * @memberof graph
    * @param node - a node object or the id of a node
    * @instance
    */
			getNode: getNode,

			/**
    * Retrieve an edge given an edge object or its id
    * @function getEdge
    * @memberof graph
    * @param node - an edge object or the id of an edge
    * @instance
    */
			getEdge: getEdge,

			/**
    * Remove a node from a graph
    * @function removeNode
    * @memberof graph
    * @param node - a node object or the id of a node
    * @fires options.onRemoveNode
    * @instance
    */
			removeNode: removeNode,

			/**
    * Remove an edge from a graph
    * @function removeEdge
    * @memberof graph
    * @param edge - an edge object or the id of an edge
    * @fires options.onRemoveEdge
    * @instance
    */
			removeEdge: removeEdge,

			/**
    * Shortcut method to create an edge between two nodes
    * @function link
    * @memberof graph
    * @param from - a node
    * @param to - a node
    * @param payload - an object to be stored in the node
    * @param metadata - an additional object to be stored in the node
    * @param directed - whether the edge must be directed or not
    * @instance
    */
			link: link,

			/**
    * Retrieves a list of nodes
    * @function inflateNodes
    * @memberof graph
    * @param nodeIds - an array of ids of nodes to be retrieved
    * @instance
    */
			inflateNodes: inflateNodes,

			/**
    * Retrieves a list of edges
    * @function inflateEdges
    * @memberof graph
    * @param edgeIds - an array of ids of edges to be retrieved
    * @instance
    */
			inflateEdges: inflateEdges,

			/**
    * Retrieve nodes matching a query
    * @function getNodes
    * @memberof graph
    * @param query - an object with a list of properties to be matched
    * @instance
    */
			getNodes: getNodes,

			/**
    * Retrieve edges matching a query from a list of candidates
    * @function getEdges
    * @memberof graph
    * @param edgeIds - a list of candidate ids of edges
    * @param query - an object with a list of properties to be matched
    * @instance
    */
			getEdges: getEdges,

			/**
    * Retrieve edges extending from a given node
    * @function getEdgesFrom
    * @memberof graph
    * @param node - the source node
    * @param query - an object with a list of properties to be matched
    * @instance
    */
			getEdgesFrom: getEdgesFrom,

			/**
    * Retrieve edges reaching a given node
    * @function getEdgesTo
    * @memberof graph
    * @param node - the target node
    * @param query - an object with a list of properties to be matched
    * @instance
    */
			getEdgesTo: getEdgesTo,

			/**
    * Retrieve edges extending from a given node to another given node
    * @function getEdgesBetween
    * @memberof graph
    * @param node - the source node
    * @param node - the target node
    * @param query - an object with a list of properties to be matched
    * @instance
    */
			getEdgesBetween: getEdgesBetween,

			/**
    * Retrieve nodes reached by edges that extend from a given node
    * @function getLinkedNodes
    * @memberof graph
    * @param node - the target node
    * @param query - an object with a list of properties to be matched
    * @instance
    */
			getLinkedNodes: getLinkedNodes,

			/**
    * Retrieve nodes having edges that reach a given node
    * @function getLinkingNodes
    * @memberof graph
    * @param node - the target node
    * @param query - an object with a list of properties to be matched
    * @instance
    */
			getLinkingNodes: getLinkingNodes,

			/**
    * Retrieves a list of nodes as a generator
    * @function inflateNodesGen
    * @memberof graph
    * @param nodeIdsGen - a generator producing the ids of nodes to be retrieved
    * @instance
    */
			inflateNodesGen: inflateNodesGen,

			/**
    * Retrieves a list of edges as a generator
    * @function inflateEdgesGen
    * @memberof graph
    * @param edgeIdsGen - a generator producing the ids of edges to be retrieved
    * @instance
    */
			inflateEdgesGen: inflateEdgesGen,

			/**
    * Returns a generator retrieving nodes matching a query
    * @function getNodesGen
    * @memberof graph
    * @param query - an object with a list of properties to be matched
    * @instance
    */
			getNodesGen: getNodesGen,

			/**
    * Retrieve edges matching a query from a list of candidates, as a generator
    * @function getEdgesGen
    * @memberof graph
    * @param edgeIdsGenerator - a generator producing the ids of candidate edges
    * @param query - an object with a list of properties to be matched
    * @instance
    */
			getEdgesGen: getEdgesGen,

			/**
    * Retrieve edges extending from a given node
    * @function getEdgesFromGen
    * @memberof graph
    * @param node - the source node
    * @param query - an object with a list of properties to be matched
    * @instance
    */
			getEdgesFromGen: getEdgesFromGen,

			/**
    * Retrieve edges reaching a given node, as a generator
    * @function getEdgesToGen
    * @memberof graph
    * @param node - the target node
    * @param query - an object with a list of properties to be matched
    * @instance
    */
			getEdgesToGen: getEdgesToGen,

			/**
    * Retrieve edges extending from a given node to another given node
    * @function getEdgesBetweenGen
    * @memberof graph
    * @param node - the source node
    * @param node - the target node
    * @param query - an object with a list of properties to be matched
    * @instance
    */
			getEdgesBetweenGen: getEdgesBetweenGen,

			/**
    * Retrieve nodes reached by edges that extend from a given node, as a generator
    * @function getLinkedNodesGen
    * @memberof graph
    * @param node - the target node
    * @param query - an object with a list of properties to be matched
    * @instance
    */
			getLinkedNodesGen: getLinkedNodesGen,

			/**
    * Retrieve nodes having edges that reach a given node
    * @function getLinkingNodesGen
    * @memberof graph
    * @param node - the target node
    * @param query - an object with a list of properties to be matched
    * @instance
    */
			getLinkingNodesGen: getLinkingNodesGen
		};
	};
};