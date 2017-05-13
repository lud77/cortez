"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
var factory = function factory(from) {
	var counter = -1;
	if (from !== undefined) {
		counter = from - 1;
	}

	var getNext = function getNext() {
		return ++counter;
	};
	var getCurrent = function getCurrent() {
		return counter;
	};

	return {
		getNext: getNext,
		getCurrent: getCurrent
	};
};

exports.default = factory;