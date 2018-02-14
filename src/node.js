/**
 * Create a node
 * @function node
 * @param payload - an object to be stored in the node
 * @param metadata - an object ot be stored in the node
 */
module.exports = (payload, metadata) => ({
	type: "node",
	payload,
	metadata,
	numOutbound: 0,
	numInbound: 0,
	outbound: {},
	inbound: {},
	hasUndirectedEdges: {}
});
