/**
 * Create a edge
 * @function edge
 * @param payload - an object to be stored in the edge
 * @param metadata - an object ot be stored in the edge
 */
module.exports = (getId) => (from, to, payload, metadata, directed = true) => ({
	directed,
	payload,
	metadata,
	from: getId(from),
	to: getId(to)
});
