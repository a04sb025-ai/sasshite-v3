import { Application, Assets, Container, Graphics, Sprite, Texture } from 'pixi.js';
import type { ElevatorStageSnapshot } from '../../game/elevator/types';
import { getDoorLayout } from './doorLayout';

const WIDTH = 1024;
const HEIGHT = 1536;

export class ElevatorStageView {
  private readonly app = new Application();
  private readonly scene = new Container();
  private readonly leftDoor = new Graphics();
  private readonly rightDoor = new Graphics();

  async mount(host: HTMLElement): Promise<void> {
    await this.app.init({ width: WIDTH, height: HEIGHT, antialias: true, background: '#252629', resizeTo: host, resolution: Math.min(devicePixelRatio, 2), autoDensity: true });
    this.app.canvas.setAttribute('aria-hidden', 'true');
    host.prepend(this.app.canvas);
    this.app.stage.addChild(this.scene);
    const fitScene = (): void => {
      const scale = Math.min(this.app.screen.width / WIDTH, this.app.screen.height / HEIGHT);
      this.scene.scale.set(scale);
      this.scene.position.set((this.app.screen.width - WIDTH * scale) / 2, (this.app.screen.height - HEIGHT * scale) / 2);
    };
    this.app.renderer.on('resize', fitScene); fitScene();
    const source = await Assets.load<Texture>('/assets/stages/elevator/elevator-stage-v1-approved.png');
    const background = new Sprite(source); background.width = WIDTH; background.height = HEIGHT; this.scene.addChild(background);

    this.drawDoor(this.leftDoor, true); this.drawDoor(this.rightDoor, false);
    this.scene.addChild(this.leftDoor, this.rightDoor);
  }

  render(snapshot: ElevatorStageSnapshot): void {
    const layout = getDoorLayout(snapshot.doorProgress);
    this.leftDoor.x = layout.leftX;
    this.rightDoor.x = layout.rightX;
  }

  destroy(): void { this.app.destroy(true); }

  private drawDoor(door: Graphics, left: boolean): void {
    const { doorWidth } = getDoorLayout(0);
    door.rect(0, 140, doorWidth, 1095).fill({ color: 0xa6a09c, alpha: 0.98 });
    door.rect(left ? doorWidth - 27 : 0, 140, 27, 1095).fill({ color: 0x5d5b59, alpha: 0.95 });
    door.rect(0, 140, doorWidth, 1095).stroke({ color: 0x393939, width: 3, alpha: 0.8 });
  }
}
