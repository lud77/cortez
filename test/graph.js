import { assert } from 'chai';

import cortez from '../dist/cortez';

describe('Graph', function() {
    it('should retrieve the id property of an object', function() {
        const id = 3;
        const obj = { id };
        assert.equal(id, cortez.getId(obj));
	});

	it('should create a standalone node with payload and metadata', function() {
		const node = cortez.node({ x: 1 }, { y: 2 });
		assert.equal(1, node.payload.x);
		assert.equal(2, node.metadata.y);
	});

	it('should create a standalone edge with payload and metadata', function() {
		const node1 = cortez.node();
		const node2 = cortez.node();
		const edge = cortez.edge(node1, node2, { x: 1 }, { y: 2 })
		assert.equal(1, edge.payload.x);
		assert.equal(2, edge.metadata.y);
	});

	it('should create an empty graph', function() {
		const graph = cortez.graph();
		assert.isObject(graph.nodes);
		assert.isObject(graph.edges);
	});

	it('should add a node to a graph', function() {
		const graph = cortez.graph();
		const node = graph.addNode(cortez.node());
		const retrieved = graph.getNodeById(node.id);
		assert.equal(node.id, retrieved.id);
	});

	it('should add an edge to a graph', function() {
		const graph = cortez.graph();
		const node1 = graph.addNode(cortez.node());
		const node2 = graph.addNode(cortez.node());
		const edge = graph.addEdge(cortez.edge(node1, node2));
		const retrieved = graph.getEdgeById(edge.id);
		assert.equal(edge.id, retrieved.id);
		assert.equal(retrieved.from, node1.id);
		assert.equal(retrieved.to, node2.id);
	});

	it('should remove a node and its edges from a graph', function() {
		const graph = cortez.graph();
		const node1 = graph.addNode(cortez.node());
		const node2 = graph.addNode(cortez.node());
		const edge = graph.addEdge(cortez.edge(node1, node2));
		graph.removeNode(node1.id);
		const deletedNode = graph.getNodeById(node1.id);
		assert.equal(undefined, deletedNode);
		const deletedEdge = graph.getEdgeById(edge.id);
		assert.equal(undefined, deletedEdge);
	});

	it('should remove an edge from a graph', function() {
		const graph = cortez.graph();
		const node1 = graph.addNode(cortez.node());
		const node2 = graph.addNode(cortez.node());
		const edge = graph.addEdge(cortez.edge(node1, node2));
		graph.removeEdge(edge.id);
		const deletedEdge = graph.getEdgeById(edge.id);
		assert.equal(undefined, deletedEdge);
	});
});
