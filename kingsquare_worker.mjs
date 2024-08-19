import { Dictionary, Kingsquare } from "./kingsquare.mjs";

class KingsquareWorker {
  /**
   * @param {Kingsquare} kingsquare .
   */
  constructor(kingsquare) {
    /** @type {Kingsquare} */
    this.core = kingsquare;
    this.words_found = {};
    this.words_found_count = 0;
    this.active = false;
    this.limit_traverse_time = 1000;
    this.timestamp = 0;
  }

  loop() {
    this._loop_requested = false;

    if (!this.active) {
      return;
    }

    if (!this.core.grid) {
      setTimeout(this.loop.bind(this), 100);
      return;
    }

    const max_time = this.limit_traverse_time;
    let resume_loop = true;

    const cb = (key, indices, words) => {
      const dt = Math.ceil(performance.now() - this.timestamp);
      if (this.words_found[key]) {
          return true;
      }
      this.words_found[key] = {
        alias: key,
        indices,
        words,
      };
      this.words_found_count += 1;

      if (this.onsolution) {
        const ret = this.onsolution(key, indices, words, this.words_found);
        if (ret === false) {
            resume_loop = false;
            return false;
        }
      }

      if (max_time && dt > max_time && this.words_found_count) {
        resume_loop = false;
        return false;
      }

      return true;
    };

    const fin = this.core.step(cb);

    if (!resume_loop || fin) {
      this.active = false;
      if (this.onfinish) {
        this.onfinish(this.words_found);
      }
      return;
    }

    if (!this._loop_requested) {
        this._loop_requested = true;
        setTimeout(this.loop.bind(this), 100);
    }
  }

  insert(key, indices, word) {
    if (!this.validate(key, indices, word)) {
      return false;
    }

    this.core.insert(key, indices, word);
    this.words_found = {};
		this.stop();

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

    for (const i in indices) {
      const id = indices[i];
      if (this.core.grid[id] != key[i]) {
        return false;
      }
    }

    return true;
  }

  start(onsolution, onfinish) {
    this.words_found = {};
    this.words_found_count = 0;
    this.onsolution = onsolution;
    this.onfinish = onfinish;
    this.active = true;
    this.timestamp = performance.now();
    this.loop();
  }

  stop() {
    this.active = false;
  }
}

export default KingsquareWorker;
