import { ELEVATOR_CONFIG } from './config';
import type { DoorState, ElevatorStageEvent, ElevatorStageSnapshot, OutsideCue, OutsideRoute } from './types';

const cueTimeline: ReadonlyArray<[number, OutsideCue]> = [
  [0, 'approach'], [1200, 'gaze'], [2100, 'head'], [3000, 'body'], [3900, 'shift'], [4800, 'committed'],
];
const ELEVATOR_ARRIVAL_MS = 5600;
const BOARDING_MAX_DOOR_PROGRESS = 0.35;

export class ElevatorStageController {
  private elapsedMs = 0;
  private stateElapsedMs = 0;
  private doorState: DoorState = 'open_hold';
  private doorProgress = 0;
  private openPressed = false;
  private route: OutsideRoute;
  private events: ElevatorStageEvent[] = [];
  private outsideBoarded = false;

  constructor(route: OutsideRoute = 'side') {
    this.route = route;
    this.emit('stage_started');
  }

  reset(route: OutsideRoute = this.route): void {
    this.elapsedMs = 0; this.stateElapsedMs = 0; this.doorState = 'open_hold'; this.doorProgress = 0;
    this.openPressed = false; this.route = route; this.events = []; this.outsideBoarded = false; this.emit('stage_started');
  }

  pressOpen(): void {
    if (this.doorState === 'closed') return;
    this.openPressed = true;
    this.emit('open_pressed', { doorProgress: this.doorProgress });
    if (this.doorProgress > 0 && this.doorState !== 'opening') {
      this.setDoorState('opening');
      this.emit('door_reopened', { doorProgress: this.doorProgress });
    } else if (this.doorProgress === 0) this.setDoorState('open_hold');
  }

  releaseOpen(): void {
    if (!this.openPressed) return;
    this.openPressed = false;
    this.emit('open_released', { doorProgress: this.doorProgress });
    if (this.doorState === 'open_hold') this.setDoorState('open_grace');
  }

  pressClose(): void {
    if (this.doorState === 'closed') return;
    this.openPressed = false;
    this.emit('close_pressed', { doorProgress: this.doorProgress });
    this.startClosing();
  }

  update(deltaMs: number): ElevatorStageSnapshot {
    if (deltaMs < 0) throw new Error('deltaMs must be non-negative');
    let remaining = deltaMs;
    while (remaining > 0) {
      const step = Math.min(remaining, 16);
      const before = this.elapsedMs;
      this.elapsedMs += step; this.stateElapsedMs += step;
      this.updateDoor(step);
      this.updateBoarding();
      this.emitCrossedNpcCues(before, this.elapsedMs);
      remaining -= step;
    }
    return this.snapshot();
  }

  snapshot(): ElevatorStageSnapshot {
    const cue = this.currentCue();
    const side = this.route === 'side';
    const cueIndex = cueTimeline.findIndex(([, value]) => value === cue);
    const turn = side ? Math.max(0, cueIndex - 1) / 4 : 0;
    const pressure = Math.min(1, this.elapsedMs / 7000 + this.doorProgress * 0.35);
    return {
      elapsedMs: this.elapsedMs, doorState: this.doorState, doorProgress: this.doorProgress,
      outsideRoute: this.route, outsideCue: cue,
      outside: { gazeX: side && cueIndex >= 1 ? 1 : -0.2, headTurn: turn, bodyTurn: Math.max(0, turn - 0.2), walkX: side ? Math.max(0, turn - 0.45) : 0, walkY: Math.min(1, this.elapsedMs / 6500), speed: this.doorProgress > 0 && !side ? 1 : 0.55, tension: this.doorProgress },
      inside: { gazeX: this.elapsedMs >= ELEVATOR_CONFIG.insideGlanceMs ? 0.55 : 0, bodyTurn: this.elapsedMs >= ELEVATOR_CONFIG.insideShiftMs ? 0.18 : 0, tension: pressure * 0.35 },
    };
  }

  getEvents(): readonly ElevatorStageEvent[] { return this.events; }

  private updateDoor(deltaMs: number): void {
    if (this.openPressed && this.doorProgress === 0) { this.setDoorState('open_hold'); return; }
    switch (this.doorState) {
      case 'open_hold': if (this.stateElapsedMs >= ELEVATOR_CONFIG.openHoldMs) this.setDoorState('open_grace'); break;
      case 'open_grace': if (this.stateElapsedMs >= ELEVATOR_CONFIG.openGraceMs) this.startClosing(); break;
      case 'closing_soft':
        this.doorProgress = Math.min(ELEVATOR_CONFIG.commitProgress, this.doorProgress + deltaMs / ELEVATOR_CONFIG.closeSoftMs * ELEVATOR_CONFIG.commitProgress);
        if (this.doorProgress >= ELEVATOR_CONFIG.commitProgress) { this.setDoorState('closing_commit'); this.emit('door_closing_commit_started'); }
        break;
      case 'closing_commit':
        this.doorProgress = Math.min(1, this.doorProgress + deltaMs / ELEVATOR_CONFIG.closeCommitMs * (1 - ELEVATOR_CONFIG.commitProgress));
        if (this.doorProgress >= 1) { this.setDoorState('closed'); this.emit('door_closed'); }
        break;
      case 'opening':
        this.doorProgress = Math.max(0, this.doorProgress - deltaMs / ELEVATOR_CONFIG.openingMs);
        if (this.doorProgress <= 0) this.setDoorState(this.openPressed ? 'open_hold' : 'open_grace');
        break;
      case 'closed': break;
    }
  }

  private startClosing(): void {
    if (this.doorState === 'closing_soft' || this.doorState === 'closing_commit') return;
    this.setDoorState(this.doorProgress >= ELEVATOR_CONFIG.commitProgress ? 'closing_commit' : 'closing_soft');
    this.emit('door_closing_started');
  }

  private setDoorState(state: DoorState): void { if (state !== this.doorState) { this.doorState = state; this.stateElapsedMs = 0; } }
  private currentCue(): OutsideCue {
    if (this.route === 'elevator') return this.outsideBoarded ? 'boarded' : this.elapsedMs >= 3600 ? 'gaze' : 'approach';
    let cue: OutsideCue = 'approach'; for (const [at, value] of cueTimeline) if (this.elapsedMs >= at) cue = value; return cue;
  }
  private emitCrossedNpcCues(from: number, to: number): void {
    if (this.route === 'side') for (const [at, cue] of cueTimeline.slice(1)) if (from < at && to >= at) this.emit(`outside_npc_${cue}`);
    if (from < ELEVATOR_CONFIG.insideGlanceMs && to >= ELEVATOR_CONFIG.insideGlanceMs) this.emit('inside_npc_reaction', { level: 1 });
    if (from < ELEVATOR_CONFIG.insideShiftMs && to >= ELEVATOR_CONFIG.insideShiftMs) this.emit('inside_npc_reaction', { level: 2 });
  }
  private updateBoarding(): void {
    if (this.route !== 'elevator' || this.outsideBoarded || this.elapsedMs < ELEVATOR_ARRIVAL_MS) return;
    const canPass = this.doorState !== 'closed' && this.doorProgress <= BOARDING_MAX_DOOR_PROGRESS;
    if (canPass) { this.outsideBoarded = true; this.emit('outside_npc_boarded'); }
  }
  private emit(type: string, extra: Omit<ElevatorStageEvent, 'type' | 'atMs'> = {}): void { this.events.push({ type, atMs: this.elapsedMs, ...extra }); }
}
