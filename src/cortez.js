import get from "lodash/get";

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
	graph: graph(getId, node, edge)
};
