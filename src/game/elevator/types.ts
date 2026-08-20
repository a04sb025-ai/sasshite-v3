export type DoorState = 'open_hold' | 'open_grace' | 'closing_soft' | 'closing_commit' | 'opening' | 'closed';
export type OutsideRoute = 'elevator' | 'side';
export type OutsideCue = 'approach' | 'gaze' | 'head' | 'body' | 'shift' | 'committed' | 'boarded';

export interface CharacterPose {
  gazeX: number;
  headTurn: number;
  bodyTurn: number;
  walkX: number;
  walkY: number;
  speed: number;
  tension: number;
}

export interface ElevatorStageSnapshot {
  elapsedMs: number;
  doorState: DoorState;
  doorProgress: number;
  outsideRoute: OutsideRoute;
  outsideCue: OutsideCue;
  outside: CharacterPose;
  inside: Pick<CharacterPose, 'gazeX' | 'bodyTurn' | 'tension'>;
}

export type ElevatorStageEvent = {
  type: string;
  atMs: number;
  doorProgress?: number;
  level?: number;
};
