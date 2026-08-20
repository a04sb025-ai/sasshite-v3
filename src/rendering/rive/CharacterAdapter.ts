import type { CharacterPose } from '../../game/elevator/types';

export interface CharacterAdapter {
  readonly assetStatus: 'development-placeholder' | 'rive-connected';
  update(pose: Partial<CharacterPose>, elapsedMs: number): void;
  destroy(): void;
}

/** Explicit seam for the future approved .riv rigs; this PoC does not claim missing assets exist. */
export class DevelopmentCharacterAdapter implements CharacterAdapter {
  readonly assetStatus = 'development-placeholder' as const;
  constructor(private readonly applyPose: (pose: Partial<CharacterPose>, elapsedMs: number) => void) {}
  update(pose: Partial<CharacterPose>, elapsedMs: number): void { this.applyPose(pose, elapsedMs); }
  destroy(): void { /* no runtime resource */ }
}
