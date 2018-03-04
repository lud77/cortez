'use strict';

var get = require('lodash/get');
var map = require('lodash/map');
var matches = require('lodash/matches');
var flatten = require('lodash/flatten');
var values = require('lodash/values');
var filter = require('lodash/filter');

var sequenceFactory = require('./sequence');

var _require = require('./generator-utils'),
    yieldAll = _require.yieldAll,
    yieldMatching = _require.yieldMatching,
    yieldUnion = _require.yieldUnion,
    yieldMap = _require.yieldMap;

/**
 * Create a graph
 * @namespace graph
 * @param fragment - a Cortez object or a JSON-serialized Cortez instance
 * @param options - allowUndirected, onAddNode, onAddEdge, onRemoveNode, onRemoveEdge
 */


module.exports = function (fragment) {
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

	var getId = function getId(element) {
		return get(element, 'id', element);
	};

	var nodeSeq = sequenceFactory(nodeCount);
	var edgeSeq = sequenceFactory(edgeCount);

	var pack = function pack() {
		var newGraph = {};
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
		return hasUndirectedEdgesTo !== undefined && hasUndirectedEdgesFrom > 0;
	};

	var hasAnyEdge = function hasAnyEdge(from, to) {
		if (hasDirectedEdge(from, to)) return true;
		return hasUndirectedEdge(from, to);
	};

	var inflateNodes = function inflateNodes(nodeIds) {
		return map(nodeIds, getNode);
	};
	var inflateEdges = function inflateEdges(edgeIds) {
		return map(edgeIds, getEdge);
	};

	var inflateNodesGen = /*#__PURE__*/regeneratorRuntime.mark(function inflateNodesGen(nodeIdsGen) {
		return regeneratorRuntime.wrap(function inflateNodesGen$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						return _context.delegateYield(yieldMap(nodeIdsGen, getNode), 't0', 1);

					case 1:
					case 'end':
						return _context.stop();
				}
			}
		}, inflateNodesGen, this);
	});

	var inflateEdgesGen = /*#__PURE__*/regeneratorRuntime.mark(function inflateEdgesGen(edgeIdsGen) {
		return regeneratorRuntime.wrap(function inflateEdgesGen$(_context2) {
			while (1) {
				switch (_context2.prev = _context2.next) {
					case 0:
						return _context2.delegateYield(yieldMap(edgeIdsGen, getEdge), 't0', 1);

					case 1:
					case 'end':
						return _context2.stop();
				}
			}
		}, inflateEdgesGen, this);
	});

	var link = function link(from, to, payload, metadata, directed) {
		return addEdge(edgeFactory(getId(from), getId(to), payload, metadata, directed || !options.allowUndirected));
	};

	var getNodes = function getNodes(query) {
		return query ? filter(nodes, function (entry) {
			return matches(query)(entry.payload);
		}) : nodes;
	};

	var getNodesByQueryGen = /*#__PURE__*/regeneratorRuntime.mark(function getNodesByQueryGen(query) {
		var matchQuery, isMatch;
		return regeneratorRuntime.wrap(function getNodesByQueryGen$(_context3) {
			while (1) {
				switch (_context3.prev = _context3.next) {
					case 0:
						matchQuery = matches(query);

						isMatch = function isMatch(item) {
							return matchQuery(item.payload);
						};

						return _context3.delegateYield(yieldMatching(yieldAll(nodes), isMatch), 't0', 3);

					case 3:
					case 'end':
						return _context3.stop();
				}
			}
		}, getNodesByQueryGen, this);
	});

	var getNodesGen = /*#__PURE__*/regeneratorRuntime.mark(function getNodesGen(query) {
		return regeneratorRuntime.wrap(function getNodesGen$(_context4) {
			while (1) {
				switch (_context4.prev = _context4.next) {
					case 0:
						if (query) {
							_context4.next = 4;
							break;
						}

						return _context4.delegateYield(yieldAll(nodes), 't0', 2);

					case 2:
						_context4.next = 5;
						break;

					case 4:
						return _context4.delegateYield(getNodesByQueryGen(query), 't1', 5);

					case 5:
					case 'end':
						return _context4.stop();
				}
			}
		}, getNodesGen, this);
	});

	var squashEdges = function squashEdges(groups) {
		return flatten(values(groups));
	};

	var squashEdgesGen = /*#__PURE__*/regeneratorRuntime.mark(function squashEdgesGen(groups) {
		return regeneratorRuntime.wrap(function squashEdgesGen$(_context5) {
			while (1) {
				switch (_context5.prev = _context5.next) {
					case 0:
						return _context5.delegateYield(yieldUnion(map(groups, function (group) {
							return yieldAll(group);
						})), 't0', 1);

					case 1:
					case 'end':
						return _context5.stop();
				}
			}
		}, squashEdgesGen, this);
	});

	var getEdges = function getEdges(directed) {
		return function (edgeIds, query) {
			var edgesList = map(edgeIds, getEdge);
			var anyDirectedness = directed === undefined;
			if (!query && anyDirectedness) {
				return edgesList;
			} else {
				var matchesQuery = matches(query);
				if (anyDirectedness) {
					return filter(edgesList, function (entry) {
						return matchesQuery(entry.payload);
					});
				}

				var matchesDirectedness = function matchesDirectedness(edge) {
					return directed === isDirected(edge);
				};
				return filter(edgesList, function (entry) {
					return matchesDirectedness(entry) && matchesQuery(entry.payload);
				});
			}
		};
	};

	var getEdgesGen = function getEdgesGen(directed) {
		return (/*#__PURE__*/regeneratorRuntime.mark(function _callee(edgeIdsGenerator, query) {
				var edgesGenerator, anyDirectedness, matchesQuery, matchesDirectedness;
				return regeneratorRuntime.wrap(function _callee$(_context6) {
					while (1) {
						switch (_context6.prev = _context6.next) {
							case 0:
								edgesGenerator = yieldMap(edgeIdsGenerator, getEdge);
								anyDirectedness = directed === undefined;

								if (!(!query && anyDirectedness)) {
									_context6.next = 6;
									break;
								}

								return _context6.delegateYield(edgesGenerator, 't0', 4);

							case 4:
								_context6.next = 13;
								break;

							case 6:
								matchesQuery = matches(query);

								if (!anyDirectedness) {
									_context6.next = 11;
									break;
								}

								return _context6.delegateYield(yieldMatching(edgesGenerator, function (edge) {
									return matchesQuery(edge.payload);
								}), 't1', 9);

							case 9:
								_context6.next = 13;
								break;

							case 11:
								matchesDirectedness = function matchesDirectedness(edge) {
									return directed === isDirected(edge);
								};

								return _context6.delegateYield(yieldMatching(edgesGenerator, function (edge) {
									return matchesDirectedness(edge) && matchesQuery(edge.payload);
								}), 't2', 13);

							case 13:
							case 'end':
								return _context6.stop();
						}
					}
				}, _callee, this);
			})
		);
	};

	var getEdgesFrom = function getEdgesFrom(directed) {
		return function (node, query) {
			return getEdges(directed)(squashEdges(node.outbound), query);
		};
	};

	var getEdgesFromGen = function getEdgesFromGen(directed) {
		return (/*#__PURE__*/regeneratorRuntime.mark(function _callee2(node, query) {
				var edgesGen;
				return regeneratorRuntime.wrap(function _callee2$(_context7) {
					while (1) {
						switch (_context7.prev = _context7.next) {
							case 0:
								if (directed) {
									_context7.next = 5;
									break;
								}

								edgesGen = yieldUnion([squashEdgesGen(node.outbound), squashEdgesGen(node.inbound)]);
								return _context7.delegateYield(getEdgesGen(directed)(edgesGen, query), 't0', 3);

							case 3:
								_context7.next = 6;
								break;

							case 5:
								return _context7.delegateYield(getEdgesGen(directed)(squashEdgesGen(node.outbound), query), 't1', 6);

							case 6:
							case 'end':
								return _context7.stop();
						}
					}
				}, _callee2, this);
			})
		);
	};

	var getEdgesTo = function getEdgesTo(directed) {
		return function (node, query) {
			return getEdges(directed)(squashEdges(node.inbound), query);
		};
	};

	var getEdgesToGen = function getEdgesToGen(directed) {
		return (/*#__PURE__*/regeneratorRuntime.mark(function _callee3(node, query) {
				return regeneratorRuntime.wrap(function _callee3$(_context8) {
					while (1) {
						switch (_context8.prev = _context8.next) {
							case 0:
								return _context8.delegateYield(getEdgesGen(directed)(squashEdgesGen(node.inbound), query), 't0', 1);

							case 1:
							case 'end':
								return _context8.stop();
						}
					}
				}, _callee3, this);
			})
		);
	};

	var getEdgesBetween = function getEdgesBetween(directed) {
		return function (from, to, query) {
			return getEdges(directed)(getNode(from).outbound[getId(to)], query);
		};
	};

	var getEdgesBetweenGen = function getEdgesBetweenGen(directed) {
		return (/*#__PURE__*/regeneratorRuntime.mark(function _callee4(from, to, query) {
				return regeneratorRuntime.wrap(function _callee4$(_context9) {
					while (1) {
						switch (_context9.prev = _context9.next) {
							case 0:
								return _context9.delegateYield(getEdgesGen(directed)(yieldAll(getNode(from).outbound[getId(to)]), query), 't0', 1);

							case 1:
							case 'end':
								return _context9.stop();
						}
					}
				}, _callee4, this);
			})
		);
	};

	var getLinkedNodes = function getLinkedNodes(directed) {
		return function (node, query) {
			return map(getEdgesFrom(directed)(node, query), function (edge) {
				return nodes[edge.to];
			});
		};
	};

	var getLinkedNodesGen = function getLinkedNodesGen(directed) {
		return (/*#__PURE__*/regeneratorRuntime.mark(function _callee5(node, query) {
				return regeneratorRuntime.wrap(function _callee5$(_context10) {
					while (1) {
						switch (_context10.prev = _context10.next) {
							case 0:
								return _context10.delegateYield(yieldMap(getEdgesFromGen(directed)(node, query), function (edge) {
									return nodes[edge.to];
								}), 't0', 1);

							case 1:
							case 'end':
								return _context10.stop();
						}
					}
				}, _callee5, this);
			})
		);
	};

	var getLinkingNodes = function getLinkingNodes(directed) {
		return function (node, query) {
			return map(getEdgesTo(directed)(node, query), function (edge) {
				return nodes[edge.from];
			});
		};
	};

	var getLinkingNodesGen = function getLinkingNodesGen(directed) {
		return (/*#__PURE__*/regeneratorRuntime.mark(function _callee6(node, query) {
				return regeneratorRuntime.wrap(function _callee6$(_context11) {
					while (1) {
						switch (_context11.prev = _context11.next) {
							case 0:
								return _context11.delegateYield(yieldMap(getEdgesToGen(directed)(node, query), function (edge) {
									return nodes[edge.from];
								}), 't0', 1);

							case 1:
							case 'end':
								return _context11.stop();
						}
					}
				}, _callee6, this);
			})
		);
	};

	var nodeFactory = function nodeFactory(payload, metadata) {
		return {
			payload: payload,
			metadata: metadata,
			numOutbound: 0,
			numInbound: 0,
			outbound: {},
			inbound: {},
			hasUndirectedEdges: {}
		};
	};

	var edgeFactory = function edgeFactory(from, to, payload, metadata) {
		var directed = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
		return {
			directed: directed,
			payload: payload,
			metadata: metadata,
			from: getId(from),
			to: getId(to)
		};
	};

	return {
		nodes: nodes,
		edges: edges,
		nodeCount: nodeCount,
		edgeCount: edgeCount,
		getId: getId,
		node: nodeFactory,
		edge: edgeFactory,

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
   * Retrieve edges matching a query from a list of candidates
   * @function getEdges
   * @memberof graph
   * @param edgeIds - a list of candidate ids of edges
   * @param query - an object with a list of properties to be matched
   * @instance
   */
		getEdges: getEdges(),

		/**
   * Retrieve edges extending from a given node
   * @function getEdgesFrom
   * @memberof graph
   * @param node - the source node
   * @param query - an object with a list of properties to be matched
   * @instance
   */
		getEdgesFrom: getEdgesFrom(),

		/**
   * Retrieve edges reaching a given node
   * @function getEdgesTo
   * @memberof graph
   * @param node - the target node
   * @param query - an object with a list of properties to be matched
   * @instance
   */
		getEdgesTo: getEdgesTo(),

		/**
   * Retrieve edges extending from a given node to another given node
   * @function getEdgesBetween
   * @memberof graph
   * @param node - the source node
   * @param node - the target node
   * @param query - an object with a list of properties to be matched
   * @instance
   */
		getEdgesBetween: getEdgesBetween(),

		/**
   * Retrieve edges matching a query from a list of candidates, as a generator
   * @function getEdgesGen
   * @memberof graph
   * @param edgeIdsGenerator - a generator producing the ids of candidate edges
   * @param query - an object with a list of properties to be matched
   * @instance
   */
		getEdgesGen: getEdgesGen(),

		/**
   * Retrieve edges extending from a given node
   * @function getEdgesFromGen
   * @memberof graph
   * @param node - the source node
   * @param query - an object with a list of properties to be matched
   * @instance
   */
		getEdgesFromGen: getEdgesFromGen(),

		/**
   * Retrieve edges reaching a given node, as a generator
   * @function getEdgesToGen
   * @memberof graph
   * @param node - the target node
   * @param query - an object with a list of properties to be matched
   * @instance
   */
		getEdgesToGen: getEdgesToGen(),

		/**
   * Retrieve edges extending from a given node to another given node
   * @function getEdgesBetweenGen
   * @memberof graph
   * @param node - the source node
   * @param node - the target node
   * @param query - an object with a list of properties to be matched
   * @instance
   */
		getEdgesBetweenGen: getEdgesBetweenGen(),

		/**
   * Retrieve directed edges matching a query from a list of candidates
   * @function getDirectedEdges
   * @memberof graph
   * @param edgeIds - a list of candidate ids of edges
   * @param query - an object with a list of properties to be matched
   * @instance
   */
		getDirectedEdges: getEdges(true),

		/**
   * Retrieve directed edges extending from a given node
   * @function getDirectedEdgesFrom
   * @memberof graph
   * @param node - the source node
   * @param query - an object with a list of properties to be matched
   * @instance
   */
		getDirectedEdgesFrom: getEdgesFrom(true),

		/**
   * Retrieve directed edges reaching a given node
   * @function getDirectedEdgesTo
   * @memberof graph
   * @param node - the target node
   * @param query - an object with a list of properties to be matched
   * @instance
   */
		getDirectedEdgesTo: getEdgesTo(true),

		/**
   * Retrieve directed edges extending from a given node to another given node
   * @function getDirectedEdgesBetween
   * @memberof graph
   * @param node - the source node
   * @param node - the target node
   * @param query - an object with a list of properties to be matched
   * @instance
   */
		getDirectedEdgesBetween: getEdgesBetween(true),

		/**
   * Retrieve nodes reached by directed edges that extend from a given node
   * @function getLinkedNodes
   * @memberof graph
   * @param node - the target node
   * @param query - an object with a list of properties to be matched
   * @instance
   */
		getLinkedNodes: getLinkedNodes(true),

		/**
   * Retrieve nodes having directed edges that reach a given node
   * @function getLinkingNodes
   * @memberof graph
   * @param node - the target node
   * @param query - an object with a list of properties to be matched
   * @instance
   */
		getLinkingNodes: getLinkingNodes(true),

		/**
   * Retrieve directed edges matching a query from a list of candidates, as a generator
   * @function getDirectedEdgesGen
   * @memberof graph
   * @param edgeIdsGenerator - a generator producing the ids of candidate edges
   * @param query - an object with a list of properties to be matched
   * @instance
   */
		getDirectedEdgesGen: getEdgesGen(true),

		/**
   * Retrieve directed edges extending from a given node
   * @function getDirectedEdgesFromGen
   * @memberof graph
   * @param node - the source node
   * @param query - an object with a list of properties to be matched
   * @instance
   */
		getDirectedEdgesFromGen: getEdgesFromGen(true),

		/**
   * Retrieve directed edges reaching a given node, as a generator
   * @function getDirectedEdgesToGen
   * @memberof graph
   * @param node - the target node
   * @param query - an object with a list of properties to be matched
   * @instance
   */
		getDirectedEdgesToGen: getEdgesToGen(true),

		/**
   * Retrieve directed edges extending from a given node to another given node
   * @function getDirectedEdgesBetweenGen
   * @memberof graph
   * @param node - the source node
   * @param node - the target node
   * @param query - an object with a list of properties to be matched
   * @instance
   */
		getDirectedEdgesBetweenGen: getEdgesBetweenGen(true),

		/**
   * Retrieve directed nodes reached by directed edges that extend from a given node, as a generator
   * @function getLinkedNodesGen
   * @memberof graph
   * @param node - the target node
   * @param query - an object with a list of properties to be matched
   * @instance
   */
		getLinkedNodesGen: getLinkedNodesGen(true),

		/**
   * Retrieve nodes having directed edges that reach a given node
   * @function getLinkingNodesGen
   * @memberof graph
   * @param node - the target node
   * @param query - an object with a list of properties to be matched
   * @instance
   */
		getLinkingNodesGen: getLinkingNodesGen(true),

		/**
   * Retrieve undirected edges matching a query from a list of candidates
   * @function getUndirectedEdges
   * @memberof graph
   * @param edgeIds - a list of candidate ids of edges
   * @param query - an object with a list of properties to be matched
   * @instance
   */
		getUndirectedEdges: getEdges(false),

		/**
   * Retrieve undirected edges extending from a given node
   * @function getUndirectedEdgesFor
   * @memberof graph
   * @param node - the source node
   * @param query - an object with a list of properties to be matched
   * @instance
   */
		getUndirectedEdgesFor: getEdgesFrom(false),

		/**
   * Retrieve undirected edges extending from a given node to another given node
   * @function getUndirectedEdgesBetween
   * @memberof graph
   * @param node - the source node
   * @param node - the target node
   * @param query - an object with a list of properties to be matched
   * @instance
   */
		getUndirectedEdgesBetween: getEdgesBetween(false),

		/**
   * Retrieve nodes reached by undirected edges that extend from a given node
   * @function getConnectedNodes
   * @memberof graph
   * @param node - the target node
   * @param query - an object with a list of properties to be matched
   * @instance
   */
		getConnectedNodes: getLinkedNodes(false),

		/**
   * Retrieve undirected edges matching a query from a list of candidates, as a generator
   * @function getUndirectedEdgesGen
   * @memberof graph
   * @param edgeIdsGenerator - a generator producing the ids of candidate edges
   * @param query - an object with a list of properties to be matched
   * @instance
   */
		getUndirectedEdgesGen: getEdgesGen(false),

		/**
   * Retrieve undirected edges extending from a given node
   * @function getUndirectedEdgesForGen
   * @memberof graph
   * @param node - the source node
   * @param query - an object with a list of properties to be matched
   * @instance
   */
		getUndirectedEdgesForGen: getEdgesFromGen(false),

		/**
   * Retrieve undirected edges extending from a given node to another given node
   * @function getUndirectedEdgesBetweenGen
   * @memberof graph
   * @param node - the source node
   * @param node - the target node
   * @param query - an object with a list of properties to be matched
   * @instance
   */
		getUndirectedEdgesBetweenGen: getEdgesBetweenGen(false),

		/**
   * Retrieve nodes reached by undirected edges that extend from a given node, as a generator
   * @function getConnectedNodesGen
   * @memberof graph
   * @param node - the target node
   * @param query - an object with a list of properties to be matched
   * @instance
   */
		getConnectedNodesGen: getLinkedNodesGen(false)
	};
};