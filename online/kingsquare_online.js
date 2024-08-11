import { byte2str, str2byte } from "./crypt.js";

const MESSAGE_TYPE = {
  GREET: 0,
	ASK_GRID: 1,
	SOLUTION: 2,
	SOLUTION_RESPONSE: 3,
};

class NetPacketGrid {
  constructor() {
    this.buffer = new ArrayBuffer(4, { maxByteLength: 256 });
    this._vtags = new Uint8Array(this.buffer, 0, 2);
    this._vdata = new Uint8Array(this.buffer, 2, 2);
    this._len = new Uint8Array(this.buffer, 0, 4);
  }

  set_content(data) {
    this.buffer.resize(data.byteLength + 2);
    this._vdata = new Uint8Array(this.buffer, 2, data.byteLength);
    this._vdata.set(new Uint8Array(data));
    this._len = new Uint8Array(this.buffer, 0, data.byteLength + 2);
  }

  copy(data) {
    this.buffer.resize(data.byteLength);
    this._vdata = new Uint8Array(this.buffer, 2, data.byteLength - 2);
    this._len = new Uint8Array(this.buffer, 0, data.byteLength);
    this._len.set(new Uint8Array(data));
  }

  set(width, height, grid) {
    let msg = "";
    for (let i = 0; i < grid.length; i++) {
      msg += grid[i];
    }

    this.set_content(str2byte(msg));

    this._vtags[0] = width;
    this._vtags[1] = height;
  }

  get_string(into) {
    const msg = byte2str(this._vdata);
    for (let i = 0; i < msg.length; i++) {
      into.push(msg[i]);
    }

    return into;
  }
}

class NetPacketSolution {
  constructor() {
    this.buffer = new ArrayBuffer(8, { maxByteLength: 256 });
    this._vtags = new Uint8Array(this.buffer, 0, 2);
    this._valias = new Uint8Array(this.buffer, 2, 2);
    this._vindices = new Uint8Array(this.buffer, 4, 2);
    this._vword = new Uint8Array(this.buffer, 6, 2);
    this._len = new Uint8Array(this.buffer, 0, 8);
  }

  set_content(alias, indices, word) {
		const len = alias.length;
    this.buffer.resize(len * 3 + 2);
		this._vtags[0] = len;
    this._valias = new Uint8Array(this.buffer, 2, len);
    this._vindices = new Uint8Array(this.buffer, len + 2, len);
    this._vword = new Uint8Array(this.buffer, len * 2 + 2, len);
    this._len = new Uint8Array(this.buffer, 0, len * 3 + 2);

		this._valias.set(str2byte(alias));
		this._vword.set(str2byte(word));
		for (const i in indices) {
			this._vindices[i] = indices[i];
		}
  }

  copy(data) {
    this.buffer.resize(data.byteLength);
    this._len = new Uint8Array(this.buffer, 0, data.byteLength);
    this._len.set(new Uint8Array(data));
		const len = this._vtags[0];

    this._valias = new Uint8Array(this.buffer, 2, len);
    this._vindices = new Uint8Array(this.buffer, len + 2, len);
    this._vword = new Uint8Array(this.buffer, len * 2 + 2, len);
  }

	get_alias() {
		return byte2str(this._valias);
	}

	get_word() {
		return byte2str(this._vword);
	}
}

export { MESSAGE_TYPE, NetPacketGrid, NetPacketSolution };
