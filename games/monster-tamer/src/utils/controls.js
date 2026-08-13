import Phaser from '../lib/phaser.js';
import { DIRECTION } from '../common/direction.js';

const virtualKeysDown = new Set();
const virtualKeysJustDown = new Set();

if (!window.__condamineMonsterTouchControls) {
  window.__condamineMonsterTouchControls = true;
  window.addEventListener('message', (event) => {
    if (event.data?.source !== 'condamine') return;
    if (event.data.type === 'simulate-key') {
      virtualKeysDown.add(event.data.code);
      virtualKeysJustDown.add(event.data.code);
      window.setTimeout(() => virtualKeysDown.delete(event.data.code), 90);
    }
    if (event.data.type === 'key-state') {
      if (event.data.pressed) {
        if (!virtualKeysDown.has(event.data.code)) virtualKeysJustDown.add(event.data.code);
        virtualKeysDown.add(event.data.code);
      } else virtualKeysDown.delete(event.data.code);
    }
  });
}

const consumeVirtualKey = (code) => {
  if (!virtualKeysJustDown.has(code)) return false;
  virtualKeysJustDown.delete(code);
  return true;
};

export class Controls {
  /** @type {Phaser.Scene} */
  #scene;
  /** @type {Phaser.Types.Input.Keyboard.CursorKeys | undefined} */
  #cursorKeys;
  /** @type {boolean} */
  #lockPlayerInput;
  /** @type {Phaser.Input.Keyboard.Key | undefined} */
  #enterKey;
  /** @type {Phaser.Input.Keyboard.Key | undefined} */
  #fKey;

  /**
   * @param {Phaser.Scene} scene the Phaser 3 Scene the cursor keys will be created in
   */
  constructor(scene) {
    this.#scene = scene;
    this.#cursorKeys = this.#scene.input.keyboard?.createCursorKeys();
    this.#enterKey = this.#scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.#fKey = this.#scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.#lockPlayerInput = false;
  }

  /** @type {boolean} */
  get isInputLocked() {
    return this.#lockPlayerInput;
  }

  /** @param {boolean} val the value that will be assigned */
  set lockInput(val) {
    this.#lockPlayerInput = val;
  }

  /** @returns {boolean} */
  wasEnterKeyPressed() {
    if (consumeVirtualKey('Enter')) return true;
    if (this.#enterKey === undefined) {
      return false;
    }
    return Phaser.Input.Keyboard.JustDown(this.#enterKey);
  }

  /** @returns {boolean} */
  wasSpaceKeyPressed() {
    if (consumeVirtualKey('Space')) return true;
    if (this.#cursorKeys === undefined) {
      return false;
    }
    return Phaser.Input.Keyboard.JustDown(this.#cursorKeys.space);
  }

  /** @returns {boolean} */
  wasBackKeyPressed() {
    if (consumeVirtualKey('ShiftLeft') || consumeVirtualKey('ShiftRight')) return true;
    if (this.#cursorKeys === undefined) {
      return false;
    }
    return Phaser.Input.Keyboard.JustDown(this.#cursorKeys.shift);
  }

  /** @returns {boolean} */
  wasFKeyPressed() {
    if (this.#fKey === undefined) {
      return false;
    }
    return Phaser.Input.Keyboard.JustDown(this.#fKey);
  }

  /**
   * Returns if the shift key is currently being held down.
   * @returns {boolean}
   */
  isShiftKeyDown() {
    if (virtualKeysDown.has('ShiftLeft') || virtualKeysDown.has('ShiftRight')) return true;
    if (this.#cursorKeys === undefined) {
      return false;
    }
    return this.#cursorKeys.shift.isDown;
  }

  /** @returns {import('../common/direction.js').Direction} */
  getDirectionKeyJustPressed() {
    if (this.#cursorKeys === undefined) {
      return DIRECTION.NONE;
    }

    /** @type {import('../common/direction.js').Direction} */
    let selectedDirection = DIRECTION.NONE;
    if (consumeVirtualKey('ArrowLeft') || Phaser.Input.Keyboard.JustDown(this.#cursorKeys.left)) {
      selectedDirection = DIRECTION.LEFT;
    } else if (consumeVirtualKey('ArrowRight') || Phaser.Input.Keyboard.JustDown(this.#cursorKeys.right)) {
      selectedDirection = DIRECTION.RIGHT;
    } else if (consumeVirtualKey('ArrowUp') || Phaser.Input.Keyboard.JustDown(this.#cursorKeys.up)) {
      selectedDirection = DIRECTION.UP;
    } else if (consumeVirtualKey('ArrowDown') || Phaser.Input.Keyboard.JustDown(this.#cursorKeys.down)) {
      selectedDirection = DIRECTION.DOWN;
    }

    return selectedDirection;
  }

  /** @returns {import('../common/direction.js').Direction} */
  getDirectionKeyPressedDown() {
    if (this.#cursorKeys === undefined) {
      return DIRECTION.NONE;
    }

    /** @type {import('../common/direction.js').Direction} */
    let selectedDirection = DIRECTION.NONE;
    if (virtualKeysDown.has('ArrowLeft') || this.#cursorKeys.left.isDown) {
      selectedDirection = DIRECTION.LEFT;
    } else if (virtualKeysDown.has('ArrowRight') || this.#cursorKeys.right.isDown) {
      selectedDirection = DIRECTION.RIGHT;
    } else if (virtualKeysDown.has('ArrowUp') || this.#cursorKeys.up.isDown) {
      selectedDirection = DIRECTION.UP;
    } else if (virtualKeysDown.has('ArrowDown') || this.#cursorKeys.down.isDown) {
      selectedDirection = DIRECTION.DOWN;
    }

    return selectedDirection;
  }
}
