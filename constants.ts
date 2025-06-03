export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const TETROMINO_TYPES = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'] as const;

export type TetrominoKey = typeof TETROMINO_TYPES[number];

export const TETROMINOES: Record<TetrominoKey, { shape: number[][]; color: string }> = {
  I: {
    shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    color: 'cyan',
  },
  J: {
    shape: [[2, 0, 0], [2, 2, 2], [0, 0, 0]],
    color: 'blue',
  },
  L: {
    shape: [[0, 0, 3], [3, 3, 3], [0, 0, 0]],
    color: 'orange',
  },
  O: {
    shape: [[4, 4], [4, 4]],
    color: 'yellow',
  },
  S: {
    shape: [[0, 5, 5], [5, 5, 0], [0, 0, 0]],
    color: 'green',
  },
  T: {
    shape: [[0, 6, 0], [6, 6, 6], [0, 0, 0]],
    color: 'purple',
  },
  Z: {
    shape: [[7, 7, 0], [0, 7, 7], [0, 0, 0]],
    color: 'red',
  },
};

export const INITIAL_SPEED = 1000; 
export const SPEED_DECREMENT = 75; 
export const MIN_SPEED = 100; 
export const LINES_PER_LEVEL = 10;

export const SCORE_POINTS = {
  SINGLE: 40,
  DOUBLE: 100,
  TRIPLE: 300,
  TETRIS: 1200,
  SOFT_DROP: 1,
  HARD_DROP: 2,
  LINE_CLEAR: [40, 100, 300, 1200]
};