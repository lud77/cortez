"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _sequence = require("./sequence");

var _sequence2 = _interopRequireDefault(_sequence);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var factory = function factory(getId, nodeFactory, edgeFactory) {
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
			nodes[edge.to].inbound[edge.from].push(id);
			nodes[edge.from].numOutbound++;
			nodes[edge.to].numInbound++;

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
			if (!edges[id]) return;

			if (options.onRemoveEdge) {
				options.onRemoveEdge(edges[id], options.context);
			}

			edgeCount--;
			delete edges[id];
		};

		var hasEdge = function hasEdge(from, to) {
			return !!from.outbound[getId(to)];
		};
		var getNodeById = function getNodeById(nodeId) {
			return nodes[nodeId];
		};
		var getEdgeById = function getEdgeById(edgeId) {
			return edges[edgeId];
		};
		var getNodes = function getNodes() {
			return nodes;
		};
		var getEdges = function getEdges() {
			return edges;
		};

		var link = function link(from, to, payload) {
			return addEdge(edgeFactory(getId(from), getId(to), payload));
		};

		return {
			nodes: nodes,
			edges: edges,
			nodeCount: nodeCount,
			edgeCount: edgeCount,
			hasEdge: hasEdge,
			pack: pack,
			mergeWith: mergeWith,
			addNode: addNode,
			addEdge: addEdge,
			removeNode: removeNode,
			removeEdge: removeEdge,
			getNodeById: getNodeById,
			getEdgeById: getEdgeById,
			getNodes: getNodes,
			getEdges: getEdges,
			link: link
		};
	};
};

exports.default = { factory: factory };