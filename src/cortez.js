import graphFactory from "./graph";

const { factory } = graphFactory;

const getId = (element) => (element && typeof(element) === "object" && element.id !== undefined) ? element.id : element;

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

const graph = factory(getId, node, edge);

export default {
	getId,
	graph,
	node,
	edge
};
