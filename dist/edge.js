"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

/**
 * Create a edge
 * @function edge
 * @param payload - an object to be stored in the edge
 * @param metadata - an object ot be stored in the edge
 */
exports.default = function (getId) {
	return function (from, to, payload, metadata) {
		var directed = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
		return {
			type: "edge",
			directed: directed,
			payload: payload,
			metadata: metadata,
			from: getId(from),
			to: getId(to)
		};
	};
};