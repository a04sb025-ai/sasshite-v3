import './style.css';
import { ElevatorStageController } from './game/elevator/ElevatorStageController';
import type { OutsideRoute } from './game/elevator/types';
import { ElevatorStageView } from './rendering/pixi/ElevatorStageView';

async function bootstrap(): Promise<void> {
  const host = document.querySelector<HTMLElement>('#app');
  if (!host) throw new Error('App host is missing');

  const publicAssetUrl = (path: string): string => `${import.meta.env.BASE_URL}${path}`;
  host.style.setProperty('--button-default-image', `url("${publicAssetUrl('assets/stages/elevator/ui/button-default.svg')}")`);
  host.style.setProperty('--button-active-image', `url("${publicAssetUrl('assets/stages/elevator/ui/button-active.svg')}")`);
  host.style.setProperty('--button-disabled-image', `url("${publicAssetUrl('assets/stages/elevator/ui/button-disabled.svg')}")`);

  host.insertAdjacentHTML('beforeend', `
    <div class="stage-label" aria-hidden="true">もう一人、来る？</div>
    <div class="controls" aria-label="どうする？">
      <button class="elevator-button open" data-control="open"><span class="control-icon" aria-hidden="true">◀│▶</span><span>開ける</span></button>
      <button class="elevator-button close" data-control="close"><span class="control-icon" aria-hidden="true">▶│◀</span><span>閉める</span></button>
      <button class="elevator-button wait" data-control="wait"><span class="control-icon" aria-hidden="true">…</span><span>様子を見る</span></button>
    </div>
    <button class="reset" aria-label="場面を最初から見る">↻</button>
  `);

  const controller = new ElevatorStageController(routeFromLocation());
  const view = new ElevatorStageView();
  await view.mount(host);

  const control = (name: string): HTMLButtonElement => {
    const button = host.querySelector<HTMLButtonElement>(`[data-control="${name}"]`);
    if (!button) throw new Error(`Elevator control is missing: ${name}`);
    return button;
  };
  const openButton = control('open');
  const closeButton = control('close');
  const waitButton = control('wait');

  const beginOpen = (event: PointerEvent): void => { event.preventDefault(); openButton.setPointerCapture(event.pointerId); controller.pressOpen(); };
  const endOpen = (event: PointerEvent): void => { event.preventDefault(); if (openButton.hasPointerCapture(event.pointerId)) openButton.releasePointerCapture(event.pointerId); controller.releaseOpen(); };
  openButton.addEventListener('pointerdown', beginOpen);
  openButton.addEventListener('pointerup', endOpen);
  openButton.addEventListener('pointercancel', endOpen);
  openButton.addEventListener('lostpointercapture', () => controller.releaseOpen());
  closeButton.addEventListener('pointerdown', (event) => { event.preventDefault(); controller.pressClose(); });
  waitButton.addEventListener('pointerdown', (event) => { event.preventDefault(); controller.pressWait(); });
  host.querySelector('.reset')?.addEventListener('click', () => controller.reset(routeFromLocation()));

  let previous = performance.now();
  function frame(now: number): void {
    const delta = Math.min(50, now - previous); previous = now;
    const snapshot = controller.update(delta);
    view.render(snapshot);
    openButton.disabled = snapshot.doorState === 'closed';
    closeButton.disabled = snapshot.doorState === 'closed';
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  if (import.meta.env.DEV) Object.assign(window, { elevatorStage: controller });
}

bootstrap().catch((error: unknown) => {
  console.error(error);
});

function routeFromLocation(): OutsideRoute {
  return new URLSearchParams(location.search).get('route') === 'elevator' ? 'elevator' : 'side';
}
