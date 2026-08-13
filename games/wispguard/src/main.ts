import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scenes/scene-keys';
import { PreloadScene } from './scenes/preload-scene';
import { GameScene } from './scenes/game-scene';
import { UiScene } from './scenes/ui-scene';
import { GameOverScene } from './scenes/game-over-scene';

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  pixelArt: true,
  roundPixels: true,
  scale: {
    parent: 'game-container',
    width: 256,
    height: 224,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    // Agrandit la résolution pixel-art de 256 × 224 autant que possible,
    // tout en conservant le ratio du jeu dans la liseuse plein écran.
    mode: Phaser.Scale.FIT,
  },
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false,
    },
  },
};

const game = new Phaser.Game(gameConfig);

(window as Window & { condamineGrantBonus?: (bonus: string) => void }).condamineGrantBonus = (bonus: string): void => {
  const scene = game.scene.getScene(SCENE_KEYS.GAME_SCENE) as GameScene | undefined;
  scene?.applyEducationalBonus(bonus);
};

(window as Window & {
  condamineBeginSpritePlacement?: (dataUrl: string) => void;
}).condamineBeginSpritePlacement = (dataUrl: string): void => {
  const scene = game.scene.getScene(SCENE_KEYS.GAME_SCENE) as GameScene | undefined;
  scene?.beginBlockingSpritePlacement(dataUrl);
};

(window as Window & {
  condamineBeginAnimatedSpritePlacement?: (frames: string[]) => void;
}).condamineBeginAnimatedSpritePlacement = (frames: string[]): void => {
  const scene = game.scene.getScene(SCENE_KEYS.GAME_SCENE) as GameScene | undefined;
  scene?.beginAnimatedSpritePlacement(frames);
};

game.scene.add(SCENE_KEYS.PRELOAD_SCENE, PreloadScene);
game.scene.add(SCENE_KEYS.GAME_SCENE, GameScene);
game.scene.add(SCENE_KEYS.UI_SCENE, UiScene);
game.scene.add(SCENE_KEYS.GAME_OVER_SCENE, GameOverScene);
game.scene.start(SCENE_KEYS.PRELOAD_SCENE);

const createMobileControls = (): void => {
  const controls = document.createElement('div');
  controls.className = 'mobile-game-controls';
  controls.innerHTML = `
    <div class="mobile-dpad">
      <button data-code="ArrowUp" aria-label="Haut">▲</button>
      <button data-code="ArrowLeft" aria-label="Gauche">◀</button>
      <button data-code="ArrowDown" aria-label="Bas">▼</button>
      <button data-code="ArrowRight" aria-label="Droite">▶</button>
    </div>
    <div class="mobile-actions">
      <button class="attack" data-code="KeyZ" aria-label="Épée">Z</button>
      <button class="action" data-code="KeyX" aria-label="Prendre">X</button>
      <button class="wide" data-code="Enter" aria-label="Valider">OK</button>
      <button class="wide" data-code="Space" aria-label="Question">★</button>
    </div>`;
  controls.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
    const send = (pressed: boolean): void => window.postMessage({
      source: 'condamine', type: 'key-state', code: button.dataset.code, pressed
    }, '*');
    const release = (event: PointerEvent): void => {
      event.preventDefault();
      send(false);
    };
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      button.setPointerCapture?.(event.pointerId);
      send(true);
    });
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('contextmenu', (event) => event.preventDefault());
  });
  controls.addEventListener('contextmenu', (event) => event.preventDefault());
  controls.addEventListener('selectstart', (event) => event.preventDefault());
  document.body.appendChild(controls);
};

createMobileControls();
document.getElementById('game-container')?.addEventListener('contextmenu', (event) => event.preventDefault());
