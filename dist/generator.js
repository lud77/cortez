"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
var yieldAll = regeneratorRuntime.mark(function yieldAll(items) {
	var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, item, i;

	return regeneratorRuntime.wrap(function yieldAll$(_context) {
		while (1) {
			switch (_context.prev = _context.next) {
				case 0:
					if (!(items.length !== undefined)) {
						_context.next = 29;
						break;
					}

					_iteratorNormalCompletion = true;
					_didIteratorError = false;
					_iteratorError = undefined;
					_context.prev = 4;
					_iterator = items[Symbol.iterator]();

				case 6:
					if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
						_context.next = 13;
						break;
					}

					item = _step.value;
					_context.next = 10;
					return item;

				case 10:
					_iteratorNormalCompletion = true;
					_context.next = 6;
					break;

				case 13:
					_context.next = 19;
					break;

				case 15:
					_context.prev = 15;
					_context.t0 = _context["catch"](4);
					_didIteratorError = true;
					_iteratorError = _context.t0;

				case 19:
					_context.prev = 19;
					_context.prev = 20;

					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}

				case 22:
					_context.prev = 22;

					if (!_didIteratorError) {
						_context.next = 25;
						break;
					}

					throw _iteratorError;

				case 25:
					return _context.finish(22);

				case 26:
					return _context.finish(19);

				case 27:
					_context.next = 36;
					break;

				case 29:
					_context.t1 = regeneratorRuntime.keys(items);

				case 30:
					if ((_context.t2 = _context.t1()).done) {
						_context.next = 36;
						break;
					}

					i = _context.t2.value;
					_context.next = 34;
					return items[i];

				case 34:
					_context.next = 30;
					break;

				case 36:
				case "end":
					return _context.stop();
			}
		}
	}, yieldAll, this, [[4, 15, 19, 27], [20,, 22, 26]]);
});

var yieldMatching = regeneratorRuntime.mark(function yieldMatching(generator, isMatch) {
	var item;
	return regeneratorRuntime.wrap(function yieldMatching$(_context2) {
		while (1) {
			switch (_context2.prev = _context2.next) {
				case 0:
					if (!true) {
						_context2.next = 9;
						break;
					}

					item = generator.next();

					if (!item.done) {
						_context2.next = 4;
						break;
					}

					return _context2.abrupt("break", 9);

				case 4:
					if (!isMatch(item.value)) {
						_context2.next = 7;
						break;
					}

					_context2.next = 7;
					return item.value;

				case 7:
					_context2.next = 0;
					break;

				case 9:
				case "end":
					return _context2.stop();
			}
		}
	}, yieldMatching, this);
});

var yieldUnion = regeneratorRuntime.mark(function yieldUnion(generators) {
	var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, generator;

	return regeneratorRuntime.wrap(function yieldUnion$(_context3) {
		while (1) {
			switch (_context3.prev = _context3.next) {
				case 0:
					_iteratorNormalCompletion2 = true;
					_didIteratorError2 = false;
					_iteratorError2 = undefined;
					_context3.prev = 3;
					_iterator2 = generators[Symbol.iterator]();

				case 5:
					if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
						_context3.next = 11;
						break;
					}

					generator = _step2.value;
					return _context3.delegateYield(generator, "t0", 8);

				case 8:
					_iteratorNormalCompletion2 = true;
					_context3.next = 5;
					break;

				case 11:
					_context3.next = 17;
					break;

				case 13:
					_context3.prev = 13;
					_context3.t1 = _context3["catch"](3);
					_didIteratorError2 = true;
					_iteratorError2 = _context3.t1;

				case 17:
					_context3.prev = 17;
					_context3.prev = 18;

					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}

				case 20:
					_context3.prev = 20;

					if (!_didIteratorError2) {
						_context3.next = 23;
						break;
					}

					throw _iteratorError2;

				case 23:
					return _context3.finish(20);

				case 24:
					return _context3.finish(17);

				case 25:
				case "end":
					return _context3.stop();
			}
		}
	}, yieldUnion, this, [[3, 13, 17, 25], [18,, 20, 24]]);
});

var yieldMap = regeneratorRuntime.mark(function yieldMap(generator, map) {
	var item;
	return regeneratorRuntime.wrap(function yieldMap$(_context4) {
		while (1) {
			switch (_context4.prev = _context4.next) {
				case 0:
					if (!true) {
						_context4.next = 8;
						break;
					}

					item = generator.next();

					if (!item.done) {
						_context4.next = 4;
						break;
					}

					return _context4.abrupt("break", 8);

				case 4:
					_context4.next = 6;
					return map(item.value);

				case 6:
					_context4.next = 0;
					break;

				case 8:
				case "end":
					return _context4.stop();
			}
		}
	}, yieldMap, this);
});

exports.yieldAll = yieldAll;
exports.yieldMatching = yieldMatching;
exports.yieldUnion = yieldUnion;
exports.yieldMap = yieldMap;