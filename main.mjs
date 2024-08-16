import { wordlist } from "./wordlist.mjs";
import { Dictionary, Kingsquare } from "./kingsquare.mjs";
import KingsquareWorker from "./kingsquare_worker.mjs";

const dictionary = new Dictionary();
const kingsquare = new Kingsquare(dictionary);
const kworker = new KingsquareWorker(kingsquare);

function main() {
	dictionary.build(wordlist);
	kingsquare.init("базар");

	// maximum search time for one iteration
	kworker.limit_traverse_time = 100;

	let timestamp = 0;
	let elapsed = 0;

	const insert = (key, indices, word) => {
		kworker.insert(key, indices, word);
		console.log(`inserted ${key} -> ${word}`);

		printgrid(kingsquare.grid, indices, kingsquare.width, kingsquare.height);
	}

	const onsolution = (key, indices, word) => {
		console.log(`new word found ${key} -> ${word}`);
		// return false to stop search
	};
	const onfinish = (words) => {
		const now = performance.now();
		const dt = Math.ceil(now - timestamp);
		timestamp = now;
		elapsed += dt;

		const solutions = Object.values(words).sort((a, b) => b.alias.length - a.alias.length);

		console.log(`found ${solutions.length} solutions in ${dt}ms`);

		const solution = solutions[0];

		if (!solution) {
			console.log(`solved in ${elapsed}ms`);
			return;
		}
		
		insert(solution.alias, solution.indices, solution.words[0]);

		start();
	};
	const start = () => {
		let timestamp = performance.now();
		kworker.start(onsolution, onfinish);
	}

	start();
}

main();

function printgrid(grid, highlight, width = 5, height = 5) {
	let msg = "";
	if (!grid) {
		return msg;
	}
	for(let y = 0; y < height; y++) {
		for(let x = 0; x < width; x++) {
			const index = y * width + x;
			const l = grid[index] ?? "_";
			msg += highlight.includes(index) ? l.toUpperCase() : l;
		}
		msg += "\n";
	}

	console.log(msg);

	return msg;
}
