
const letters = [
	"*",
  "а",
  "б",
  "в",
  "г",
  "д",
  "е",
  "ё",
  "ж",
  "з",
  "и",
  "й",
  "к",
  "л",
  "м",
  "н",
  "о",
  "п",
  "р",
  "с",
  "т",
  "у",
  "ф",
  "х",
  "ц",
  "ч",
  "ш",
  "щ",
  "ъ",
  "ы",
  "ь",
  "э",
  "ю",
  "я",
];

export function str2byte(str) {
	const data = new Uint8Array(str.length);
	for(let i = 0; i < str.length; i++) {
		const l = str[i].toLowerCase();
		const id = letters.indexOf(l) + 1;
		data[i] = id;
	}

	return data;
}

export function byte2str(data) {
	let msg = "";
	for (let i = 0; i < data.length; i++) {
		msg += letters[data[i] - 1];
	}

	return msg;
}
