const yieldAll = function*(items) {
	if (items.length !== undefined) {
		for (const item of items) {
			yield item; 
		}
	} else {
		for (const i in items) {
			yield items[i]; 
		}
	}
};

const yieldMatching = function*(generator, isMatch) {
	while (true) {
		const item = generator.next();
		if (item.done) break;
		if (isMatch(item.value)) yield item.value;
	}
};

const yieldUnion = function*(generators) {
	for (const generator of generators) {
		yield* generator;
	}
};

const yieldMap = function*(generator, map) {
	while (true) {
		const item = generator.next();
		if (item.done) break;
		yield map(item.value);
	}
};

export {
	yieldAll,
	yieldMatching,
	yieldUnion,
	yieldMap
};