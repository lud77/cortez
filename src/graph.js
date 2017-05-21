import _ from "lodash";

import sequenceFactory from "./sequence";

/**
 * options:
 * - allowUndirected
 * - onAddNode
 * - onAddEdge
 * - onRemoveNode
 * - onRemoveEdge
 */

export default (getId, nodeFactory, edgeFactory) => (fragment, options = {}) => {
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

	const getNode = (node) => nodes[getId(node)];
	const hasDirectedEdge = (from, to) => !!getNode(from).outbound[getId(to)];

	// todo: maintain a flag for each entry in inbound/outbound to avoid the O(n) test and make this O(1)
	const hasUndirectedEdge = (from, to) => {
		const candidates = getNode(from).outbound[getId(to)];
		return _.find(candidates, { directed: false });
	};

	const hasEdge = (from, to) => {
		if (hasDirectedEdge(from, to)) return true;
		if (!options.allowUndirected) return false;
		return hasUndirectedEdge(to, from);
	};

	const getNodeById = (nodeId) => nodes[nodeId];
	const getEdgeById = (edgeId) => edges[edgeId];
	const inflateNodes = (nodeIds) => _.map(nodeIds, (id) => nodes[id]);
	const inflateEdges = (edgeIds) => _.map(edgeIds, (id) => edges[id]);
	const link = (from, to, payload, metadata, directed) => addEdge(edgeFactory(getId(from), getId(to), payload, metadata, directed));
	const getNodes = (query) => query ? _.chain(nodes).filter((entry) => _.matches(query)(entry.payload)).value() : nodes;
	const squashEdges = (groups) => _.flatten(_.values(groups));

	const getEdges = (pool, query) => {
		const edgeMap = _.chain(pool).map((id) => edges[id]);
		const queriedEdges = query ? edgeMap.filter((entry) => _.matches(query)(entry.payload)) : edgeMap;
		return queriedEdges.value();
	};

	const getEdgesFrom = (node, query) => getEdges(squashEdges(node.outbound), query);
	const getEdgesTo = (node, query) => getEdges(squashEdges(node.inbound), query);
	const getEdgesBetween = (from, to, query) => getEdges(getNode(from).outbound[getId(to)], query)
	const getLinkedNodes = (node, query) => _.map(getEdgesFrom(node, query), (edge) => nodes[edge.to]);
	const getLinkingNodes = (node, query) => _.map(getEdgesTo(node, query), (edge) => nodes[edge.from]);

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
		inflateNodes,
		inflateEdges,
 		link,
		getNodes,
		getEdgesFrom,
		getEdgesTo,
		getEdgesBetween,
		getLinkedNodes,
		getLinkingNodes
 	};
};
