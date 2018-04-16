const { assert } = require('chai');

const cortez = require('../src/graph');
const { yieldAll, yieldMatching, yieldUnion, yieldMap } = require('../src/generator-utils');

describe('Traversal (directed edges)', function() {
		it('should return the selected edge from a node', () => {
				const cz = cortez();
				const node1 = cz.addNode(cz.node());
				const node2 = cz.addNode(cz.node());
				const edge1 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }));
				const edge2 = cz.addEdge(cz.edge(node1, node2, { type: 'colleague' }));
				const edge3 = cz.addEdge(cz.edge(node1, node2, { type: 'acquaintance' }));
				const retrieved = cz.getDirectedEdgesFrom(node1, { type: 'friend' });
				assert.equal(retrieved.length, 1);
				assert.equal(edge1.id, retrieved[0].id);
		});

		it('should return the selected edge between two nodes', () => {
				const cz = cortez();
				const node1 = cz.addNode(cz.node());
				const node2 = cz.addNode(cz.node());
				const edge1 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }));
				const edge2 = cz.addEdge(cz.edge(node1, node2, { type: 'colleague' }));
				const edge3 = cz.addEdge(cz.edge(node1, node2, { type: 'acquaintance' }));
				const retrieved = cz.getDirectedEdgesBetween(node1, node2, { type: 'friend' });
				assert.equal(retrieved.length, 1);
				assert.equal(edge1.id, retrieved[0].id);
		});

		it('should return the linked nodes', () => {
				const cz = cortez();
				const node1 = cz.addNode(cz.node({ user: 'x', age: 20, active: true }));
				const node2 = cz.addNode(cz.node({ user: 'y', age: 20, active: false }));
				const node3 = cz.addNode(cz.node({ user: 'z', age: 30, active: false }));
				const edge1 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }));
				const edge2 = cz.addEdge(cz.edge(node1, node2, { type: 'colleague' }));
				const edge3 = cz.addEdge(cz.edge(node1, node3, { type: 'friend' }));
				const nodes = cz.getLinkedNodes(node1, { type: 'friend' });
				assert.equal(nodes.length, 2);
				assert.equal(nodes[0].payload.user, 'y');
				assert.equal(nodes[1].payload.user, 'z');
		});

		it('should return the linking nodes', () => {
				const cz = cortez();
				const node1 = cz.addNode(cz.node({ user: 'x', age: 20, active: true }));
				const node2 = cz.addNode(cz.node({ user: 'y', age: 20, active: false }));
				const node3 = cz.addNode(cz.node({ user: 'z', age: 30, active: false }));
				const edge1 = cz.addEdge(cz.edge(node2, node1, { type: 'friend' }));
				const edge2 = cz.addEdge(cz.edge(node2, node1, { type: 'colleague' }));
				const edge3 = cz.addEdge(cz.edge(node3, node1, { type: 'friend' }));
				const nodes = cz.getLinkingNodes(node1, { type: 'friend' });
				assert.equal(nodes.length, 2);
				assert.equal(nodes[0].payload.user, 'y');
				assert.equal(nodes[1].payload.user, 'z');
		});

		it('should return all edges from a node as a generator', () => {
				const cz = cortez();
				const node1 = cz.addNode(cz.node());
				const node2 = cz.addNode(cz.node());
				const edge1 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }));
				const edge2 = cz.addEdge(cz.edge(node1, node2, { type: 'colleague' }));
				const edge3 = cz.addEdge(cz.edge(node1, node2, { type: 'acquaintance' }));
				const gen = cz.getDirectedEdgesFromGen(node1);
				assert.equal(edge1.id, gen.next().value.id);
				assert.equal(edge2.id, gen.next().value.id);
				assert.equal(edge3.id, gen.next().value.id);
				assert.equal(true, gen.next().done);
		});

		it('should return the selected edges from a node as a generator', () => {
				const cz = cortez();
				const node1 = cz.addNode(cz.node());
				const node2 = cz.addNode(cz.node());
				const edge1 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }));
				const edge2 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }));
				const edge3 = cz.addEdge(cz.edge(node1, node2, { type: 'acquaintance' }));
				const gen = cz.getDirectedEdgesFromGen(node1, { type: 'friend' });
				assert.equal(edge1.id, gen.next().value.id);
				assert.equal(edge2.id, gen.next().value.id);
				assert.equal(true, gen.next().done);
		});

		it('should return the selected edges between two nodes as a generator', () => {
				const cz = cortez();
				const node1 = cz.addNode(cz.node());
				const node2 = cz.addNode(cz.node());
				const edge1 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }));
				const edge2 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }));
				const edge3 = cz.addEdge(cz.edge(node1, node2, { type: 'acquaintance' }));
				const gen = cz.getDirectedEdgesBetweenGen(node1, node2, { type: 'friend' });
				assert.equal(edge1.id, gen.next().value.id);
				assert.equal(edge2.id, gen.next().value.id);
				assert.equal(true, gen.next().done);
		});

		it('should return the selected edges to a node as a generator', () => {
				const cz = cortez();
				const node1 = cz.addNode(cz.node());
				const node2 = cz.addNode(cz.node());
				const edge1 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }));
				const edge2 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }));
				const edge3 = cz.addEdge(cz.edge(node1, node2, { type: 'acquaintance' }));
				const gen = cz.getDirectedEdgesToGen(node2, { type: 'friend' });
				assert.equal(edge1.id, gen.next().value.id);
				assert.equal(edge2.id, gen.next().value.id);
				assert.equal(true, gen.next().done);
		});

		it('should return the linked nodes as a generator', () => {
				const cz = cortez();
				const node1 = cz.addNode(cz.node({ user: 'x', age: 20, active: true }));
				const node2 = cz.addNode(cz.node({ user: 'y', age: 20, active: false }));
				const node3 = cz.addNode(cz.node({ user: 'z', age: 30, active: false }));
				const edge1 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }));
				const edge2 = cz.addEdge(cz.edge(node1, node2, { type: 'colleague' }));
				const edge3 = cz.addEdge(cz.edge(node1, node3, { type: 'friend' }));
				const gen = cz.getLinkedNodesGen(node1, { type: 'friend' });
				assert.equal(gen.next().value.payload.user, 'y');
				assert.equal(gen.next().value.payload.user, 'z');
				assert.equal(true, gen.next().done);
		});

		it('should return the linking nodes as a generator', () => {
				const cz = cortez();
				const node1 = cz.addNode(cz.node({ user: 'x', age: 20, active: true }));
				const node2 = cz.addNode(cz.node({ user: 'y', age: 20, active: false }));
				const node3 = cz.addNode(cz.node({ user: 'z', age: 30, active: false }));
				const edge1 = cz.addEdge(cz.edge(node2, node1, { type: 'friend' }));
				const edge2 = cz.addEdge(cz.edge(node2, node1, { type: 'colleague' }));
				const edge3 = cz.addEdge(cz.edge(node3, node1, { type: 'friend' }));
				const gen = cz.getLinkingNodesGen(node1, { type: 'friend' });
				assert.equal(gen.next().value.payload.user, 'y');
				assert.equal(gen.next().value.payload.user, 'z');
				assert.equal(true, gen.next().done);
		});
});
