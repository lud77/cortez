"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function () {

	var factory = function factory(from) {
		var counter = -1;
		if (from !== undefined) {
			counter = from - 1;
		}

		var get_next = function get_next() {
			return ++counter;
		};
		var get_current = function get_current() {
			return counter;
		};

		return {
			get_next: get_next,
			get_current: get_current
		};
	};

	return { factory: factory };
};