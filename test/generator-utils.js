const { assert } = require('chai');

const { yieldAll, yieldMatching, yieldUnion, yieldMap, drainAndCount } = require('../src/generator-utils');

describe('Generator Utils', () => {
    it('should yield all the elements of an array', () => {
    		const gen = yieldAll([1, 2, 3]);
    		const numItems = drainAndCount(gen);
    		assert.equal(3, numItems);
  	});

    it('should yield all the elements of all generators', () => {
    		const g1 = yieldAll([1, 2, 3]);
    		const g2 = yieldAll([1, 2, 3, 4]);
    		const gen = yieldUnion([g1, g2]);
    		const numItems = drainAndCount(gen);
    		assert.equal(7, numItems);
  	});

    it('should yield elements of a generator matching a rule', () => {
    		const g1 = yieldAll([1, 2, 3, 4, 5, 6, 7]);
    		const gen = yieldMatching(g1, (item) => item < 4);
    		const numItems = drainAndCount(gen);
    		assert.equal(3, numItems);
  	});

    it('should yield elements of a generator trasformed', () => {
    		const g1 = yieldAll([1, 2]);
    		const gen = yieldMap(g1, (item) => item * 4);
    		assert.equal(4, gen.next().value);
    		assert.equal(8, gen.next().value);
  	});
});
