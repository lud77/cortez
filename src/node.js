export default (payload, metadata) => ({
	type: "node",
	payload,
	metadata,
	numOutbound: 0,
	numInbound: 0,
	outbound: {},
	inbound: {}
});
