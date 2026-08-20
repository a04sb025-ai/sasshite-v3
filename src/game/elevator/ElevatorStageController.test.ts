import { describe, expect, it } from 'vitest';
import { ELEVATOR_CONFIG } from './config';
import { ElevatorStageController } from './ElevatorStageController';
import { getDoorLayout } from '../../rendering/pixi/doorLayout';

describe('ElevatorStageController', () => {
  it('naturally begins closing after the open wait without input', () => {
    const stage = new ElevatorStageController();
    stage.update(ELEVATOR_CONFIG.openHoldMs + ELEVATOR_CONFIG.openGraceMs + 1);
    expect(stage.snapshot().doorState).toBe('closing_soft');
  });
  it('close skips the grace period but does not close instantly', () => {
    const stage = new ElevatorStageController(); stage.pressClose();
    expect(stage.snapshot()).toMatchObject({ doorState: 'closing_soft', doorProgress: 0 });
  });
  it('can reverse a partially closed door, including commit', () => {
    const stage = new ElevatorStageController(); stage.pressClose(); stage.update(1500); stage.pressOpen();
    expect(stage.snapshot().doorState).toBe('opening'); stage.update(1000);
    expect(stage.snapshot().doorProgress).toBe(0);
  });
  it('no-input play reaches a normal closed state', () => {
    const stage = new ElevatorStageController(); stage.update(5000);
    expect(stage.snapshot().doorState).toBe('closed');
  });
  it('emits route cues before the side-route commitment', () => {
    const stage = new ElevatorStageController('side'); stage.update(5000);
    const types = stage.getEvents().map(event => event.type);
    const committed = types.indexOf('outside_npc_committed');
    expect(types.indexOf('outside_npc_gaze')).toBeLessThan(committed);
    expect(types.indexOf('outside_npc_head')).toBeLessThan(committed);
    expect(types.indexOf('outside_npc_body')).toBeLessThan(committed);
    expect(types.indexOf('outside_npc_shift')).toBeLessThan(committed);
  });
  it('keeps event times monotonic and resets completely', () => {
    const stage = new ElevatorStageController(); stage.update(1000); stage.pressClose(); stage.update(100); stage.pressOpen();
    const times = stage.getEvents().map(event => event.atMs);
    expect(times).toEqual([...times].sort((a, b) => a - b));
    stage.reset(); expect(stage.snapshot()).toMatchObject({ elapsedMs: 0, doorState: 'open_hold', doorProgress: 0 });
    expect(stage.getEvents()).toEqual([{ type: 'stage_started', atMs: 0 }]);
  });
  it('maps progress 0 to fully open and progress 1 to center-closed doors', () => {
    const open = getDoorLayout(0);
    expect(open.leftX + open.doorWidth).toBe(open.openingLeft);
    expect(open.rightX).toBe(open.openingRight);
    const closed = getDoorLayout(1);
    expect(closed.leftX + closed.doorWidth).toBe(closed.rightX);
    expect(closed.rightX).toBe((closed.openingLeft + closed.openingRight) / 2);
  });
  it('never lets the left and right doors cross', () => {
    for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
      const layout = getDoorLayout(progress);
      expect(layout.leftX + layout.doorWidth).toBeLessThanOrEqual(layout.rightX);
    }
  });
  it('does not board an elevator-route NPC through a closed door', () => {
    const stage = new ElevatorStageController('elevator'); stage.pressClose(); stage.update(6000);
    expect(stage.snapshot()).toMatchObject({ doorState: 'closed', outsideCue: 'gaze' });
    expect(stage.getEvents().some(event => event.type === 'outside_npc_boarded')).toBe(false);
  });
  it('boards after a closing door is reopened enough to pass', () => {
    const stage = new ElevatorStageController('elevator'); stage.pressOpen();
    stage.update(4900); stage.releaseOpen(); stage.pressClose(); stage.update(700);
    expect(stage.snapshot().outsideCue).toBe('gaze');
    stage.pressOpen(); stage.update(300);
    expect(stage.snapshot().outsideCue).toBe('boarded');
    expect(stage.getEvents().some(event => event.type === 'outside_npc_boarded')).toBe(true);
  });
});
