const { assert } = require('chai');

const sequenceFactory = require('../src/sequence');

describe('Sequence', function() {
		it('should produce a ramp of numbers starting from 0', function() {
				const seq = sequenceFactory();
				assert.equal(0, seq.getNext());
				assert.equal(1, seq.getNext());
				assert.equal(2, seq.getNext());
				assert.equal(3, seq.getNext());
		});

		it('should produce a ramp of numbers starting from 2', function() {
				const seq = sequenceFactory(2);
				assert.equal(2, seq.getNext());
				assert.equal(3, seq.getNext());
				assert.equal(4, seq.getNext());
				assert.equal(5, seq.getNext());
		});

		it('should produce the current number', function() {
				const seq = sequenceFactory();
				seq.getNext();
				seq.getNext();
				assert.equal(1, seq.getCurrent());
				assert.equal(1, seq.getCurrent());
		});
});
