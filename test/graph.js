const { assert } = require('chai');

const cortez = require('../src/graph');
const { yieldAll, yieldMatching, yieldUnion, yieldMap } = require('../src/generator-utils');

describe('Graph', function() {
    it('should retrieve the id property of an object', () => {
        const cz = cortez();
        const id = 3;
        const obj = { id };
        assert.equal(id, cz.getId(obj));
	  });

  	it('should create a standalone node with payload and metadata', () => {
        const cz = cortez();
    		const node = cz.node({ x: 1 }, { y: 2 });
    		assert.equal(1, node.payload.x);
    		assert.equal(2, node.metadata.y);
  	});

  	it('should create a standalone edge with payload and metadata', () => {
        const cz = cortez();
    		const node1 = cz.node();
    		const node2 = cz.node();
    		const edge = cz.edge(node1, node2, { x: 1 }, { y: 2 })
    		assert.equal(1, edge.payload.x);
    		assert.equal(2, edge.metadata.y);
  	});

  	it('should create an empty graph', () => {
        const cz = cortez();
    		assert.isObject(cz.nodes);
    		assert.isObject(cz.edges);
  	});

  	it('should add a node to a graph', () => {
    		const cz = cortez();
    		const node = cz.addNode(cz.node());
    		const retrieved = cz.getNode(node.id);
    		assert.equal(node.id, retrieved.id);
  	});

  	it('should add an edge to a graph', () => {
    		const cz = cortez();
    		const node1 = cz.addNode(cz.node());
    		const node2 = cz.addNode(cz.node());
    		const edge = cz.addEdge(cz.edge(node1, node2));
    		const retrieved = cz.getEdge(edge.id);
    		assert.equal(edge.id, retrieved.id);
    		assert.equal(retrieved.from, node1.id);
    		assert.equal(retrieved.to, node2.id);
  	});

  	it('should detect a direct edge between two nodes', () => {
    		const dcz = cortez();
    		const node1 = dcz.addNode(dcz.node());
    		const node2 = dcz.addNode(dcz.node());
    		const edge = dcz.addEdge(dcz.edge(node1, node2));
    		assert.equal(true, dcz.hasAnyEdge(node1, node2));
    		assert.equal(true, dcz.hasDirectedEdge(node1, node2));
  	});

  	it('should not detect a direct edge between two nodes in the wrong direction', () => {
    		const dcz = cortez();
    		const node1 = dcz.addNode(dcz.node());
    		const node2 = dcz.addNode(dcz.node());
    		const edge = dcz.addEdge(dcz.edge(node1, node2));
    		assert.equal(false, dcz.hasAnyEdge(node2, node1));
    		assert.equal(false, dcz.hasDirectedEdge(node2, node1));
  	});

  	it('should detect an undirected edge between two nodes in any direction', () => {
    		const ucz = cortez(undefined, { allowUndirected: true });
    		const node1 = ucz.addNode(ucz.node());
    		const node2 = ucz.addNode(ucz.node());
    		const edge = ucz.addEdge(ucz.edge(node1, node2, {}, {}, false));
    		assert.equal(true, ucz.hasAnyEdge(node1, node2));
    		assert.equal(true, ucz.hasAnyEdge(node2, node1));
    		assert.equal(true, ucz.hasUndirectedEdge(node1, node2));
    		assert.equal(true, ucz.hasUndirectedEdge(node2, node1));
  	});

  	it('should retrieve the specified nodes', () => {
    		const cz = cortez();
    		const node1 = cz.addNode(cz.node({ user: 'x', age: 20, active: true }));
    		const node2 = cz.addNode(cz.node({ user: 'y', age: 20, active: false }));
    		const node3 = cz.addNode(cz.node({ user: 'z', age: 30, active: false }));
    		const nodes = cz.inflateNodes([node1.id, node2.id]);
    		assert.equal(nodes.length, 2);
    		assert.equal(node1.payload.user, nodes[0].payload.user);
    		assert.equal(node2.payload.user, nodes[1].payload.user);
  	});

  	it('should retrieve the specified edges', () => {
    		const cz = cortez();
    		const node1 = cz.addNode(cz.node());
    		const node2 = cz.addNode(cz.node());
    		const edge1 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }));
    		const edge2 = cz.addEdge(cz.edge(node1, node2, { type: 'colleague' }));
    		const edge3 = cz.addEdge(cz.edge(node1, node2, { type: 'acquaintance' }));
    		const edges = cz.inflateEdges([edge1.id, edge2.id]);
    		assert.equal(edges.length, 2);
    		assert.equal(edge1.payload.type, edges[0].payload.type);
    		assert.equal(edge2.payload.type, edges[1].payload.type);
  	});

  	it('should remove a node and its edges from a graph', () => {
    		const cz = cortez();
    		const node1 = cz.addNode(cz.node());
    		const node2 = cz.addNode(cz.node());
    		const edge = cz.addEdge(cz.edge(node1, node2));
    		cz.removeNode(node1.id);
    		const deletedNode = cz.getNode(node1.id);
    		assert.equal(undefined, deletedNode);
    		const deletedEdge = cz.getEdge(edge.id);
    		assert.equal(undefined, deletedEdge);
  	});

  	it('should remove an edge from a graph', () => {
  		  const cz = cortez();
    		const node1 = cz.addNode(cz.node());
    		const node2 = cz.addNode(cz.node());
    		const edge = cz.addEdge(cz.edge(node1, node2));
    		cz.removeEdge(edge.id);
    		const deletedEdge = cz.getEdge(edge.id);
    		assert.equal(undefined, deletedEdge);
  	});

  	it('should return the selected node', () => {
    		const cz = cortez();
    		const node1 = cz.addNode(cz.node({ user: 'x', age: 20, active: true }));
    		const node2 = cz.addNode(cz.node({ user: 'y', age: 20, active: false }));
    		const node3 = cz.addNode(cz.node({ user: 'z', age: 30, active: false }));
    		const retrieved = cz.getNodes({ age: 20, active: true });
    		assert.equal(retrieved.length, 1);
    		assert.equal(node1.id, retrieved[0].id);
  	});

  	it('should return all the nodes as a generator', () => {
    		const cz = cortez();
    		const node1 = cz.addNode(cz.node({ user: 'x', age: 20, active: true }));
    		const node2 = cz.addNode(cz.node({ user: 'y', age: 20, active: false }));
    		const node3 = cz.addNode(cz.node({ user: 'z', age: 30, active: false }));
    		const gen = cz.inflateNodesGen(yieldAll([node1.id, node2.id]));
    		assert.equal(node1.payload.user, gen.next().value.payload.user);
    		assert.equal(node2.payload.user, gen.next().value.payload.user);
    		assert.equal(true, gen.next().done);
  	});

  	it('should retrieve the specified edges as a generator', () => {
    		const cz = cortez();
    		const node1 = cz.addNode(cz.node());
    		const node2 = cz.addNode(cz.node());
    		const edge1 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }));
    		const edge2 = cz.addEdge(cz.edge(node1, node2, { type: 'colleague' }));
    		const edge3 = cz.addEdge(cz.edge(node1, node2, { type: 'acquaintance' }));
    		const gen = cz.inflateEdgesGen(yieldAll([edge1.id, edge2.id]));
    		assert.equal(edge1.payload.type, gen.next().value.payload.type);
    		assert.equal(edge2.payload.type, gen.next().value.payload.type);
    		assert.equal(true, gen.next().done);
  	});

  	it('should return all the nodes in the graph as a generator', () => {
    		const cz = cortez();
    		const node1 = cz.addNode(cz.node({ user: 'x', age: 20, active: true }));
    		const node2 = cz.addNode(cz.node({ user: 'y', age: 20, active: false }));
    		const node3 = cz.addNode(cz.node({ user: 'z', age: 30, active: false }));
    		const gen = cz.getNodesGen();
    		assert.equal(node1.payload.user, gen.next().value.payload.user);
    		assert.equal(node2.payload.user, gen.next().value.payload.user);
    		assert.equal(node3.payload.user, gen.next().value.payload.user);
    		assert.equal(true, gen.next().done);
  	});

    it('should return the selected node as a generator', () => {
      	const cz = cortez();
      	const node1 = cz.addNode(cz.node({ user: 'x', age: 20, active: true }));
      	const node2 = cz.addNode(cz.node({ user: 'y', age: 20, active: false }));
      	const node3 = cz.addNode(cz.node({ user: 'z', age: 30, active: false }));
      	const gen = cz.getNodesGen({ age: 20, active: true });
      	assert.equal(node1.payload.user, gen.next().value.payload.user);
      	assert.equal(true, gen.next().done);
    });
});
