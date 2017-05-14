import sequenceFactory from "./sequence";

const factory = (getId, nodeFactory, edgeFactory) => (fragment, options = {}) => {
 	let { nodes, edges, nodeCount, edgeCount } = Object.assign({}, {
		nodeCount: 0,
		edgeCount: 0,
		nodes: {},
		edges: {}
	}, (typeof fragment === "string") ? JSON.parse(fragment) : fragment);

 	const nodeSeq = sequenceFactory(nodeCount);
 	const edgeSeq = sequenceFactory(edgeCount);

	const pack = () => {
		const newGraph = empty();
		const mapping = {};

		for (let n in nodes) {
			if (nodes[n]) {
				mapping[n] = newGraph.addNode(Object.assign({}, nodes[n]));
			}
		}

		for (let e in edges) {
			if (edges[e]) {
				const id = newGraph.addAdge(Object.assign({}, edges[e]));
				newGraph.edges[id].from = mapping[newGraph.edges[id].from];
				newGraph.edges[id].to = mapping[newGraph.edges[id].to];
			}
		}

		return newGraph;
	};

	const mergeWith = (otherFragment) => {
		const operand = fragment(otherFragment);
		const newGraph = pack();
		const mapping = {};

		for (let n in operand.nodes) {
			if (operand.nodes[n]) {
				mapping[n] = newGraph.addNode(Object.assign({}, operand.nodes[n]));
			}
		}

		for (let e in operand.edges) {
			if (operand.edges[e]) {
				let id = newGraph.addEdge(Object.assign({}, operand.edges[e]));
				newGraph.edges[id].from = mapping[newGraph.edges[id].from];
				newGraph.edges[id].to = mapping[newGraph.edges[id].to];
			}
		}

		return newGraph;
	};

	const addNode = (node) => {
		const id = nodeSeq.getNext();
		nodes[id] = Object.assign({}, node);

		nodes[id].id = id;
		nodes[id].graph = this;

		if (options.onAddNode) {
			(options.onAddNode)(nodes[id], options.context);
		}

		nodeCount++;
		return nodes[id];
	};

	const addEdge = (edge) => {
		const id = edgeSeq.getNext();
		edges[id] = Object.assign({}, edge);

		edges[id].id = id;
		edges[id].graph = this;

		if (!nodes[edge.from].outbound[edge.to]) {
			nodes[edge.from].outbound[edge.to] = [];
		}

		if (!nodes[edge.to].inbound[edge.from]) {
			nodes[edge.to].inbound[edge.from] = [];
		}

		nodes[edge.from].outbound[edge.to].push(id);
		nodes[edge.to].inbound[edge.from].push(id);
		nodes[edge.from].numOutbound++;
		nodes[edge.to].numInbound++;

		if (options.onAddEdge) {
			(options.onAddEdge)(edges[id], options.context);
		}

		edgeCount++;
		return edges[id];
	};

	const removeNode = (node) => {
		const id = getId(node);

		if (!nodes[id]) return;

		if (options.onRemoveNode) {
			(options.onRemoveNode)(nodes[id], options.context);
		}

		for (let g in nodes[id].inbound) {
			for (let e in nodes[id].inbound[g]) {
				removeEdge(nodes[id].inbound[g][e]);
			}
		}

		for (let g in nodes[id].outbound) {
			for (let e in nodes[id].outbound[g]) {
				removeEdge(nodes[id].outbound[g][e]);
			}
		}

		nodeCount--;
		delete nodes[id];
	};

	const removeEdge = (edge) => {
		const id = getId(edge);
		if (!edges[id]) return;

		if (options.onRemoveEdge) {
			(options.onRemoveEdge)(edges[id], options.context);
		}

		edgeCount--;
		delete edges[id];
	};

	const hasEdge = (from, to) => !!from.outbound[getId(to)];
	const getNodeById = (nodeId) => nodes[nodeId];
	const getEdgeById = (edgeId) => edges[edgeId];
	const getNodes = () => nodes;
	const getEdges = () => edges;

	const link = (from, to, payload) => addEdge(edgeFactory(
		getId(from),
		getId(to),
		payload
	));

 	return {
 		nodes,
 		edges,
 		nodeCount,
 		edgeCount,
		hasEdge,
 		pack,
 		mergeWith,
 		addNode,
 		addEdge,
 		removeNode,
 		removeEdge,
 		getNodeById,
 		getEdgeById,
 		getNodes,
 		getEdges,
 		link
 	};
};

export default { factory };
