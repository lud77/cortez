'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _sequence = require('./sequence');

var _sequence2 = _interopRequireDefault(_sequence);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getId = function getId(element) {
	return (typeof element === 'undefined' ? 'undefined' : _typeof(element)) === 'object' ? element.id : element;
};

var fragment = function fragment(_fragment) {
	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	var _ref = typeof _fragment === 'string' ? JSON.parse(_fragment) : _fragment,
	    nodes = _ref.nodes,
	    edges = _ref.edges,
	    nodeCount = _ref.nodeCount,
	    edgeCount = _ref.edgeCount;

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

	var mergeWith = function mergeWith(fragment) {
		var operand = Graph.fragment(fragment);
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

		nodes[edge.from].outbound[edge.to] = edge;
		nodes[edge.to].inbound[edge.from] = edge;
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

		if (options.onRemoveNode) {
			options.onRemoveNode(nodes[id], options.context);
		}

		for (var e in edges) {
			if (edges[e] && (edges[e].from.id == id || edges[e].to.id == id)) {
				removeEdge(e);
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

		var fromRode = nodes[edges[id].from.id];
		var toNode = nodes[edges[id].to.id];
		delete fromNode.outbound[edges[id].to.id];
		delete toNode.inbound[edges[id].from.id];
		fromNode.numOutbound--;
		toNode.numInbound--;

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
	var inflateEdges = function inflateEdges(edges) {};
	var inflateNodes = function inflateNodes(nodes) {};
	var getNodes = function getNodes() {
		return nodes;
	};
	var getEdges = function getEdges() {
		return edges;
	};
	var link = function link(from, to, payload) {
		return addEdge(edge(getId(from), getId(to), payload));
	};

	return {
		nodes: nodes,
		edges: edges,
		nodeCount: nodeCount,
		edgeCount: edgeCount,
		pack: pack,
		mergeWith: mergeWith,
		addNode: addNode,
		addEdge: addEdge,
		hasEdge: hasEdge,
		removeNode: removeNode,
		removeEdge: removeEdge,
		getNodeById: getNodeById,
		getEdgeById: getEdgeById,
		inflateNodes: inflateNodes,
		inflateEdges: inflateEdges,
		getNodes: getNodes,
		getEdges: getEdges,
		link: link
	};
};

var empty = function empty() {
	return fragment({
		nodeCount: 0,
		edgeCount: 0,
		nodes: {},
		edges: {}
	});
};

var node = function node(payload, metadata) {
	return {
		type: 'node',
		payload: payload,
		metadata: metadata,
		numOutbound: 0,
		numInbound: 0,
		outbound: {},
		inbound: {},
		inGraph: function inGraph() {
			return undefined.graph !== undefined;
		},
		getOutboundEdges: function getOutboundEdges() {
			return undefined.outbound;
		},
		getInboundEdges: function getInboundEdges() {
			return undefined.inbound;
		}
	};
};

var edge = function edge(from, to, payload, metadata) {
	return {
		type: 'edge',
		payload: payload,
		metadata: metadata,
		from: getId(from),
		to: getId(to),
		inGraph: function inGraph() {
			return undefined.graph !== undefined;
		}
	};
};

exports.default = {
	getId: getId,
	fragment: fragment,
	empty: empty,
	node: node,
	edge: edge
};