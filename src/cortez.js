import get from "lodash/get";

import constants from "./constants";
import graph from "./graph";
import node from "./node";
import edge from "./edge";

const getId = (element) => get(element, 'id', element);

/**
 * Cortez object
 */
export default {
	getId,
	node,
	edge: edge(getId),
	//undirectedEdge: (from, to, payload, metadata) => edgeFactory(from, to, payload, metadata, false),
	graph: graph(getId, node, edge)
};
