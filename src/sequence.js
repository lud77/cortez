const factory = (from) => {
	let counter = -1;
	if (from !== undefined) {
		counter = from - 1;
	}

	const getNext = () => ++counter;
	const getCurrent = () => counter;

	return {
		getNext,
		getCurrent
	};
};

export default factory;
