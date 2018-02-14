const get = require('lodash/get');

const graph = require('./graph');
const node = require('./node');
const edge = require('./edge');

const getId = (element) => get(element, "id", element);

/**
 * Cortez object
 */
module.exports = ({
	getId,
	node,
	edge: edge(getId),
	graph: graph(getId, node, edge)
});
