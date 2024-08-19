import KingsquareApp from "../app.js";

import Network from "./network.js";
import {
  MESSAGE_TYPE,
  NetPacketGrid,
  NetPacketSolution,
} from "./kingsquare_online.js";

const network = new Network();
const kapp = new KingsquareApp(calculated, false, false);

let timestamp = performance.now();
function calculated(key, indices, word) {
  if (!key) {
    if (is_done()) {
		initial_ask_grid(word);
	}
    return;
  }
  kapp.draw(indices);

  on_solution(key, indices, word);

  const packet = new NetPacketSolution();
  packet.set_content(key, indices, word);
  network.send(MESSAGE_TYPE.SOLUTION, packet.buffer);
}

function receive_solution(key, indices, word) {
  if (!kapp.kworker.insert(key, indices, word, true)) {
    return false;
  }
  kapp.draw(indices, "yellow");
  on_solution(key, indices, word);
  return true;
}

let last_word = "бобик"
function on_solution(key, indices, word) {
  timestamp = performance.now();
  last_word = word;
  if (is_done()) {
      initial_ask_grid(word);
  }
}

function is_done() {
  return (
    !kapp.kingsquare.grid ||
    !kapp.kingsquare.grid.includes(kapp.kingsquare.zerosymbol)
  );
}

const stats = {
  approves: 0,
  rejects: 0,
};

function loop() {
  requestAnimationFrame(loop);

  const now = performance.now();
  const dt = Math.ceil(now - timestamp);

	if (!network.netlib) {
		return;
	}

  const st = `🟢${stats.approves}`;
  const online = `${network.netlib.peers.size + 1}/16 online`;

  if (kworker.active) {
    statsheader.innerHTML = `${online}. ${st}. ${dt}ms`;
  } else {
    statsheader.innerHTML = `${online}. ${st}. done.`;
  }

}

function recieve(type, data) {
  switch (type) {
    case MESSAGE_TYPE.GREET: {
      if (!is_done()) {
        return;
      }
      const packet = new NetPacketGrid();
      packet.copy(data);
      kapp.kingsquare.grid = packet.get_string([]);
      kapp.kingsquare.width = packet._vtags[0];
      kapp.kingsquare.height = packet._vtags[1];
      kapp.kingsquare.exclusions = [];
      kapp.start();
      kapp.draw();
      break;
    }
    case MESSAGE_TYPE.ASK_GRID: {
      if (!kapp.kingsquare.grid) {
        return;
      }
			if (is_done()) {
				create(last_word);
			}
      send_grid();
      break;
    }
    case MESSAGE_TYPE.SOLUTION: {
      const packet = new NetPacketSolution();
      packet.copy(data);
      const key = packet.get_alias();
      const word = packet.get_word();
      const confirmed = receive_solution(key, packet._vindices, word);
      kapp.log(`remote: ${key} -> ${word} ${confirmed ? "" : "rejected"}`);
      network.send(MESSAGE_TYPE.SOLUTION_RESPONSE, confirmed);
      break;
    }
    case MESSAGE_TYPE.SOLUTION_RESPONSE: {
      if (data[0]) {
        stats.approves += 1;
      } else {
        stats.rejects += 1;
      }
      break;
    }
  }
}

function greet(peerid) {
  const grid = kapp.kingsquare.grid;
  if (!grid) {
    return;
  }

  send_grid(peerid);
}

function send_grid(to) {
  const packet = new NetPacketGrid();
  packet.set(
    kapp.kingsquare.width,
    kapp.kingsquare.height,
    kapp.kingsquare.grid,
  );

  network.send(MESSAGE_TYPE.GREET, packet.buffer, to);
}

function create(word = "бобик") {
  kapp.kingsquare.init(word);
  kapp.start();
  kapp.draw();
}

let initial_ask_grid_count = 0;
let initial_ask_grid_word = "бобик";
function initial_ask_grid(word) {
	if (word) {
		initial_ask_grid_count = 0;
		initial_ask_grid_word = word;
	}
  if (!is_done()) {
    return;
  }

  if (initial_ask_grid_count++ > 10) {
    create(initial_ask_grid_word);
    return;
  }

  network.send(MESSAGE_TYPE.ASK_GRID, null);
  setTimeout(initial_ask_grid, 100);
}

function main() {
  network.init().run((initial) => {
    if (initial) {
      create();
    } else {
      initial_ask_grid();
    }
  });
  network.recieve = recieve;
  network.greet = greet;
  loop();
}

main();
