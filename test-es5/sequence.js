'use strict';

var _chai = require('chai');

var _sequence = require('../dist/sequence');

var _sequence2 = _interopRequireDefault(_sequence);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Sequence', function () {
	it('should produce a ramp of numbers starting from 0', function () {
		var seq = (0, _sequence2.default)();
		_chai.assert.equal(0, seq.getNext());
		_chai.assert.equal(1, seq.getNext());
		_chai.assert.equal(2, seq.getNext());
		_chai.assert.equal(3, seq.getNext());
	});

	it('should produce a ramp of numbers starting from 2', function () {
		var seq = (0, _sequence2.default)(2);
		_chai.assert.equal(2, seq.getNext());
		_chai.assert.equal(3, seq.getNext());
		_chai.assert.equal(4, seq.getNext());
		_chai.assert.equal(5, seq.getNext());
	});

	it('should produce the current number', function () {
		var seq = (0, _sequence2.default)();
		seq.getNext();
		seq.getNext();
		_chai.assert.equal(1, seq.getCurrent());
		_chai.assert.equal(1, seq.getCurrent());
	});
});