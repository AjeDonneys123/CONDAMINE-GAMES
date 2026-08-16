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

window.addEventListener('error', (event) => {
  window.parent?.postMessage?.({
    source: 'condamine-game',
    type: 'game-error',
    message: String(event?.message || 'Erreur de chargement du jeu'),
  }, '*');
});
window.addEventListener('unhandledrejection', (event) => {
  window.parent?.postMessage?.({
    source: 'condamine-game',
    type: 'game-error',
    message: String(event?.reason?.message || event?.reason || 'Ressource du jeu indisponible'),
  }, '*');
});

const blockNativeGameGesture = (event) => event.preventDefault();
['contextmenu', 'selectstart', 'dragstart'].forEach((type) => {
  document.addEventListener(type, blockNativeGameGesture, { capture: true });
});

// Sur Safari/iOS, protéger seulement le canvas ne suffit pas en paysage : les
// marges de mise à l'échelle restent sélectionnables. Toute la page du jeu est
// donc neutralisée, sauf les commandes qui gèrent elles-mêmes leurs touch events.
['touchstart', 'touchmove'].forEach((type) => {
  document.addEventListener(type, (event) => {
    if (event.target?.closest?.('.mobile-control')) return;
    event.preventDefault();
  }, { passive: false, capture: true });
});

// Le canvas Phaser n'a besoin d'aucun geste natif. Le verrouiller directement
// empêche la loupe, la sélection et « Copier / Consulter » sur iOS sans bloquer
// les commandes tactiles HTML placées au-dessus.
const protectPhaserCanvas = () => {
  const canvas = game.canvas;
  if (!canvas || canvas.dataset.touchProtected === 'true') return;
  canvas.dataset.touchProtected = 'true';
  canvas.draggable = false;
  ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach((type) => {
    canvas.addEventListener(type, blockNativeGameGesture, { passive: false, capture: true });
  });
};
protectPhaserCanvas();

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
      <div class="mobile-control" data-code="ArrowUp" data-key="ArrowUp" data-hold="true" aria-label="Haut">▲</div>
      <div class="mobile-control" data-code="ArrowLeft" data-key="ArrowLeft" data-hold="true" aria-label="Gauche">◀</div>
      <div class="mobile-control" data-code="ArrowDown" data-key="ArrowDown" data-hold="true" aria-label="Bas">▼</div>
      <div class="mobile-control" data-code="ArrowRight" data-key="ArrowRight" data-hold="true" aria-label="Droite">▶</div>
    </div>
    <div class="mobile-actions">
      <div class="mobile-control" data-code="ShiftLeft" data-key="Shift" aria-label="Retour">B</div>
      <div class="mobile-control primary" data-code="Space" data-key=" " aria-label="Valider">A</div>
      <div class="mobile-control menu" data-code="Enter" data-key="Enter" aria-label="Menu">MENU</div>
    </div>`;

  const sendKey = (code, key, pressed) => window.postMessage({
    source: 'condamine', type: 'key-state', code, key, pressed
  }, '*');

  controls.querySelectorAll('.mobile-control').forEach((button) => {
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
    button.addEventListener('touchstart', (event) => {
      event.preventDefault();
      keepMobileGameActive();
      sendKey(button.dataset.code, button.dataset.key, true);
    }, { passive: false });
    button.addEventListener('touchmove', (event) => event.preventDefault(), { passive: false });
    button.addEventListener('touchend', (event) => {
      event.preventDefault();
      sendKey(button.dataset.code, button.dataset.key, false);
    }, { passive: false });
  });
  document.body.appendChild(controls);
};

// Une seule couche tactile, directement dans le jeu. Cette architecture évite
// les pertes de gestes Safari entre la page parente et l'iframe.
createMobileControls();
