import { wordlist } from "./wordlist.mjs";
import { Dictionary, kingsquare } from "./kingsquare.mjs";

function print(grid, highlight, width = 5, height = 5) {
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

	return msg;
}

function step(dictionary, grid, excluded) {
	const sort = (array) => {
		const a = array.sort((a, b) => b.length - a.length);
		return array;
	}
	const words = kingsquare(dictionary, grid, excluded);
	const words_by_len = Object.keys(words);
	if (!words_by_len.length) {
		return null;
	}

	words_by_len.sort((a, b) => b.length - a.length);

	const selected_word_id = words_by_len[0];

	const possible_words = words[selected_word_id].possibilities;
	const selected_word = possible_words[0];
	const selected_letter_id = selected_word_id.indexOf("*");
	const selected_letter_index = words[selected_word_id].indices[selected_letter_id];
	const selected_letter = selected_word[selected_letter_id];

	grid[selected_letter_index] = selected_letter;
	console.log(selected_word_id, selected_word, selected_letter, selected_letter_index);
	excluded.push(selected_word);

	return words[selected_word_id].indices;
}


function main() {
	const dictionary = new Dictionary();
	dictionary.build(wordlist);

	/*
	let grid = [
		null, null, null, null, null,
		null, null, null, null, null,
		"а", "р", "б", "у", "з",
		null, null, null, null, null,
		null, null, null, null, null
	]
	const excluded = ["арбуз"];
	*/
	let grid = [
		null, null, 'ж',  null, null,
		'г',  'з',  'а',  'р',  null,
		'а',  'р',  'б',  'у',  'з',
		null, 'ц',  'е',  'з',  null,
		null, null, null, null, null
	]
	const excluded = [
		"арбуз",
		"зубр",
		"зебра",
		"зубец",
		"рубец",
		"цезура",
		"заруб",
		"разгар",
		"жабра",
	];

	while(grid) {
		const highlight = step(dictionary, grid, excluded);
		if (!highlight) {
			break;
		}
		console.log(print(grid, highlight));
		//console.log(grid, excluded);
		return;
	}
}

main();
