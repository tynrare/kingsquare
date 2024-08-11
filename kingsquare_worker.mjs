import { Dictionary, Kingsquare } from "./kingsquare.mjs";

class KingsquareWorker {
  /**
   * @param {Kingsquare} kingsquare .
   */
  constructor(kingsquare) {
    /** @type {Kingsquare} */
    this.core = kingsquare;
    this.word_insert = {
      key: null,
      indices: null,
      words: null,
    };
    this.active = false;
  }

  loop() {
    if (!this.active ) {
      return;
    }
		if (!this.core.grid) {
			setTimeout(this.loop.bind(this), 100);
			return;
		}

    const t = performance.now();
    const max_time = 100;

    let inserted = false;

		const insert = (key, indices, words)=>{
			const word = words[0];
			this.insert(key, indices, word);
			inserted = true;
		}

    const cb = (key, indices, words, fin) => {
      const dt = Math.ceil(performance.now() - t);
      //console.log(word_insert.key, key, words);
      if (!this.word_insert.key || this.word_insert.key.length < key.length) {
        this.word_insert.key = key;
        this.word_insert.indices = indices;
        this.word_insert.words = words;
      }

      if (dt > max_time && this.word_insert.key) {
        insert(
          this.word_insert.key,
          this.word_insert.indices,
          this.word_insert.words,
        );
        return false;
      }

      return true;
    };

    const fin = this.core.step(cb);
    if (fin && this.word_insert.key) {
      insert(
        this.word_insert.key,
        this.word_insert.indices,
        this.word_insert.words,
      );
    }

    if (fin && !inserted) {
      // nothing to search anymore
			this.active = false;
      return;
    }

    setTimeout(this.loop.bind(this), 100);
  }

  insert(key, indices, word, mute = false) {
		if (!this.validate(key, indices, word)) {
			return false;
		}

    this.core.insert(key, indices, word);
    this.word_insert.key = null;
		if (this.callback && !mute) {
			this.callback(key, indices, word);
		}

		return true;
  }

	validate(key, indices, word) {
		if (this.core.exclusions.includes("word")) {
			return false;
		}

		const asterix_a = key.indexOf(this.core.zerosymbol);
		const asterix_b = key.lastIndexOf(this.core.zerosymbol);
		if (asterix_a < 0 || asterix_a != asterix_b) {
			return false;
		}

		for(const i in indices) {
			const id = indices[i];
			if (this.core.grid[id] != key[i]) {
				return false;
			}
		}

		return true;
	}

  start(callback) {
		this.callback = callback;
    this.active = true;
    this.loop();
  }

  stop() {
    this.active = false;
  }
}

export default KingsquareWorker;
