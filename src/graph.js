import map from "lodash/map";
import find from "lodash/find";
import matches from "lodash/matches";
import flatten from "lodash/flatten";
import values from "lodash/values";
import filter from "lodash/filter";

import sequenceFactory from "./sequence";
import { yieldAll, yieldMatching, yieldUnion, yieldMap } from "./generator-utils";

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
				const id = newGraph.addEdge(Object.assign({}, edges[e]));
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
		nodes[edge.from].numOutbound++;

		nodes[edge.to].inbound[edge.from].push(id);
		nodes[edge.to].numInbound++;

		if (options.allowUndirected && !edge.directed) {
			if (!nodes[edge.from].hasUndirectedEdges[edge.to]) {
				nodes[edge.from].hasUndirectedEdges[edge.to] = 0;
			}

			if (!nodes[edge.to].hasUndirectedEdges[edge.from]) {
				nodes[edge.to].hasUndirectedEdges[edge.from] = 0;
			}

			nodes[edge.from].hasUndirectedEdges[edge.to]++;
			nodes[edge.to].hasUndirectedEdges[edge.from]++;
		}

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

		const edgeObj = edges[id];
		if (!edgeObj) return;

		if (options.onRemoveEdge) {
			(options.onRemoveEdge)(edges[id], options.context);
		}

		if (options.allowUndirected && !edgeObj.directed) {
			nodes[edgeObj.from].hasUndirectedEdges[edgeObj.to]--;
			nodes[edgeObj.to].hasUndirectedEdges[edgeObj.from]--;
		}
		
		edgeCount--;
		delete edges[id];
	};

	const getNode = (node) => nodes[getId(node)];
	const getEdge = (edge) => edges[getId(edge)];
	const isDirected = (edge) => edge.directed;
	const hasDirectedEdge = (from, to) => !!getNode(from).outbound[getId(to)];

	const hasUndirectedEdge = (from, to) => {
		const hasUndirectedEdgesFrom = getNode(from).hasUndirectedEdges[getId(to)];
		if (hasUndirectedEdgesFrom !== undefined && hasUndirectedEdgesFrom > 0) return true;

		const hasUndirectedEdgesTo = getNode(to).hasUndirectedEdges[getId(from)];
		return hasUndirectedEdgesFrom !== undefined && hasUndirectedEdgesFrom > 0;
	}

	const hasAnyEdge = (from, to) => {
		if (hasDirectedEdge(from, to)) return true;
		return hasUndirectedEdge(from, to);
	};

	const inflateNodes = (nodeIds) => map(nodeIds, getNode);
	const inflateEdges = (edgeIds) => map(edgeIds, getEdge);

	const inflateNodesGen = function*(nodeIdsGen) {
		yield* yieldMap(nodeIdsGen, getNode);
	};

	const inflateEdgesGen = function*(edgeIdsGen) {
		yield* yieldMap(edgeIdsGen, getEdge);
	};

	const link = (from, to, payload, metadata, directed) => addEdge(
		edgeFactory(
			getId(from), 
			getId(to), 
			payload, 
			metadata, 
			directed || !options.allowUndirected
		)
	);

	const getNodes = (query) => query ? filter(nodes, (entry) => matches(query)(entry.payload)) : nodes;

	const getNodesByQueryGen = function*(query) {
		const matchQuery = matches(query);
		const isMatch = (item) => matchQuery(item.payload);
		yield* yieldMatching(yieldAll(nodes), isMatch);
	};

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

	const getEdges = (directed, edgeIds, query) => {
		const edgesList = map(edgeIds, getEdge);
		const anyDirectedness = directed === undefined;
		if (!query && anyDirectedness) {
			return edgesList;
		} else {
			const matchesQuery = matches(query);
			if (anyDirectedness) {
				const matchesDirectedness = (edge) => directed === isDirected(edge);
				return filter(edgesList, (entry) => matchesQuery(entry.payload));
			}

			return filter(edgesList, (entry) => matchesDirectedness(entry) && matchesQuery(entry.payload));
		}

		return edgesList;
	};

	const getEdgesGen = function*(directed, edgeIdsGenerator, query) {
		const edgesGenerator = yieldMap(edgeIdsGenerator, getEdge);
		const anyDirectedness = directed === undefined;
		if (!query && anyDirectedness) {
			yield* edgesGenerator;
		} else {
			const matchesQuery = matches(query);
			if (anyDirectedness) {
				yield* yieldMatching(edgesGenerator, (edge) => matchesQuery(edge.payload));
			} else {
				const matchesDirectedness = (edge) => directed === isDirected(edge);
				yield* yieldMatching(edgesGenerator, (edge) => matchesDirectedness(edge) && matchesQuery(edge.payload));
			}
		}
	};

	const getEdgesFrom = (directed, node, query) => getEdges(directed, squashEdges(node.outbound), query);

	const getEdgesFromGen = function*(directed, node, query) {
		yield* getEdgesGen(directed, squashEdgesGen(node.outbound), query);
	};

	const getEdgesTo = (directed, node, query) => getEdges(directed, squashEdges(node.inbound), query);

	const getEdgesToGen = function*(directed, node, query) {
		yield* getEdgesGen(directed, squashEdgesGen(node.inbound), query);
	};

	const getEdgesBetween = (directed, from, to, query) => getEdges(directed, getNode(from).outbound[getId(to)], query)

	const getEdgesBetweenGen = function*(directed, from, to, query) {
		yield* getEdgesGen(directed, yieldAll(getNode(from).outbound[getId(to)]), query);
	};

	const getLinkedNodes = (directed, node, query) => map(getEdgesFrom(directed, node, query), (edge) => nodes[edge.to]);

	const getLinkedNodesGen = function*(directed, node, query) {
		yield* yieldMap(getEdgesFromGen(directed, node, query), (edge) => nodes[edge.to]);
	};

	const getLinkingNodes = (directed, node, query) => map(getEdgesTo(directed, node, query), (edge) => nodes[edge.from]);

	const getLinkingNodesGen = function*(directed, node, query) {
		yield* yieldMap(getEdgesToGen(directed, node, query), (edge) => nodes[edge.from]);	
	};

 	return {
 		nodes,
 		edges,
 		nodeCount,
 		edgeCount,

		/**
		 * Checks if a pair of nodes has at least one edge connecting them
		 * @function hasAnyEdge
		 * @memberof graph
		 * @param from - a node
		 * @param to - a node
		 * @instance
		 */
		hasAnyEdge: options.allowUndirected ? hasAnyEdge : hasDirectedEdge,

		/**
		 * Checks if a pair of nodes has a directed edge connecting them
		 * @function hasDirectedEdge
		 * @memberof graph
		 * @param from - a node
		 * @param to - a node
		 * @instance
		 */
		hasDirectedEdge,

		/**
		 * Checks if a pair of nodes has an undirected edge connecting them
		 * @function hasUndirectedEdge
		 * @memberof graph
		 * @param from - a node
		 * @param to - a node
		 * @instance
		 */
		hasUndirectedEdge: options.allowUndirected ? hasUndirectedEdge : undefined,
 	
 		pack,
 		mergeWith,

		/**
		 * Add a node to the graph
		 * @function addNode
		 * @memberof graph
		 * @param node - a node object generated with cortez.node()
		 * @fires options.onAddNode
		 * @instance
		 */
 		addNode,

		/**
		 * Add an edge to the graph
		 * @function addEdge
		 * @memberof graph
		 * @param edge - an edge generated with cortez.edge()
		 * @fires options.onAddEdge
		 * @instance
		 */
		addEdge,

		/**
		 * Retrieve a node given a node object or its id
		 * @function getNode
		 * @memberof graph
		 * @param node - a node object or the id of a node
		 * @instance
		 */
	 	getNode,

		/**
		 * Retrieve an edge given an edge object or its id
		 * @function getEdge
		 * @memberof graph
		 * @param node - an edge object or the id of an edge
		 * @instance
		 */
		getEdge,

		/**
		 * Remove a node from a graph
		 * @function removeNode
		 * @memberof graph
		 * @param node - a node object or the id of a node
		 * @fires options.onRemoveNode
		 * @instance
		 */
 		removeNode,

		/**
		 * Remove an edge from a graph
		 * @function removeEdge
		 * @memberof graph
		 * @param edge - an edge object or the id of an edge
		 * @fires options.onRemoveEdge
		 * @instance
		 */
 		removeEdge,

		/**
		 * Shortcut method to create an edge between two nodes
		 * @function link
		 * @memberof graph
		 * @param from - a node
		 * @param to - a node
		 * @param payload - an object to be stored in the node
		 * @param metadata - an additional object to be stored in the node
		 * @param directed - whether the edge must be directed or not
		 * @instance
		 */
		link,

		/**
		 * Retrieves a list of nodes
		 * @function inflateNodes
		 * @memberof graph
		 * @param nodeIds - an array of ids of nodes to be retrieved
		 * @instance
		 */
		inflateNodes,

		/**
		 * Retrieves a list of edges
		 * @function inflateEdges
		 * @memberof graph
		 * @param edgeIds - an array of ids of edges to be retrieved
		 * @instance
		 */
	 	inflateEdges,

		/**
		 * Retrieve nodes matching a query
		 * @function getNodes
		 * @memberof graph
		 * @param query - an object with a list of properties to be matched
		 * @instance
		 */
	 	getNodes,

		/**
		 * Retrieve edges matching a query from a list of candidates
		 * @function getEdges
		 * @memberof graph
		 * @param edgeIds - a list of candidate ids of edges
		 * @param query - an object with a list of properties to be matched
		 * @instance
		 */
		getEdges,

		/**
		 * Retrieve edges extending from a given node
		 * @function getEdgesFrom
		 * @memberof graph
		 * @param node - the source node
		 * @param query - an object with a list of properties to be matched
		 * @instance
		 */
		getEdgesFrom,

		/**
		 * Retrieve edges reaching a given node
		 * @function getEdgesTo
		 * @memberof graph
		 * @param node - the target node
		 * @param query - an object with a list of properties to be matched
		 * @instance
		 */
		getEdgesTo,

		/**
		 * Retrieve edges extending from a given node to another given node
		 * @function getEdgesBetween
		 * @memberof graph
		 * @param node - the source node
		 * @param node - the target node
		 * @param query - an object with a list of properties to be matched
		 * @instance
		 */
		getEdgesBetween,

		/**
		 * Retrieve nodes reached by edges that extend from a given node
		 * @function getLinkedNodes
		 * @memberof graph
		 * @param node - the target node
		 * @param query - an object with a list of properties to be matched
		 * @instance
		 */
		getLinkedNodes,
		
		/**
		 * Retrieve nodes having edges that reach a given node
		 * @function getLinkingNodes
		 * @memberof graph
		 * @param node - the target node
		 * @param query - an object with a list of properties to be matched
		 * @instance
		 */
	 	getLinkingNodes,
		
		/**
		 * Retrieves a list of nodes as a generator
		 * @function inflateNodesGen
		 * @memberof graph
		 * @param nodeIdsGen - a generator producing the ids of nodes to be retrieved
		 * @instance
		 */
	 	inflateNodesGen,

		/**
		 * Retrieves a list of edges as a generator
		 * @function inflateEdgesGen
		 * @memberof graph
		 * @param edgeIdsGen - a generator producing the ids of edges to be retrieved
		 * @instance
		 */
		inflateEdgesGen,

		/**
		 * Returns a generator retrieving nodes matching a query
		 * @function getNodesGen
		 * @memberof graph
		 * @param query - an object with a list of properties to be matched
		 * @instance
		 */
	 	getNodesGen,

		/**
		 * Retrieve edges matching a query from a list of candidates, as a generator
		 * @function getEdgesGen
		 * @memberof graph
		 * @param edgeIdsGenerator - a generator producing the ids of candidate edges
		 * @param query - an object with a list of properties to be matched
		 * @instance
		 */
		getEdgesGen,

		/**
		 * Retrieve edges extending from a given node
		 * @function getEdgesFromGen
		 * @memberof graph
		 * @param node - the source node
		 * @param query - an object with a list of properties to be matched
		 * @instance
		 */
	 	getEdgesFromGen,

		/**
		 * Retrieve edges reaching a given node, as a generator
		 * @function getEdgesToGen
		 * @memberof graph
		 * @param node - the target node
		 * @param query - an object with a list of properties to be matched
		 * @instance
		 */
		getEdgesToGen,

		/**
		 * Retrieve edges extending from a given node to another given node
		 * @function getEdgesBetweenGen
		 * @memberof graph
		 * @param node - the source node
		 * @param node - the target node
		 * @param query - an object with a list of properties to be matched
		 * @instance
		 */
		getEdgesBetweenGen,

		/**
		 * Retrieve nodes reached by edges that extend from a given node, as a generator
		 * @function getLinkedNodesGen
		 * @memberof graph
		 * @param node - the target node
		 * @param query - an object with a list of properties to be matched
		 * @instance
		 */
		getLinkedNodesGen,

		/**
		 * Retrieve nodes having edges that reach a given node
		 * @function getLinkingNodesGen
		 * @memberof graph
		 * @param node - the target node
		 * @param query - an object with a list of properties to be matched
		 * @instance
		 */
		getLinkingNodesGen
 	};
};
