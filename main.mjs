import { wordlist } from "./wordlist.mjs";
import { Dictionary, Kingsquare } from "./kingsquare.mjs";
import KingsquareWorker from "./kingsquare_worker.mjs";

const dictionary = new Dictionary();
const kingsquare = new Kingsquare(dictionary);
const kworker = new KingsquareWorker(kingsquare);

function main() {
	dictionary.build(wordlist);
	kingsquare.init("базар");

	let timestamp = performance.now();
	kworker.start((key, indices, word) => {
    const now = performance.now();
    const dt = Math.ceil(now - timestamp);
    timestamp = now;
    console.log(`inserted ${key} -> ${word} in ${dt}ms`);

    printgrid(kingsquare.grid, indices, kingsquare.width, kingsquare.height);
	});
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
