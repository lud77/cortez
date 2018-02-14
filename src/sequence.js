/**
 * Returns a sequence object
 * @namespace sequence
 * @param from - the starting value for the sequence
 */
const factory = (from) => {
	let counter = -1;
	if (from !== undefined) {
		counter = from - 1;
	}

	/**
	 * Return the next number in the sequnece
	 * @function getNext
	 * @memberof sequence
	 */
	const getNext = () => ++counter;

	/**
	 * Return the current number in the sequnece without increasing the counter
	 * @function getCurrent
	 * @memberof sequence
	 */
	const getCurrent = () => counter;

	return {
		getNext,
		getCurrent
	};
};

module.exports = factory;
