export default () => {

	const factory = (from) => {
		let counter = -1;
		if (from !== undefined) {
			counter = from - 1;
		}

		const get_next = () => ++counter;
		const get_current = () => counter;

		return {
			get_next,
			get_current
		};
	};

	return { factory };

};
