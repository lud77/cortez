import sequenceFactory from "./sequence";

const getId = (element) => typeof(element) === "object" ? element.id : element;

const fragment = (fragment, options = {}) => {
	let { nodes, edges, nodeCount, edgeCount } = (typeof fragment === "string") ? JSON.parse(fragment) : fragment;

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

		nodes[edge.from].outbound[edge.to] = edge;
		nodes[edge.to].inbound[edge.from] = edge;
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

		if (options.onRemoveNode) {
			(options.onRemoveNode)(nodes[id], options.context);
		}

		for (let e in edges) {
			if ((edges[e]) && ((edges[e].from.id == id) || (edges[e].to.id == id))) {
				removeEdge(e);
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

		const fromNode = nodes[edges[id].from.id];
		const toNode = nodes[edges[id].to.id];
		delete fromNode.outbound[edges[id].to.id];
		delete toNode.inbound[edges[id].from.id];
		fromNode.numOutbound--;
		toNode.numInbound--;

		edgeCount--;
		delete edges[id];
	};

	const hasEdge = (from, to) => !!from.outbound[getId(to)];
	const getNodeById = (nodeId) => nodes[nodeId];
	const getEdgeById = (edgeId) => edges[edgeId];
	const inflateEdges = (edges) => edges;
	const inflateNodes = (nodes) => nodes;
	const getNodes = () => nodes;
	const getEdges = () => edges;
	const link = (from, to, payload) => addEdge(edge(
		getId(from),
		getId(to),
		payload
	));

	return {
		nodes,
		edges,
		nodeCount,
		edgeCount,
		pack,
		mergeWith,
		addNode,
		addEdge,
		hasEdge,
		removeNode,
		removeEdge,
		getNodeById,
		getEdgeById,
		inflateNodes,
		inflateEdges,
		getNodes,
		getEdges,
		link
	};
};

const empty = () => fragment({
	nodeCount: 0,
	edgeCount: 0,
	nodes: {},
	edges: {}
});

const node = (payload, metadata) => ({
	type: "node",
	payload,
	metadata,
	numOutbound: 0,
	numInbound: 0,
	outbound: {},
	inbound: {},
	inGraph: () => this.graph !== undefined,
	getOutboundEdges: () => this.outbound,
	getInboundEdges: () => this.inbound
});

const edge = (from, to, payload, metadata) => ({
	type: "edge",
	payload,
	metadata,
	from: getId(from),
	to: getId(to),
	inGraph: () => this.graph !== undefined
});

export default {
	getId,
	fragment,
	empty,
	node,
	edge
};
