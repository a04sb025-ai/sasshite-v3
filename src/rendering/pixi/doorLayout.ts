export interface DoorLayout {
  leftX: number;
  rightX: number;
  doorWidth: number;
  openingLeft: number;
  openingRight: number;
}

export interface VisibleDoorRegion {
  start: number;
  end: number;
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

/** Returns the portions of both panels visible inside the masked doorway. */
export function getVisibleDoorRegions(doorProgress: number): {
  left: VisibleDoorRegion;
  right: VisibleDoorRegion;
} {
  const layout = getDoorLayout(doorProgress);
  const visibleRegion = (start: number, end: number): VisibleDoorRegion => {
    const clippedStart = Math.max(layout.openingLeft, start);
    const clippedEnd = Math.min(layout.openingRight, end);
    return { start: clippedStart, end: Math.max(clippedStart, clippedEnd) };
  };
  return {
    left: visibleRegion(layout.leftX, layout.leftX + layout.doorWidth),
    right: visibleRegion(layout.rightX, layout.rightX + layout.doorWidth),
  };
}
