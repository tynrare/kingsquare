import { wordlist } from "./wordlist.mjs";
import { Dictionary, Kingsquare } from "./kingsquare.mjs";
import KingsquareWorker from "./kingsquare_worker.mjs";

const dictionary = new Dictionary();
const kingsquare = new Kingsquare(dictionary);
const kworker = new KingsquareWorker(kingsquare);
window.dictionary = dictionary;
window.kingsquare = kingsquare;
window.kworker = kworker;

function log(msg) {
  console.log(msg);
  const el = document.createElement("div");
  el.innerHTML = msg;
  statslog.insertBefore(el, statslog.firstChild);
  while (statslog.children.length > 4) {
    statslog.removeChild(statslog.lastChild);
  }
}

function draw(highlights, color = "green") {
  if (!kingsquare.grid) {
    return;
  }

  if (gridel.children.length != kingsquare.grid.length) {
    gridel.innerHTML = "<g>*</g>".repeat(kingsquare.grid.length);
  }

  for (let i = 0; i < kingsquare.grid.length; i++) {
    const letter = kingsquare.grid[i];
    const childel = gridel.children[i];
    if (letter != childel.innerHTML) {
      childel.innerHTML = letter;
    }

    childel.classList.remove(
      "highlight",
      "up",
      "down",
      "left",
      "right",
      "green",
      "yellow",
    );
    const highlight_index = highlights?.indexOf(i) ?? -1;

    if (highlight_index >= 0) {
      childel.classList.add("highlight", color);
      const apos = highlights[highlight_index];
      const bpos = highlights[highlight_index + 1];

      if (apos > bpos && apos - 1 == bpos) {
        childel.classList.add("left");
      } else if (apos > bpos) {
        childel.classList.add("up");
      } else if (apos < bpos && apos + 1 == bpos) {
        childel.classList.add("right");
      } else if (apos < bpos) {
        childel.classList.add("down");
      }
    }
  }
}

let timestamp = performance.now();

function loop() {
  const now = performance.now();
  const dt = Math.ceil(now - timestamp);

  if (kworker.active) {
    statsheader.innerHTML = `${dt}ms`;
  } else {
    statsheader.innerHTML = `done.`;
  }

  requestAnimationFrame(loop);
}

export default function main(callback, autoloop = true, autodraw = true) {
  dictionary.build(wordlist);

  this.draw = draw;
	this.log = log;
  this.start = () => {
    kworker.start((key, indices, word) => {
      const now = performance.now();
      const dt = Math.ceil(now - timestamp);
      timestamp = now;
      log(`${dt}ms: ${key} -> ${word}`);
			gridel.style.setProperty("--grid_width", kingsquare.width);
			gridel.style.setProperty("--grid_height", kingsquare.height);
      if (autodraw) {
        this.draw(indices);
      }
      if (callback) {
        callback(key, indices, word);
      }
    });

    if (autodraw) {
      this.draw();
    }
    if (autoloop) {
      loop();
    }
  };

  this.dictionary = dictionary;
  this.kingsquare = kingsquare;
  this.kworker = kworker;
}
