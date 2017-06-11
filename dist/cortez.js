"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _get = require("lodash/get");

var _get2 = _interopRequireDefault(_get);

var _graph = require("./graph");

var _graph2 = _interopRequireDefault(_graph);

var _node = require("./node");

var _node2 = _interopRequireDefault(_node);

var _edge = require("./edge");

var _edge2 = _interopRequireDefault(_edge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getId = function getId(element) {
	return (0, _get2.default)(element, "id", element);
};

/**
 * Cortez object
 */
exports.default = {
	getId: getId,
	node: _node2.default,
	edge: (0, _edge2.default)(getId),
	graph: (0, _graph2.default)(getId, _node2.default, _edge2.default)
};