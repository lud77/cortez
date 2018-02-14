const { assert } = require('chai');

const cz = require('../src/cortez');
const { yieldAll, yieldMatching, yieldUnion, yieldMap } = require('../src/generator-utils');

describe('Graph', function() {
    it('should retrieve the id property of an object', () => {
        const id = 3;
        const obj = { id };
        assert.equal(id, cz.getId(obj));
	});

	it('should create a standalone node with payload and metadata', () => {
		const node = cz.node({ x: 1 }, { y: 2 });
		assert.equal(1, node.payload.x);
		assert.equal(2, node.metadata.y);
	});

	it('should create a standalone edge with payload and metadata', () => {
		const node1 = cz.node();
		const node2 = cz.node();
		const edge = cz.edge(node1, node2, { x: 1 }, { y: 2 })
		assert.equal(1, edge.payload.x);
		assert.equal(2, edge.metadata.y);
	});

	it('should create an empty graph', () => {
		const graph = cz.graph();
		assert.isObject(graph.nodes);
		assert.isObject(graph.edges);
	});

	it('should add a node to a graph', () => {
		const graph = cz.graph();
		const node = graph.addNode(cz.node());
		const retrieved = graph.getNode(node.id);
		assert.equal(node.id, retrieved.id);
	});

	it('should add an edge to a graph', () => {
		const graph = cz.graph();
		const node1 = graph.addNode(cz.node());
		const node2 = graph.addNode(cz.node());
		const edge = graph.addEdge(cz.edge(node1, node2));
		const retrieved = graph.getEdge(edge.id);
		assert.equal(edge.id, retrieved.id);
		assert.equal(retrieved.from, node1.id);
		assert.equal(retrieved.to, node2.id);
	});

	it('should detect a direct edge between two nodes', () => {
		const dgraph = cz.graph();
		const node1 = dgraph.addNode(cz.node());
		const node2 = dgraph.addNode(cz.node());
		const edge = dgraph.addEdge(cz.edge(node1, node2));
		assert.equal(true, dgraph.hasAnyEdge(node1, node2));
		assert.equal(true, dgraph.hasDirectedEdge(node1, node2));
	});

	it('should not detect a direct edge between two nodes in the wrong direction', () => {
		const dgraph = cz.graph();
		const node1 = dgraph.addNode(cz.node());
		const node2 = dgraph.addNode(cz.node());
		const edge = dgraph.addEdge(cz.edge(node1, node2));
		assert.equal(false, dgraph.hasAnyEdge(node2, node1));
		assert.equal(false, dgraph.hasDirectedEdge(node2, node1));
	});

	it('should detect an undirected edge between two nodes in any direction', () => {
		const ugraph = cz.graph(undefined, { allowUndirected: true });
		const node1 = ugraph.addNode(cz.node());
		const node2 = ugraph.addNode(cz.node());
		const edge = ugraph.addEdge(cz.edge(node1, node2, {}, {}, false));
		assert.equal(true, ugraph.hasAnyEdge(node1, node2));
		assert.equal(true, ugraph.hasAnyEdge(node2, node1));
		assert.equal(true, ugraph.hasUndirectedEdge(node1, node2));
		assert.equal(true, ugraph.hasUndirectedEdge(node2, node1));
	});

	it('should retrieve the specified nodes', () => {
		const graph = cz.graph();
		const node1 = graph.addNode(cz.node({ user: 'x', age: 20, active: true }));
		const node2 = graph.addNode(cz.node({ user: 'y', age: 20, active: false }));
		const node3 = graph.addNode(cz.node({ user: 'z', age: 30, active: false }));
		const nodes = graph.inflateNodes([node1.id, node2.id]);
		assert.equal(nodes.length, 2);
		assert.equal(node1.payload.user, nodes[0].payload.user);
		assert.equal(node2.payload.user, nodes[1].payload.user);
	});

	it('should retrieve the specified edges', () => {
		const graph = cz.graph();
		const node1 = graph.addNode(cz.node());
		const node2 = graph.addNode(cz.node());
		const edge1 = graph.addEdge(cz.edge(node1, node2, { type: 'friend' }));
		const edge2 = graph.addEdge(cz.edge(node1, node2, { type: 'colleague' }));
		const edge3 = graph.addEdge(cz.edge(node1, node2, { type: 'acquaintance' }));
		const edges = graph.inflateEdges([edge1.id, edge2.id]);
		assert.equal(edges.length, 2);
		assert.equal(edge1.payload.type, edges[0].payload.type);
		assert.equal(edge2.payload.type, edges[1].payload.type);
	});

	it('should remove a node and its edges from a graph', () => {
		const graph = cz.graph();
		const node1 = graph.addNode(cz.node());
		const node2 = graph.addNode(cz.node());
		const edge = graph.addEdge(cz.edge(node1, node2));
		graph.removeNode(node1.id);
		const deletedNode = graph.getNode(node1.id);
		assert.equal(undefined, deletedNode);
		const deletedEdge = graph.getEdge(edge.id);
		assert.equal(undefined, deletedEdge);
	});

	it('should remove an edge from a graph', () => {
		const graph = cz.graph();
		const node1 = graph.addNode(cz.node());
		const node2 = graph.addNode(cz.node());
		const edge = graph.addEdge(cz.edge(node1, node2));
		graph.removeEdge(edge.id);
		const deletedEdge = graph.getEdge(edge.id);
		assert.equal(undefined, deletedEdge);
	});

	it('should return the selected node', () => {
		const graph = cz.graph();
		const node1 = graph.addNode(cz.node({ user: 'x', age: 20, active: true }));
		const node2 = graph.addNode(cz.node({ user: 'y', age: 20, active: false }));
		const node3 = graph.addNode(cz.node({ user: 'z', age: 30, active: false }));
		const retrieved = graph.getNodes({ age: 20, active: true });
		assert.equal(retrieved.length, 1);
		assert.equal(node1.id, retrieved[0].id);
	});

	it('should return all the nodes as a generator', () => {
		const graph = cz.graph();
		const node1 = graph.addNode(cz.node({ user: 'x', age: 20, active: true }));
		const node2 = graph.addNode(cz.node({ user: 'y', age: 20, active: false }));
		const node3 = graph.addNode(cz.node({ user: 'z', age: 30, active: false }));
		const gen = graph.inflateNodesGen(yieldAll([node1.id, node2.id]));
		assert.equal(node1.payload.user, gen.next().value.payload.user);
		assert.equal(node2.payload.user, gen.next().value.payload.user);
		assert.equal(true, gen.next().done);
	});

	it('should retrieve the specified edges as a generator', () => {
		const graph = cz.graph();
		const node1 = graph.addNode(cz.node());
		const node2 = graph.addNode(cz.node());
		const edge1 = graph.addEdge(cz.edge(node1, node2, { type: 'friend' }));
		const edge2 = graph.addEdge(cz.edge(node1, node2, { type: 'colleague' }));
		const edge3 = graph.addEdge(cz.edge(node1, node2, { type: 'acquaintance' }));
		const gen = graph.inflateEdgesGen(yieldAll([edge1.id, edge2.id]));
		assert.equal(edge1.payload.type, gen.next().value.payload.type);
		assert.equal(edge2.payload.type, gen.next().value.payload.type);
		assert.equal(true, gen.next().done);
	});

	it('should return all the nodes in the graph as a generator', () => {
		const graph = cz.graph();
		const node1 = graph.addNode(cz.node({ user: 'x', age: 20, active: true }));
		const node2 = graph.addNode(cz.node({ user: 'y', age: 20, active: false }));
		const node3 = graph.addNode(cz.node({ user: 'z', age: 30, active: false }));
		const gen = graph.getNodesGen();
		assert.equal(node1.payload.user, gen.next().value.payload.user);
		assert.equal(node2.payload.user, gen.next().value.payload.user);
		assert.equal(node3.payload.user, gen.next().value.payload.user);
		assert.equal(true, gen.next().done);
	});

	it('should return the selected node as a generator', () => {
		const graph = cz.graph();
		const node1 = graph.addNode(cz.node({ user: 'x', age: 20, active: true }));
		const node2 = graph.addNode(cz.node({ user: 'y', age: 20, active: false }));
		const node3 = graph.addNode(cz.node({ user: 'z', age: 30, active: false }));
		const gen = graph.getNodesGen({ age: 20, active: true });
		assert.equal(node1.payload.user, gen.next().value.payload.user);
		assert.equal(true, gen.next().done);
	});
});
