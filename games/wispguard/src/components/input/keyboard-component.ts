import * as Phaser from 'phaser';
import { InputComponent } from './input-component';

export class KeyboardComponent extends InputComponent {
  #cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  #attackKey: Phaser.Input.Keyboard.Key;
  #actionKey: Phaser.Input.Keyboard.Key;
  #enterKey: Phaser.Input.Keyboard.Key;
  #virtualDown = new Set<string>();
  #virtualJustDown = new Set<string>();

  constructor(keyboardPlugin: Phaser.Input.Keyboard.KeyboardPlugin) {
    super();
    this.#cursorKeys = keyboardPlugin.createCursorKeys();
    this.#attackKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.#actionKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.#enterKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    // z = B, Attack
    // x = A, Talk, Run, Lift/Throw, Push/Pull
    // shift = Select, Open Save Menu
    // return/enter = Start, Open Inventory
  }

  setVirtualKey(code: string, pressed: boolean): void {
    if (pressed) {
      if (!this.#virtualDown.has(code)) this.#virtualJustDown.add(code);
      this.#virtualDown.add(code);
      return;
    }
    this.#virtualDown.delete(code);
    this.#virtualJustDown.delete(code);
  }

  #consumeVirtual(code: string): boolean {
    if (!this.#virtualJustDown.has(code)) return false;
    this.#virtualJustDown.delete(code);
    return true;
  }

  get isUpDown(): boolean {
    return this.#cursorKeys.up.isDown || this.#virtualDown.has('ArrowUp');
  }

  get isUpJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#cursorKeys.up) || this.#consumeVirtual('ArrowUp');
  }

  get isDownDown(): boolean {
    return this.#cursorKeys.down.isDown || this.#virtualDown.has('ArrowDown');
  }

  get isDownJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#cursorKeys.down) || this.#consumeVirtual('ArrowDown');
  }

  get isLeftDown(): boolean {
    return this.#cursorKeys.left.isDown || this.#virtualDown.has('ArrowLeft');
  }

  get isRightDown(): boolean {
    return this.#cursorKeys.right.isDown || this.#virtualDown.has('ArrowRight');
  }

  get isActionKeyJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#actionKey) || this.#consumeVirtual('KeyX');
  }

  get isAttackKeyJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#attackKey) || this.#consumeVirtual('KeyZ');
  }

  get isSelectKeyJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#cursorKeys.shift);
  }

  get isEnterKeyJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#enterKey) || this.#consumeVirtual('Enter');
  }
}
