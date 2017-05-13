import sequenceFactory from 'sequence';

export default () => {

	const getId = (element) => typeof(element) === 'object' ? element.id : element;

	const fragment = (fragment, options = {}) => {
		const { nodes, edges, nodeCount, edgeCount } = (typeof fragment === 'string') ? JSON.parse(fragment) : fragment;

		const nodeSeq = sequenceFactory(nodeCount);
		const edgeSeq = sequenceFactory(edgeCount);

		const pack = () => {
			const newGraph = empty();
			const mapping = {};

			for (let n in this.nodes) {
				if (this.nodes[n]) {
					mapping[n] = newGraph.addNode(Object.assign({}, this.nodes[n]));
				}
			}

			for (let e in this.edges) {
				if (this.edges[e]) {
					const id = newGraph.addAdge(Object.assign({}, this.edges[e]));
					newGraph.edges[id].from = mapping[newGraph.edges[id].from];
					newGraph.edges[id].to = mapping[newGraph.edges[id].to];
				}
			}

			return newGraph;
		};

		const mergeWith = (fragment) => {
			const operand = Graph.fragment(fragment);
			const newGraph = this.pack();
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

			this.nodes[id] = Object.assign({}, node);

			this.nodes[id].id = id;
			this.nodes[id].graph = this;

			if (options.onAddNode) {
				(options.onAddNode)(this.nodes[id], options.context);
			}

			this.nodeCount++;
			return this.nodes[id];
		};

		const addEdge = (edge) => {
			const id = edgeSeq.getNext();
			this.edges[id] = Object.assign({}, edge);

			this.edges[id].id = id;
			this.edges[id].graph = this;

			this.nodes[edge.from].outbound[edge.to] = edge;
			this.nodes[edge.to].inbound[edge.from] = edge;
			this.nodes[edge.from].numOutbound++;
			this.nodes[edge.to].numInbound++;

			if (options.onAddEdge) {
				(options.onAddEdge)(this.edges[id], options.context);
			}

			this.edgeCount++;
			return this.edges[id];
		};

		const removeNode = (node) => {
			const id = getId(node);

			if (options.onRemoveNode) {
				(options.onRemoveNode)(this.nodes[id], options.context);
			}

			for (let e in this.edges) {
				if ((this.edges[e]) && ((this.edges[e].from.id == id) || (this.edges[e].to.id == id))) {
					this.removeEdge(e);
				}
			}

			this.nodeCount--;
			delete this.nodes[id];
		};

		const removeEdge = (edge) => {
			const id = getId(edge);

			if (!this.edges[id]) return;

			if (options.onRemoveEdge) {
				(options.onRemoveEdge)(this.edges[id], options.context);
			}

			const fromRode = this.nodes[this.edges[id].from.id];
			const toNode = this.nodes[this.edges[id].to.id];
			delete fromNode.outbound[this.edges[id].to.id];
			delete toNode.inbound[this.edges[id].from.id];
			fromNode.numOutbound--;
			toNode.numInbound--;

			this.edgeCount--;
			delete this.edges[id];
		};

		const hasEdge = (from, to) => from.outbound[getId(to)] !== undefined;
		const getNodeById = (nodeId) => this.nodes[nodeId];
		const getEdgeById = (edgeId) => this.edges[edgeId];
		const inflateEdges = (edges) => {};
		const inflateNodes = (nodes) => {};
		const getNodes = () => this.nodes;
		const getEdges = () => this.edges;
		const link = (from, to, payload) => this.addEdge(edge(
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
		type: 'node',
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
		type: 'edge',
		payload,
		metadata,
		from: getId(from),
		to: getId(to),
		inGraph: () => this.graph !== undefined
	});

	return {
		getId,
		fragment,
		empty,
		node,
		edge
	};
};
