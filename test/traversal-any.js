import { assert } from 'chai';

import cz from '../dist/cortez';
import { yieldAll, yieldMatching, yieldUnion, yieldMap } from "../dist/generator-utils";

describe('Traversal (any type of edge)', function() {
	it('should return the selected edge from a node', () => {
		const graph = cz.graph();
		const node1 = graph.addNode(cz.node());
		const node2 = graph.addNode(cz.node());
		const edge1 = graph.addEdge(cz.edge(node1, node2, { type: 'friend' }, undefined, false));
		const edge2 = graph.addEdge(cz.edge(node1, node2, { type: 'colleague' }));
		const edge3 = graph.addEdge(cz.edge(node1, node2, { type: 'acquaintance' }));
		const retrieved = graph.getEdgesFrom(node1, { type: 'friend' });
		assert.equal(retrieved.length, 1);
		assert.equal(edge1.id, retrieved[0].id);
	});

	it('should return the selected edge between two nodes', () => {
		const graph = cz.graph();
		const node1 = graph.addNode(cz.node());
		const node2 = graph.addNode(cz.node());
		const edge1 = graph.addEdge(cz.edge(node1, node2, { type: 'friend' }, undefined, false));
		const edge2 = graph.addEdge(cz.edge(node1, node2, { type: 'colleague' }));
		const edge3 = graph.addEdge(cz.edge(node1, node2, { type: 'acquaintance' }));
		const retrieved = graph.getEdgesBetween(node1, node2, { type: 'friend' });
		assert.equal(retrieved.length, 1);
		assert.equal(edge1.id, retrieved[0].id);
	});

	it('should return all edges from a node as a generator', () => {
		const graph = cz.graph();
		const node1 = graph.addNode(cz.node());
		const node2 = graph.addNode(cz.node());
		const edge1 = graph.addEdge(cz.edge(node1, node2, { type: 'friend' }, undefined, false));
		const edge2 = graph.addEdge(cz.edge(node1, node2, { type: 'colleague' }));
		const edge3 = graph.addEdge(cz.edge(node1, node2, { type: 'acquaintance' }));
		const gen = graph.getEdgesFromGen(node1);
		assert.equal(edge1.id, gen.next().value.id);
		assert.equal(edge2.id, gen.next().value.id);
		assert.equal(edge3.id, gen.next().value.id);
		assert.equal(true, gen.next().done);
	});

	it('should return the selected edges from a node as a generator', () => {
		const graph = cz.graph();
		const node1 = graph.addNode(cz.node());
		const node2 = graph.addNode(cz.node());
		const edge1 = graph.addEdge(cz.edge(node1, node2, { type: 'friend' }, undefined, false));
		const edge2 = graph.addEdge(cz.edge(node1, node2, { type: 'friend' }));
		const edge3 = graph.addEdge(cz.edge(node1, node2, { type: 'acquaintance' }));
		const gen = graph.getEdgesFromGen(node1, { type: 'friend' });
		assert.equal(edge1.id, gen.next().value.id);
		assert.equal(edge2.id, gen.next().value.id);
		assert.equal(true, gen.next().done);
	});

	it('should return the selected edges between two nodes as a generator', () => {
		const graph = cz.graph();
		const node1 = graph.addNode(cz.node());
		const node2 = graph.addNode(cz.node());
		const edge1 = graph.addEdge(cz.edge(node1, node2, { type: 'friend' }, undefined, false));
		const edge2 = graph.addEdge(cz.edge(node1, node2, { type: 'friend' }));
		const edge3 = graph.addEdge(cz.edge(node1, node2, { type: 'acquaintance' }));
		const gen = graph.getEdgesBetweenGen(node1, node2, { type: 'friend' });
		assert.equal(edge1.id, gen.next().value.id);
		assert.equal(edge2.id, gen.next().value.id);
		assert.equal(true, gen.next().done);
	});

	it('should return the selected edges to a node as a generator', () => {
		const graph = cz.graph();
		const node1 = graph.addNode(cz.node());
		const node2 = graph.addNode(cz.node());
		const edge1 = graph.addEdge(cz.edge(node1, node2, { type: 'friend' }, undefined, false));
		const edge2 = graph.addEdge(cz.edge(node1, node2, { type: 'friend' }));
		const edge3 = graph.addEdge(cz.edge(node1, node2, { type: 'acquaintance' }));
		const gen = graph.getEdgesToGen(node2, { type: 'friend' });
		assert.equal(edge1.id, gen.next().value.id);
		assert.equal(edge2.id, gen.next().value.id);
		assert.equal(true, gen.next().done);
	});
});
