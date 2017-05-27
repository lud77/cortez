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
   * @function hasDirectedEdge
   * @memberof graph
   * @param from - a node
   * @param to - a node
   */
		var hasDirectedEdge = function hasDirectedEdge(from, to) {
			return !!getNode(from).outbound[getId(to)];
		};

		/**
   * Checks if a couple of nodes has an undirected edge connecting them
   * @function hasUndirectedEdge
   * @memberof graph
   * @param from - a node
   * @param to - a node
   */
		var hasUndirectedEdge = function hasUndirectedEdge(from, to) {
			// todo: maintain a flag for each entry in inbound/outbound to avoid the O(n) test and make this O(1)
			var candidates = getNode(from).outbound[getId(to)];
			return (0, _find2.default)(candidates, { directed: false });
		};

		/**
   * Checks if a couple of nodes has a directed or undirected edge connecting them
   * @function hasEdge
   * @memberof graph
   * @param from - a node
   * @param to - a node
   */
		var hasEdge = function hasEdge(from, to) {
			if (hasDirectedEdge(from, to)) return true;
			return hasUndirectedEdge(to, from);
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

		var squashEdges = function squashEdges(groups) {
			return (0, _flatten2.default)((0, _values2.default)(groups));
		};

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

		return {
			nodes: nodes,
			edges: edges,
			nodeCount: nodeCount,
			edgeCount: edgeCount,
			hasEdge: !options.allowUndirected ? hasDirectedEdge : hasEdge,
			pack: pack,
			mergeWith: mergeWith,
			addNode: addNode,
			addEdge: addEdge,
			getNode: getNode,
			getEdge: getEdge,
			removeNode: removeNode,
			removeEdge: removeEdge,
			inflateNodes: inflateNodes,
			inflateEdges: inflateEdges,
			link: link,
			getNodes: getNodes,
			getEdgesFrom: getEdgesFrom,
			getEdgesTo: getEdgesTo,
			getEdgesBetween: getEdgesBetween,
			getLinkedNodes: getLinkedNodes,
			getLinkingNodes: getLinkingNodes
		};
	};
};