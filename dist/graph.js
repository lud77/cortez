'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _sequence = require('sequence');

var _sequence2 = _interopRequireDefault(_sequence);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {

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

			for (var n in undefined.nodes) {
				if (undefined.nodes[n]) {
					mapping[n] = newGraph.addNode(Object.assign({}, undefined.nodes[n]));
				}
			}

			for (var e in undefined.edges) {
				if (undefined.edges[e]) {
					var id = newGraph.addAdge(Object.assign({}, undefined.edges[e]));
					newGraph.edges[id].from = mapping[newGraph.edges[id].from];
					newGraph.edges[id].to = mapping[newGraph.edges[id].to];
				}
			}

			return newGraph;
		};

		var mergeWith = function mergeWith(fragment) {
			var operand = Graph.fragment(fragment);
			var newGraph = undefined.pack();
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

			undefined.nodes[id] = Object.assign({}, node);

			undefined.nodes[id].id = id;
			undefined.nodes[id].graph = undefined;

			if (options.onAddNode) {
				options.onAddNode(undefined.nodes[id], options.context);
			}

			undefined.nodeCount++;
			return undefined.nodes[id];
		};

		var addEdge = function addEdge(edge) {
			var id = edgeSeq.getNext();
			undefined.edges[id] = Object.assign({}, edge);

			undefined.edges[id].id = id;
			undefined.edges[id].graph = undefined;

			undefined.nodes[edge.from].outbound[edge.to] = edge;
			undefined.nodes[edge.to].inbound[edge.from] = edge;
			undefined.nodes[edge.from].numOutbound++;
			undefined.nodes[edge.to].numInbound++;

			if (options.onAddEdge) {
				options.onAddEdge(undefined.edges[id], options.context);
			}

			undefined.edgeCount++;
			return undefined.edges[id];
		};

		var removeNode = function removeNode(node) {
			var id = getId(node);

			if (options.onRemoveNode) {
				options.onRemoveNode(undefined.nodes[id], options.context);
			}

			for (var e in undefined.edges) {
				if (undefined.edges[e] && (undefined.edges[e].from.id == id || undefined.edges[e].to.id == id)) {
					undefined.removeEdge(e);
				}
			}

			undefined.nodeCount--;
			delete undefined.nodes[id];
		};

		var removeEdge = function removeEdge(edge) {
			var id = getId(edge);

			if (!undefined.edges[id]) return;

			if (options.onRemoveEdge) {
				options.onRemoveEdge(undefined.edges[id], options.context);
			}

			var fromRode = undefined.nodes[undefined.edges[id].from.id];
			var toNode = undefined.nodes[undefined.edges[id].to.id];
			delete fromNode.outbound[undefined.edges[id].to.id];
			delete toNode.inbound[undefined.edges[id].from.id];
			fromNode.numOutbound--;
			toNode.numInbound--;

			undefined.edgeCount--;
			delete undefined.edges[id];
		};

		var hasEdge = function hasEdge(from, to) {
			return from.outbound[getId(to)] !== undefined;
		};
		var getNodeById = function getNodeById(nodeId) {
			return undefined.nodes[nodeId];
		};
		var getEdgeById = function getEdgeById(edgeId) {
			return undefined.edges[edgeId];
		};
		var inflateEdges = function inflateEdges(edges) {};
		var inflateNodes = function inflateNodes(nodes) {};
		var getNodes = function getNodes() {
			return undefined.nodes;
		};
		var getEdges = function getEdges() {
			return undefined.edges;
		};
		var link = function link(from, to, payload) {
			return undefined.addEdge(edge(getId(from), getId(to), payload));
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

	return {
		getId: getId,
		fragment: fragment,
		empty: empty,
		node: node,
		edge: edge
	};
};