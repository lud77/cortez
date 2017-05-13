import { assert } from 'chai';

import graphFactory from '../dist/graph';

describe('Graph', function() {
    it('should retrieve the id property of an object', function() {
        const id = 3;
        const obj = { id };
        assert.equal(id, graphFactory.getId(obj));
	});

	it('should create a standalone node with payload and metadata', function() {
		const node = graphFactory.node({ x: 1 }, { y: 2 });
		assert.equal(1, node.payload.x);
		assert.equal(2, node.metadata.y);
	});

	it('should create a standalone edge with payload and metadata', function() {
		const node1 = graphFactory.node();
		const node2 = graphFactory.node();
		const edge = graphFactory.edge(node1, node2, { x: 1 }, { y: 2 })
		assert.equal(1, edge.payload.x);
		assert.equal(2, edge.metadata.y);
	});

	it('should create an empty graph', function() {
		const graph = graphFactory.empty();
		assert.isObject(graph.nodes);
		assert.isObject(graph.edges);
	});

	it('should add a node to a graph', function() {
		const graph = graphFactory.empty();
		const node = graph.addNode(graphFactory.node());
		const retrieved = graph.getNodeById(node.id);
		assert.equal(node.id, retrieved.id);
	});

	it('should add an edge to a graph', function() {
		const graph = graphFactory.empty();
		const node1 = graph.addNode(graphFactory.node());
		const node2 = graph.addNode(graphFactory.node());
		const edge = graph.addEdge(graphFactory.edge());
		const retrieved = graph.getEdgeById(edge.id);
		assert.equal(edge.id, retrieved.id);
	});
});
