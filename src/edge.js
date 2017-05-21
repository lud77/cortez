export default (getId) => (from, to, payload, metadata, directed = true) => ({
	type: "edge",
	directed,
	payload,
	metadata,
	from: getId(from),
	to: getId(to)
});
