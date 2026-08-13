import Phaser from './lib/phaser.js';
import { SCENE_KEYS } from './scenes/scene-keys.js';
import { PreloadScene } from './scenes/preload-scene.js';
import { BattleScene } from './scenes/battle-scene.js';
import { WorldScene } from './scenes/world-scene.js';
import { TitleScene } from './scenes/title-scene.js';
import { OptionsScene } from './scenes/options-scene.js';
import { TestScene } from './scenes/test-scene.js';
import { MonsterPartyScene } from './scenes/monster-party-scene.js';
import { MonsterDetailsScene } from './scenes/monster-details-scene.js';
import { InventoryScene } from './scenes/inventory-scene.js';
import { CutsceneScene } from './scenes/cutscene-scene.js';
import { DialogScene } from './scenes/dialog-scene.js';

const game = new Phaser.Game({
  type: Phaser.CANVAS,
  disableVisibilityChange: true,
  pixelArt: false,
  scale: {
    parent: 'game-container',
    width: 1024,
    height: 576,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  backgroundColor: '#000000',
});

const blockNativeGameGesture = (event) => event.preventDefault();
['contextmenu', 'selectstart', 'dragstart'].forEach((type) => {
  document.addEventListener(type, blockNativeGameGesture, { capture: true });
});

game.scene.add(SCENE_KEYS.PRELOAD_SCENE, PreloadScene);
game.scene.add(SCENE_KEYS.WORLD_SCENE, WorldScene);
game.scene.add(SCENE_KEYS.BATTLE_SCENE, BattleScene);
game.scene.add(SCENE_KEYS.TITLE_SCENE, TitleScene);
game.scene.add(SCENE_KEYS.OPTIONS_SCENE, OptionsScene);
game.scene.add(SCENE_KEYS.TEST_SCENE, TestScene);
game.scene.add(SCENE_KEYS.MONSTER_PARTY_SCENE, MonsterPartyScene);
game.scene.add(SCENE_KEYS.MONSTER_DETAILS_SCENE, MonsterDetailsScene);
game.scene.add(SCENE_KEYS.INVENTORY_SCENE, InventoryScene);
game.scene.add(SCENE_KEYS.CUTSCENE_SCENE, CutsceneScene);
game.scene.add(SCENE_KEYS.DIALOG_SCENE, DialogScene);
game.scene.start(SCENE_KEYS.PRELOAD_SCENE);

const keepMobileGameActive = () => {
  if (document.hidden) return;
  game.loop?.wake?.();
  const audioContext = game.sound?.context;
  if (audioContext?.state === 'suspended') audioContext.resume().catch(() => {});
  if (game.sound?.locked) game.sound.unlock?.();
};

window.addEventListener('message', (event) => {
  if (event.data?.source === 'condamine' && event.data.type === 'mobile-activate') {
    keepMobileGameActive();
  }
});
window.addEventListener('focus', keepMobileGameActive);
window.addEventListener('pageshow', keepMobileGameActive);
document.addEventListener('visibilitychange', keepMobileGameActive);

const createMobileControls = () => {
  const controls = document.createElement('div');
  controls.className = 'mobile-game-controls';
  controls.innerHTML = `
    <div class="mobile-dpad">
      <button data-code="ArrowUp" data-key="ArrowUp" data-hold="true" aria-label="Haut">▲</button>
      <button data-code="ArrowLeft" data-key="ArrowLeft" data-hold="true" aria-label="Gauche">◀</button>
      <button data-code="ArrowDown" data-key="ArrowDown" data-hold="true" aria-label="Bas">▼</button>
      <button data-code="ArrowRight" data-key="ArrowRight" data-hold="true" aria-label="Droite">▶</button>
    </div>
    <div class="mobile-actions">
      <button data-code="ShiftLeft" data-key="Shift" aria-label="Retour">B</button>
      <button class="primary" data-code="Space" data-key=" " aria-label="Valider">A</button>
      <button class="menu" data-code="Enter" data-key="Enter" aria-label="Menu">MENU</button>
    </div>`;

  const sendKey = (code, key, pressed) => window.postMessage({
    source: 'condamine', type: 'key-state', code, key, pressed
  }, '*');

  controls.querySelectorAll('button').forEach((button) => {
    const release = (event) => {
      event.preventDefault();
      sendKey(button.dataset.code, button.dataset.key, false);
      keepMobileGameActive();
    };
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      button.setPointerCapture?.(event.pointerId);
      keepMobileGameActive();
      sendKey(button.dataset.code, button.dataset.key, true);
      if (!button.dataset.hold) window.setTimeout(() => sendKey(button.dataset.code, button.dataset.key, false), 90);
    });
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('contextmenu', (event) => event.preventDefault());
  });
  document.body.appendChild(controls);
};

createMobileControls();
