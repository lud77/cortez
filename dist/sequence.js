"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
/**
 * Returns a sequence object
 * @namespace sequence
 * @param from - the starting value for the sequence
 */
var factory = function factory(from) {
	var counter = -1;
	if (from !== undefined) {
		counter = from - 1;
	}

	/**
  * Return the next number in the sequnece
  * @function getNext
  * @memberof sequence
  */
	var getNext = function getNext() {
		return ++counter;
	};

	/**
  * Return the current number in the sequnece without increasing the counter
  * @function getCurrent
  * @memberof sequence
  */
	var getCurrent = function getCurrent() {
		return counter;
	};

	return {
		getNext: getNext,
		getCurrent: getCurrent
	};
};

exports.default = factory;