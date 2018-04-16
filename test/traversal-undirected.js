const { assert } = require('chai');

const cortez = require('../src/graph');
const { yieldAll, yieldMatching, yieldUnion, yieldMap, drainAndLog } = require('../src/generator-utils');

describe('Traversal (undirected edges)', () => {
		it('should return the selected edge from a node', () => {
				const cz = cortez();
				const node1 = cz.addNode(cz.node());
				const node2 = cz.addNode(cz.node());
				const edge1 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }, undefined, false));
				const edge2 = cz.addEdge(cz.edge(node1, node2, { type: 'colleague' }, undefined, false));
				const edge3 = cz.addEdge(cz.edge(node1, node2, { type: 'acquaintance' }, undefined, false));
				const retrieved = cz.getUndirectedEdgesFor(node1, { type: 'friend' });
				assert.equal(retrieved.length, 1);
				assert.equal(edge1.id, retrieved[0].id);
		});

		it('should return the selected edge between two nodes', () => {
				const cz = cortez();
				const node1 = cz.addNode(cz.node());
				const node2 = cz.addNode(cz.node());
				const edge1 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }, undefined, false));
				const edge2 = cz.addEdge(cz.edge(node1, node2, { type: 'colleague' }, undefined, false));
				const edge3 = cz.addEdge(cz.edge(node1, node2, { type: 'acquaintance' }, undefined, false));
				const retrieved = cz.getUndirectedEdgesBetween(node1, node2, { type: 'friend' });
				assert.equal(retrieved.length, 1);
				assert.equal(edge1.id, retrieved[0].id);
		});

		it('should return the connected nodes', () => {
				const cz = cortez();
				const node1 = cz.addNode(cz.node({ user: 'x', age: 20, active: true }));
				const node2 = cz.addNode(cz.node({ user: 'y', age: 20, active: false }));
				const node3 = cz.addNode(cz.node({ user: 'z', age: 30, active: false }));
				const edge1 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }, undefined, false));
				const edge2 = cz.addEdge(cz.edge(node1, node2, { type: 'colleague' }, undefined, false));
				const edge3 = cz.addEdge(cz.edge(node1, node3, { type: 'friend' }, undefined, false));
				const nodes = cz.getConnectedNodes(node1, { type: 'friend' });
				assert.equal(nodes.length, 2);
				assert.equal(nodes[0].payload.user, 'y');
				assert.equal(nodes[1].payload.user, 'z');
		});

		it('should return the selected edges between two nodes as a generator', () => {
				const cz = cortez();
				const node1 = cz.addNode(cz.node());
				const node2 = cz.addNode(cz.node());
				const edge1 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }, undefined, false));
				const edge2 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }, undefined, false));
				const edge3 = cz.addEdge(cz.edge(node1, node2, { type: 'acquaintance' }, undefined, false));
				const gen = cz.getUndirectedEdgesBetweenGen(node1, node2, { type: 'friend' });
				assert.equal(edge1.id, gen.next().value.id);
				assert.equal(edge2.id, gen.next().value.id);
				assert.equal(true, gen.next().done);
		});

		it('should return the selected edges from/to a node as a generator', () => {
				const cz = cortez();
				const node1 = cz.addNode(cz.node());
				const node2 = cz.addNode(cz.node());
				const edge1 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }, undefined, false));
				const edge2 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }, undefined, false));
				const edge3 = cz.addEdge(cz.edge(node1, node2, { type: 'acquaintance' }, undefined, false));
				const gen = cz.getUndirectedEdgesForGen(node2, { type: 'friend' });
				assert.equal(edge1.id, gen.next().value.id);
				assert.equal(edge2.id, gen.next().value.id);
				assert.equal(true, gen.next().done);
		});

		it('should return the nodes connected to this node with undirected edges, as a generator', () => {
				const cz = cortez();
				const node1 = cz.addNode(cz.node({ user: 'x', age: 20, active: true }));
				const node2 = cz.addNode(cz.node({ user: 'y', age: 20, active: false }));
				const node3 = cz.addNode(cz.node({ user: 'z', age: 30, active: false }));
				const edge1 = cz.addEdge(cz.edge(node1, node2, { type: 'friend' }, undefined, false));
				const edge2 = cz.addEdge(cz.edge(node1, node2, { type: 'colleague' }, undefined, false));
				const edge3 = cz.addEdge(cz.edge(node1, node3, { type: 'friend' }, undefined, false));
				const gen = cz.getConnectedNodesGen(node1, { type: 'friend' });
				assert.equal(gen.next().value.payload.user, 'y');
				assert.equal(gen.next().value.payload.user, 'z');
				assert.equal(true, gen.next().done);
		});
});
