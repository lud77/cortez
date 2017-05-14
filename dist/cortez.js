"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _graph = require("./graph");

var _graph2 = _interopRequireDefault(_graph);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var factory = _graph2.default.factory;


var getId = function getId(element) {
	return element && (typeof element === "undefined" ? "undefined" : _typeof(element)) === "object" && element.id !== undefined ? element.id : element;
};

var node = function node(payload, metadata) {
	return {
		type: "node",
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
		type: "edge",
		payload: payload,
		metadata: metadata,
		from: getId(from),
		to: getId(to),
		inGraph: function inGraph() {
			return undefined.graph !== undefined;
		}
	};
};

var graph = factory(getId, node, edge);

exports.default = {
	getId: getId,
	graph: graph,
	node: node,
	edge: edge
};