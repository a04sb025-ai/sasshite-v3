import './style.css';
import { ElevatorStageController } from './game/elevator/ElevatorStageController';
import type { OutsideRoute } from './game/elevator/types';
import { ElevatorStageView } from './rendering/pixi/ElevatorStageView';

async function bootstrap(): Promise<void> {
  const host = document.querySelector<HTMLElement>('#app');
  if (!host) throw new Error('App host is missing');

  host.insertAdjacentHTML('beforeend', `
    <div class="controls" aria-label="エレベーター操作盤">
      <button class="elevator-button open" aria-label="開く" data-control="open"><span aria-hidden="true">◀│▶</span></button>
      <button class="elevator-button close" aria-label="閉じる" data-control="close"><span aria-hidden="true">▶│◀</span></button>
    </div>
    <button class="reset" aria-label="場面を最初から見る">↻</button>
  `);

  const controller = new ElevatorStageController(routeFromLocation());
  const view = new ElevatorStageView();
  await view.mount(host);

  const openButton = host.querySelector<HTMLButtonElement>('[data-control="open"]');
  const closeButton = host.querySelector<HTMLButtonElement>('[data-control="close"]');
  if (!openButton || !closeButton) throw new Error('Elevator controls are missing');

  const beginOpen = (event: PointerEvent): void => { event.preventDefault(); openButton.setPointerCapture(event.pointerId); controller.pressOpen(); };
  const endOpen = (event: PointerEvent): void => { event.preventDefault(); if (openButton.hasPointerCapture(event.pointerId)) openButton.releasePointerCapture(event.pointerId); controller.releaseOpen(); };
  openButton.addEventListener('pointerdown', beginOpen);
  openButton.addEventListener('pointerup', endOpen);
  openButton.addEventListener('pointercancel', endOpen);
  openButton.addEventListener('lostpointercapture', () => controller.releaseOpen());
  closeButton.addEventListener('pointerdown', (event) => { event.preventDefault(); controller.pressClose(); });
  host.querySelector('.reset')?.addEventListener('click', () => controller.reset(routeFromLocation()));

  let previous = performance.now();
  function frame(now: number): void {
    const delta = Math.min(50, now - previous); previous = now;
    view.render(controller.update(delta));
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
