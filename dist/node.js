"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

/**
 * Create a node
 * @function node
 * @param payload - an object to be stored in the node
 * @param metadata - an object ot be stored in the node
 */
exports.default = function (payload, metadata) {
	return {
		type: "node",
		payload: payload,
		metadata: metadata,
		numOutbound: 0,
		numInbound: 0,
		outbound: {},
		inbound: {}
	};
};