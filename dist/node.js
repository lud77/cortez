"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

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