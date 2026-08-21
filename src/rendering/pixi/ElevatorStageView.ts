import { Application, Assets, Container, Graphics, Sprite, Texture } from 'pixi.js';
import approvedElevatorStageUrl from '../../../docs/art/references/stages/elevator/elevator-stage-v1-approved.png?url';
import type { ElevatorStageSnapshot } from '../../game/elevator/types';
import { getDoorLayout } from './doorLayout';

const WIDTH = 1024;
const HEIGHT = 1536;

const publicAssetUrl = (path: string): string => `${import.meta.env.BASE_URL}${path}`;

export class ElevatorStageView {
  private readonly app = new Application();
  private readonly scene = new Container();
  private readonly doors = new Container();
  private readonly doorMask = new Graphics();
  private readonly leftDoor = new Sprite();
  private readonly rightDoor = new Sprite();

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
    const [source, leftDoorTexture, rightDoorTexture] = await Promise.all([
      Assets.load<Texture>(approvedElevatorStageUrl),
      Assets.load<Texture>(publicAssetUrl('assets/stages/elevator/doors/door-left.svg')),
      Assets.load<Texture>(publicAssetUrl('assets/stages/elevator/doors/door-right.svg')),
    ]);
    const background = new Sprite(source); background.width = WIDTH; background.height = HEIGHT; this.scene.addChild(background);

    this.leftDoor.texture = leftDoorTexture; this.rightDoor.texture = rightDoorTexture;
    const { doorWidth } = getDoorLayout(0);
    for (const door of [this.leftDoor, this.rightDoor]) { door.width = doorWidth; door.height = 1095; door.y = 140; }
    const { openingLeft, openingRight } = getDoorLayout(0);
    this.doorMask.rect(openingLeft, 140, openingRight - openingLeft, 1095).fill(0xffffff);
    this.doors.addChild(this.leftDoor, this.rightDoor);
    this.doors.mask = this.doorMask;
    this.scene.addChild(this.doors, this.doorMask);
  }

  render(snapshot: ElevatorStageSnapshot): void {
    const layout = getDoorLayout(snapshot.doorProgress);
    this.leftDoor.x = layout.leftX;
    this.rightDoor.x = layout.rightX;
  }

  destroy(): void { this.app.destroy(true); }
}
