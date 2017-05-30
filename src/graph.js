import map from "lodash/map";
import find from "lodash/find";
import matches from "lodash/matches";
import flatten from "lodash/flatten";
import values from "lodash/values";
import filter from "lodash/filter";

import sequenceFactory from "./sequence";
import { yieldAll, yieldMatching, yieldUnion, yieldMap } from "./generator";

/**
 * Create a graph
 * @namespace graph
 * @param fragment - a Cortez object or a JSON-serialized Cortez instance
 * @param options - allowUndirected, onAddNode, onAddEdge, onRemoveNode, onRemoveEdge
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

	/**
	 * Add a node to the graph
	 * @function addNode
	 * @memberof graph
	 * @param node - a node object generated with cortez.node()
	 * @fires options.onAddNode
	 */
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

	/**
	 * Add an edge to the graph
	 * @function addEdge
	 * @memberof graph
	 * @param edge - an edge generated with cortez.edge()
	 * @fires options.onAddEdge
	 */
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

	/**
	 * Remove a node from a graph
	 * @function removeNode
	 * @memberof graph
	 * @param node - a node object or the id of a node
	 * @fires options.onRemoveNode
	 */
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

	/**
	 * Remove an edge from a graph
	 * @function removeEdge
	 * @memberof graph
	 * @param edge - an edge object or the id of an edge
	 * @fires options.onRemoveEdge
	 */
	const removeEdge = (edge) => {
		const id = getId(edge);
		if (!edges[id]) return;

		if (options.onRemoveEdge) {
			(options.onRemoveEdge)(edges[id], options.context);
		}

		edgeCount--;
		delete edges[id];
	};

	/**
	 * Retrieve a node given a node object or its id
	 * @function getNode
	 * @memberof graph
	 * @param node - a node object or the id of a node
	 */
	const getNode = (node) => nodes[getId(node)];

	/**
	 * Retrieve an edge given an edge object or its id
	 * @function getEdge
	 * @memberof graph
	 * @param node - an edge object or the id of an edge
	 */
	const getEdge = (edge) => edges[getId(edge)];

	/**
	 * Checks if a couple of nodes has a directed edge connecting them
	 * @function hasDirectEdge
	 * @memberof graph
	 * @param from - a node
	 * @param to - a node
	 */
	const hasDirectEdge = (from, to) => !!getNode(from).outbound[getId(to)];

	/**
	 * Checks if a couple of nodes has an undirected edge connecting them
	 * @function hasUndirectedEdge
	 * @memberof graph
	 * @param from - a node
	 * @param to - a node
	 */
	// todo: maintain a flag for each entry in inbound/outbound to avoid the O(n) test and make this O(1)
	const hasUndirectedEdge = (from, to) => find(getNode(from).outbound[getId(to)], { directed: false });

	/**
	 * Checks if a couple of nodes has at least one edge connecting them
	 * @function hasAnyEdge
	 * @memberof graph
	 * @param from - a node
	 * @param to - a node
	 */
	const hasAnyEdge = (from, to) => {
		if (hasDirectedEdge(from, to)) return true;
		return hasDirectedEdge(to, from);
	};

	/**
	 * Retrieves a list of nodes
	 * @function inflateNodes
	 * @memberof graph
	 * @param nodeIds - an array of ids of nodes to be retrieved
	 */
	const inflateNodes = (nodeIds) => map(nodeIds, (id) => nodes[id]);

	/**
	 * Retrieves a list of nodes as a generator
	 * @function inflateNodesGen
	 * @memberof graph
	 * @param nodeIdsGen - a generator producing the ids of nodes to be retrieved
	 */
	const inflateNodesGen = function*(nodeIdsGen) {
		yield* yieldMap(nodeIdsGen, (id) => nodes[id]);
	};

	/**
	 * Retrieves a list of edges
	 * @function inflateEdges
	 * @memberof graph
	 * @param edgeIds - an array of ids of edges to be retrieved
	 */
	const inflateEdges = (edgeIds) => map(edgeIds, (id) => edges[id]);

	/**
	 * Retrieves a list of edges as a generator
	 * @function inflateEdgesGen
	 * @memberof graph
	 * @param edgeIdsGen - a generator producing the ids of edges to be retrieved
	 */
	const inflateEdgesGen = function*(edgeIdsGen) {
		yield* yieldMap(edgeIdsGen, (id) => edges[id]);
	};

	/**
	 * Shortcut method to create an edge between two nodes
	 * @function link
	 * @memberof graph
	 * @param from - a node
	 * @param to - a node
	 * @param payload - an object to be stored in the node
	 * @param metadata - an additional object to be stored in the node
	 * @param directed - whether the edge must be directed or not
	 */
	const link = (from, to, payload, metadata, directed) => addEdge(edgeFactory(getId(from), getId(to), payload, metadata, directed || !options.allowUndirected));

	/**
	 * Retrieve nodes matching a query
	 * @function getNodes
	 * @memberof graph
	 * @param query - an object with a list of properties to be matched
	 */
	const getNodes = (query) => query ? filter(nodes, (entry) => matches(query)(entry.payload)) : nodes;

	const getNodesByQueryGen = function*(query) {
		const matchQuery = matches(query);
		const isMatch = (item) => matchQuery(item.payload);
		yield* yieldMatching(yieldAll(nodes), isMatch);
	};

	/**
	 * Returns a generator retrieving nodes matching a query
	 * @function getNodesGen
	 * @memberof graph
	 * @param query - an object with a list of properties to be matched
	 */
	const getNodesGen = function*(query) {
		if (!query) {
			yield* yieldAll(nodes);
		} else {
			yield* getNodesByQueryGen(query);
		}
	};


	const squashEdges = (groups) => flatten(values(groups));

	const squashEdgesGen = function*(groups) {
		yield* yieldUnion(map(groups, (group) => yieldAll(group)));
	};

	/**
	 * Retrieve edges matching a query from a list of candidates
	 * @function getEdges
	 * @memberof graph
	 * @param pool - a list of candidate ids of edges
	 * @param query - an object with a list of properties to be matched
	 */
	const getEdges = (pool, query) => {
		const edgeMap = map(pool, (id) => edges[id]);
		return query ? filter(edgeMap, (entry) => matches(query)(entry.payload)) : edgeMap;
	};

	const getEdgesbyQueryGen = function*(generator, query) {
		const matchQuery = matches(query);
		const isMatch = (item) => matchQuery(item.payload);
		yield* yieldMatching(generator, isMatch);
	};

	/**
	 * Retrieve edges matching a query from a list of candidates, as a generator
	 * @function getEdges
	 * @memberof graph
	 * @param edgeIdsGenerator - a generator producing the ids of candidate edges
	 * @param query - an object with a list of properties to be matched
	 */
	const getEdgesGen = function*(edgeIdsGenerator, query) {
		const edgesGenerator = yieldMap(edgeIdsGenerator, (id) => edges[id]);
		if (!query) {
			yield* edgesGenerator;
		} else {
			yield* getEdgesbyQueryGen(edgesGenerator, query);
		}		
	};

	/**
	 * Retrieve edges extending from a given node
	 * @function getEdgesFrom
	 * @memberof graph
	 * @param node - the source node
	 * @param query - an object with a list of properties to be matched
	 */
	const getEdgesFrom = (node, query) => getEdges(squashEdges(node.outbound), query);

	/**
	 * Retrieve edges extending from a given node
	 * @function getEdgesFromGen
	 * @memberof graph
	 * @param node - the source node
	 * @param query - an object with a list of properties to be matched
	 */
	const getEdgesFromGen = function*(node, query) {
		yield* getEdgesGen(squashEdgesGen(node.outbound), query);
	};

	/**
	 * Retrieve edges reaching a given node
	 * @function getEdgesTo
	 * @memberof graph
	 * @param node - the target node
	 * @param query - an object with a list of properties to be matched
	 */
	const getEdgesTo = (node, query) => getEdges(squashEdges(node.inbound), query);

	/**
	 * Retrieve edges reaching a given node, as a generator
	 * @function getEdgesToGen
	 * @memberof graph
	 * @param node - the target node
	 * @param query - an object with a list of properties to be matched
	 */
	const getEdgesToGen = function*(node, query) {
		yield* getEdgesGen(squashEdgesGen(node.inbound), query);
	};

	/**
	 * Retrieve edges extending from a given node to another given node
	 * @function getEdgesBetween
	 * @memberof graph
	 * @param node - the source node
	 * @param node - the target node
	 * @param query - an object with a list of properties to be matched
	 */
	const getEdgesBetween = (from, to, query) => getEdges(getNode(from).outbound[getId(to)], query)

	/**
	 * Retrieve edges extending from a given node to another given node
	 * @function getEdgesBetweenGen
	 * @memberof graph
	 * @param node - the source node
	 * @param node - the target node
	 * @param query - an object with a list of properties to be matched
	 */
	const getEdgesBetweenGen = function*(from, to, query) {
		yield* getEdgesGen(yieldAll(getNode(from).outbound[getId(to)]), query);
	};

	/**
	 * Retrieve nodes reached by edges that extend from a given node
	 * @function getLinkedNodes
	 * @memberof graph
	 * @param node - the target node
	 * @param query - an object with a list of properties to be matched
	 */
	const getLinkedNodes = (node, query) => map(getEdgesFrom(node, query), (edge) => nodes[edge.to]);

	/**
	 * Retrieve nodes reached by edges that extend from a given node, as a generator
	 * @function getLinkedNodesGen
	 * @memberof graph
	 * @param node - the target node
	 * @param query - an object with a list of properties to be matched
	 */
	const getLinkedNodesGen = function*(node, query) {
		yield* yieldMap(getEdgesFromGen(node, query), (edge) => nodes[edge.to]);
	};

	/**
	 * Retrieve nodes having edges that reach a given node
	 * @function getLinkingNodes
	 * @memberof graph
	 * @param node - the target node
	 * @param query - an object with a list of properties to be matched
	 */
	const getLinkingNodes = (node, query) => map(getEdgesTo(node, query), (edge) => nodes[edge.from]);

	/**
	 * Retrieve nodes having edges that reach a given node
	 * @function getLinkingNodesGen
	 * @memberof graph
	 * @param node - the target node
	 * @param query - an object with a list of properties to be matched
	 */
	const getLinkingNodesGen = function*(node, query) {
		yield* yieldMap(getEdgesToGen(node, query), (edge) => nodes[edge.from]);	
	};

 	return {
 		nodes,
 		edges,
 		nodeCount,
 		edgeCount,
		hasAnyEdge: !options.allowUndirected ? hasDirectEdge : hasAnyEdge,
 		pack,
 		mergeWith,
 		addNode,
 		addEdge,
		getNode,
		getEdge,
 		removeNode,
 		removeEdge,
 		link,

		inflateNodes,
		inflateEdges,
		getNodes,
		getEdgesFrom,
		getEdgesTo,
		getEdgesBetween,
		getLinkedNodes,
		getLinkingNodes,
		
		inflateNodesGen,
		inflateEdgesGen,
		getNodesGen,
		getEdgesFromGen,
		getEdgesToGen,
		getEdgesBetweenGen,
		getLinkedNodesGen,
		getLinkingNodesGen
 	};
};