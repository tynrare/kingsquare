class Dictionary {
  constructor() {
    /** @type {Array<string>} */
    this.list = null;
  }
  /*
   * @param {Array<string>} list .
   */
  build(list) {
    const t = performance.now();
    console.log("Kingsquare wordlist caching..");

    this.list = list;
    this.letters = {};

    for (let i = 0; i < list.length; i++) {
      const word = list[i];
      for (let ii = 0; ii < word.length; ii++) {
        const letter = word[ii];
        if (!this.letters[letter]) {
          this.letters[letter] = {};
        }
        if (!this.letters[letter][ii]) {
          this.letters[letter][ii] = [];
        }
        this.letters[letter][ii].push(i);
      }
    }

    const dt = Math.ceil(performance.now() - t);
    console.log(`Kingsquare wordlist caching done in ${dt}ms`);
  }
}

function kingsquare_find_possible_words(dictionary, word) {
  let possibilities = null;

  for (let i = word.length - 1; i >= 0; i--) {
    //for (let i = 0; i < word.length; i++)
    const letter = word[i];
    // asterix does not change probability list
    if (letter == "*") {
      continue;
    }

    // fetch all probabilities for current letter
    const letter_possibilities = dictionary.letters[letter];
    if (!letter_possibilities) {
      break;
    }
    // all probabilities for letter on current position
    const p = letter_possibilities[i];
    if (!p) {
      break;
    }

    if (!possibilities) {
      possibilities = p.slice();
    } else {
      possibilities = possibilities.filter((e) => p.includes(e));
    }
  }

  return possibilities;
}

function kingsquare_traverse_grid(
  dictionary,
  grid,
  x,
  y,
  width = 5,
  height = 5,
  word = "",
  indices = [],
  list = {},
  traversed = [],
  fin = false,
) {
  if (x >= width || x < 0 || y >= height || y < 0) {
    return list;
  }

  const index = y * width + x;
  if (traversed.includes(index)) {
    return list;
  }

  traversed.push(index);
  traversed = traversed.slice();

  const letter = grid[index] ?? "*";

  if (letter == "*") {
    if (fin) {
      return list;
    }
    fin = true;
  }

  word += letter;
  indices = indices.slice();
  indices.push(index);

  if (word.length > 1) {
    let possibilities = kingsquare_find_possible_words(dictionary, word);
    if (!possibilities?.length) {
      return list;
    }

    if (fin && !list[word]) {
			possibilities = possibilities.filter((e) => {
				return dictionary.list[e].length == word.length;
			});

      list[word] = {
        indices,
        possibilities,
      };
    }
  }

  for (let i = 0; i < 4; i++) {
    const dx = kingsquare_parse_grid.directions[i * 2];
    const dy = kingsquare_parse_grid.directions[i * 2 + 1];
    kingsquare_traverse_grid(
      dictionary,
      grid,
      x + dx,
      y + dy,
      width,
      height,
      word,
      indices,
      list,
      traversed,
      fin,
    );
  }

  return list;
}
kingsquare_parse_grid.directions = [-1, 0, 1, 0, 0, -1, 0, 1];

/**
 * @param {Array<string>} grid .
 * @param {Dictionary} dictionary .
 * @returns {Object<string, KingsquareWord>}
 */
function kingsquare_parse_grid(dictionary, grid, width, height) {
  const t = performance.now();
  console.log("Kingsquare parsing grid..");

  // finding all possible words on current grid
  const words = {};
  for (let i = 0; i < grid.length; i++) {
    const letter = grid[i];
    const x = i % width;
    const y = Math.floor(i / width);
    const list = kingsquare_traverse_grid(
      dictionary,
      grid,
      x,
      y,
      width,
      height,
    );

    for (const k in list) {
      words[k] = list[k];
    }
  }

  //console.log("possible words:", words);

  const dt = Math.ceil(performance.now() - t);
  console.log(`Kingsquare parsing grid done in ${dt}ms`);

  return words;
}

/**
 * @typedef {KingsquareWord}
 * @property {Array<number>} indices
 * @property {Array<string>} possibilities
 */

/**
 * @param {Array<string>} grid .
 * @param {Array<string>} exclude words that should not be used
 * @param {Dictionary} dictionary .
 * @returns {Object<string, KingsquareWord>}
 */
function kingsquare(dictionary, grid, exclude, width = 5, height = 5) {
  const t = performance.now();
  console.log("Kingsquare probabilities calculating..");

  const words = kingsquare_parse_grid(dictionary, grid, width, height);

  // cleanup excluded words
  // replace indices with words
  for (const k in words) {
    const list = words[k].possibilities.map((e) => dictionary.list[e]);
    words[k].possibilities = list.filter((e) => !exclude.includes(e));
    if (!words[k].possibilities.length) {
      delete words[k];
    }
  }

  const dt = Math.ceil(performance.now() - t);
  console.log(`Kingsquare probabilities calculating done in ${dt}ms`);

  return words;
}

export { kingsquare, Dictionary };
