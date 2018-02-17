const { assert } = require('chai');

const cortez = require('../src/graph');
const { yieldAll, yieldMatching, yieldUnion, yieldMap } = require('../src/generator-utils');

describe('Traversal (any type of edge)', function() {
	it('should return the selected edge from a node', () => {
		const cz = cortez();
		const node1 = cz.addNode(cz.node());
		const node2 = cz.addNode(cz.node());
		const edge1 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }, undefined, false));
		const edge2 = cz.addEdge(cz.edge(node1, node2, { type: 'colleague' }));
		const edge3 = cz.addEdge(cz.edge(node1, node2, { type: 'acquaintance' }));
		const retrieved = cz.getEdgesFrom(node1, { type: 'friend' });
		assert.equal(retrieved.length, 1);
		assert.equal(edge1.id, retrieved[0].id);
	});

	it('should return the selected edge between two nodes', () => {
		const cz = cortez();
		const node1 = cz.addNode(cz.node());
		const node2 = cz.addNode(cz.node());
		const edge1 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }, undefined, false));
		const edge2 = cz.addEdge(cz.edge(node1, node2, { type: 'colleague' }));
		const edge3 = cz.addEdge(cz.edge(node1, node2, { type: 'acquaintance' }));
		const retrieved = cz.getEdgesBetween(node1, node2, { type: 'friend' });
		assert.equal(retrieved.length, 1);
		assert.equal(edge1.id, retrieved[0].id);
	});

	it('should return all edges from a node as a generator', () => {
		const cz = cortez();
		const node1 = cz.addNode(cz.node());
		const node2 = cz.addNode(cz.node());
		const edge1 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }, undefined, false));
		const edge2 = cz.addEdge(cz.edge(node1, node2, { type: 'colleague' }));
		const edge3 = cz.addEdge(cz.edge(node1, node2, { type: 'acquaintance' }));
		const gen = cz.getEdgesFromGen(node1);
		assert.equal(edge1.id, gen.next().value.id);
		assert.equal(edge2.id, gen.next().value.id);
		assert.equal(edge3.id, gen.next().value.id);
		assert.equal(true, gen.next().done);
	});

	it('should return the selected edges from a node as a generator', () => {
		const cz = cortez();
		const node1 = cz.addNode(cz.node());
		const node2 = cz.addNode(cz.node());
		const edge1 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }, undefined, false));
		const edge2 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }));
		const edge3 = cz.addEdge(cz.edge(node1, node2, { type: 'acquaintance' }));
		const gen = cz.getEdgesFromGen(node1, { type: 'friend' });
		assert.equal(edge1.id, gen.next().value.id);
		assert.equal(edge2.id, gen.next().value.id);
		assert.equal(true, gen.next().done);
	});

	it('should return the selected edges between two nodes as a generator', () => {
		const cz = cortez();
		const node1 = cz.addNode(cz.node());
		const node2 = cz.addNode(cz.node());
		const edge1 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }, undefined, false));
		const edge2 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }));
		const edge3 = cz.addEdge(cz.edge(node1, node2, { type: 'acquaintance' }));
		const gen = cz.getEdgesBetweenGen(node1, node2, { type: 'friend' });
		assert.equal(edge1.id, gen.next().value.id);
		assert.equal(edge2.id, gen.next().value.id);
		assert.equal(true, gen.next().done);
	});

	it('should return the selected edges to a node as a generator', () => {
		const cz = cortez();
		const node1 = cz.addNode(cz.node());
		const node2 = cz.addNode(cz.node());
		const edge1 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }, undefined, false));
		const edge2 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }));
		const edge3 = cz.addEdge(cz.edge(node1, node2, { type: 'acquaintance' }));
		const gen = cz.getEdgesToGen(node2, { type: 'friend' });
		assert.equal(edge1.id, gen.next().value.id);
		assert.equal(edge2.id, gen.next().value.id);
		assert.equal(true, gen.next().done);
	});
});
