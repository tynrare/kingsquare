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

  /**
   * Searches words matching alias
   * @returns {Array<string>} .
   */
  find_word(alias) {
    let words = null;

    for (let i = alias.length - 1; i >= 0; i--) {
      const letter = alias[i];
      // asterix does not change probability list
      if (letter == "*") {
        continue;
      }

      // fetch all probabilities for current letter
      const letter_possibilities = this.letters[letter];
      if (!letter_possibilities) {
        break;
      }
      // all probabilities for letter on current position
      const p = letter_possibilities[i] ?? [];

      if (!words) {
        words = p.slice();
      } else {
        words = words.filter((e) => p.includes(e));
      }
    }

    // convert indices into actual words
    if (words) {
      words = words.map((e) => this.list[e]);
    }

    return words;
  }
}

const _directions = [-1, 0, 1, 0, 0, -1, 0, 1];

class Kingsquare {
  /**
   * @param {Dictionary} dictionary .
   */
  constructor(dictionary) {
    this.dictionary = dictionary;
    /** @param {Array<string>} */
    this.grid = null;
    /** @param {Array<string>} */
    this.exclusions = [];

    this.step_index = 0;

    this.iterations = 0;

    this.zerosymbol = "*";
  }

  /**
   * @param {string} word .
   * @param {number} [width] .
   * @param {number} [height] .
   */
  init(word, width = word.length, height = width) {
    this.width = width;
    this.height = height;
    if (!((height * 0.5) % 1)) {
      this.height += 1;
    }
    this.grid = Array.from(this.zerosymbol.repeat(width * height));
    this.exclusions = [word];

    const y = Math.floor(this.height * 0.5);
    for (let x = 0; x < Math.min(width, word.length); x++) {
      const index = y * width + x;
      this.grid[index] = word[x];
    }

    return this;
  }

  /**
   * @param {function(string, Array<number>, Array<string>, boolean): boolean} callback
   */
  step(callback, exclude = this.exclusions) {
    const t = performance.now();
    //console.log("Kingsquare step: traversing grid..");
    const gridlen = this.width * this.height;
    const index = this.step_index++ % gridlen;
    this.iterations = (this.iterations + 1) % gridlen;

    const cb = (key, indices, words) => {
      words = words.filter((e) => !exclude.includes(e));
      if (words.length) {
        const ret = callback(key, indices, words, !this.iterations);
        return !(ret === false);
      }

      return true;
    };

    const x = index % this.width;
    const y = Math.floor(index / this.width);
    const list = this.traverse(
      this.dictionary,
      this.grid,
      x,
      y,
      cb,
      this.width,
      this.height,
    );

    const dt = Math.ceil(performance.now() - t);
    //console.log(`Kingsquare traversing grid done in ${dt}ms`);

    return !this.iterations;
  }

  insert(key, indices, word) {
    const letter_index = key.indexOf(this.zerosymbol);
    const letter_id = indices[letter_index];
    const letter = word[letter_index];

    this.grid[letter_id] = letter;
    this.exclusions.push(word);
    this.iterations = 0;
  }

  /**
   * @param {function(string, Array<number>, Array<string>): boolean} callback aborts traveling if false returned
   */
  traverse(
    dictionary,
    grid,
    x,
    y,
    callback,
    width = 5,
    height = 5,
    word = "",
    indices = [],
    traversed = [],
    fin = false,
  ) {
    if (x >= width || x < 0 || y >= height || y < 0) {
      return;
    }

    const index = y * width + x;
    if (traversed.includes(index)) {
      return;
    }

    traversed.push(index);
    traversed = traversed.slice();

    const letter = grid[index];

    if (letter == this.zerosymbol) {
      if (fin) {
        return;
      }
      fin = true;
    }

    word += letter;
    indices = indices.slice();
    indices.push(index);

    if (word.length > 1) {
      let words = dictionary.find_word(word);
      if (!words?.length) {
        return;
      }

      if (fin) {
        words = words.filter((w) => {
          return w.length == word.length;
        });

        if (callback(word, indices, words) === false) {
          return;
        }
      }
    }

    for (let i = 0; i < 4; i++) {
      const dx = _directions[i * 2];
      const dy = _directions[i * 2 + 1];
      this.traverse(
        dictionary,
        grid,
        x + dx,
        y + dy,
        callback,
        width,
        height,
        word,
        indices,
        traversed,
        fin,
      );
    }
  }
}

export { Kingsquare, Dictionary };
