import _ from "lodash";

import constants from "./constants";
import graph from "./graph";
import node from "./node";
import edge from "./edge";

const getId = (element) => _.get(element, 'id', element);

export default {
	getId,
	node,
	edge: edge(getId),
	//undirectedEdge: (from, to, payload, metadata) => edgeFactory(from, to, payload, metadata, false),
	graph: graph(getId, node, edge)
};
