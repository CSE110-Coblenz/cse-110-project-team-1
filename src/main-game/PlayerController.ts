import { PlayerModel } from 'src/main-game/PlayerModel';
import { PlayerView } from 'src/main-game/PlayerView';
import { MapModel } from 'src/main-game/MapModel';
import { MapController } from 'src/main-game/MapController';
import { EntityController } from 'src/main-game/EntityController';

// key sets used for input handling
const ATTACK_KEYS = new Set([' ', 'Space']);
const ARROW_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
const WASD_KEYS = new Set(['w', 'a', 's', 'd']);
const MOD_KEYS = new Set(['Shift']);
const VALID_KEYS = new Set<string>([...ARROW_KEYS, ...WASD_KEYS, ...MOD_KEYS, ...ATTACK_KEYS]);

export class PlayerController extends EntityController {
	private mapModel: MapModel;
	private mapController: MapController;
	private keyDownHandler: ((e: KeyboardEvent) => void) | null = null;
	private keyUpHandler: ((e: KeyboardEvent) => void) | null = null;
	private pressedKeys: Set<string> = new Set();
	private animationFrameId: number | null = null;
	private renderCallback: (() => void) | null = null;
	private attackRequested = false;
	protected attackCooldown = 0.25;

	constructor(
		model: PlayerModel,
		view: PlayerView,
		mapModel: MapModel,
		mapController: MapController,
	) {
		super(model, view);
		this.mapModel = mapModel;
		this.mapController = mapController;
	}

	public attachKeyboardListeners(renderCb: () => void) {
		if (this.keyDownHandler) return; // already attached
		this.renderCallback = renderCb;

		this.keyDownHandler = (e: KeyboardEvent) => {
			const key = e.key;
			// normalize single-character keys to lowercase for WASD
			const normalized = key.length === 1 ? key.toLowerCase() : key;
			if (!VALID_KEYS.has(normalized)) return;
			this.pressedKeys.add(normalized);
			if (ARROW_KEYS.has(normalized)) e.preventDefault();
			if (ATTACK_KEYS.has(normalized)) {
				e.preventDefault(); // space scroll prevention
				this.attackRequested = true;
				return; // do NOT add to pressedKeys — we want one-shot action
			}
		};

		this.keyUpHandler = (e: KeyboardEvent) => {
			const key = e.key;
			const normalized = key.length === 1 ? key.toLowerCase() : key;
			this.pressedKeys.delete(normalized);
		};

		window.addEventListener('keydown', this.keyDownHandler);
		window.addEventListener('keyup', this.keyUpHandler);
	}

	public updateFromInput(deltaSec: number) {
		let dirX = 0,
			dirY = 0;

		if (this.model.attackCooldown > 0) this.model.attackCooldown -= deltaSec;
		if (this.attackRequested) {
			const surrounding = this.mapModel.getEntitiesInArea(
				this.model.getID(),
				this.model.getPosition(),
				10,
			);
			if (surrounding.length != 0) {
				this.model.tryAttack(surrounding[0]);
			}
			this.attackRequested = false;
		}

		if (this.pressedKeys.has('ArrowUp') || this.pressedKeys.has('w')) dirY -= 1;
		if (this.pressedKeys.has('ArrowDown') || this.pressedKeys.has('s')) dirY += 1;
		if (this.pressedKeys.has('ArrowLeft') || this.pressedKeys.has('a')) dirX -= 1;
		if (this.pressedKeys.has('ArrowRight') || this.pressedKeys.has('d')) dirX += 1;

		if (dirX === 0 && dirY === 0) return;

		const mag = Math.hypot(dirX, dirY) || 1;
		dirX /= mag;
		dirY /= mag;

		const speed = this.model.getSpeed();
		const sprint = this.pressedKeys.has('Shift');
		const effectiveSpeed = sprint ? speed * 1.8 : speed;
		const deltaX = dirX * effectiveSpeed * deltaSec;
		const deltaY = dirY * effectiveSpeed * deltaSec;

		if (this.getModel().tryMove(this.mapModel, deltaX, deltaY)) {
			this.mapController.centerOn(this.model.getPosition());
		}
	}

	public detachKeyboardListeners() {
		if (!this.keyDownHandler) return;
		window.removeEventListener('keydown', this.keyDownHandler);
		if (this.keyUpHandler) window.removeEventListener('keyup', this.keyUpHandler);
		this.keyDownHandler = null;
		this.keyUpHandler = null;
		this.pressedKeys.clear();
		if (this.animationFrameId != null) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
		this.renderCallback = null;
	}
}
