export interface DoorLayout {
  leftX: number;
  rightX: number;
  doorWidth: number;
  openingLeft: number;
  openingRight: number;
}

const OPENING_LEFT = 255;
const OPENING_RIGHT = 769;
const DOOR_WIDTH = (OPENING_RIGHT - OPENING_LEFT) / 2;

/**
 * Returns non-overlapping door positions where 0 is fully open and 1 is closed.
 * Each panel travels from outside the opening to its own half of the opening.
 */
export function getDoorLayout(doorProgress: number): DoorLayout {
  const progress = Math.max(0, Math.min(1, doorProgress));
  return {
    leftX: OPENING_LEFT - DOOR_WIDTH + DOOR_WIDTH * progress,
    rightX: OPENING_RIGHT - DOOR_WIDTH * progress,
    doorWidth: DOOR_WIDTH,
    openingLeft: OPENING_LEFT,
    openingRight: OPENING_RIGHT,
  };
}
