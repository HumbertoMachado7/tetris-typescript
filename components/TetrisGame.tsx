import React, { useState, useEffect, useCallback, useRef } from 'react';
import Board from './Board';
import NextPiecePreview from './NextPiecePreview';
import ScoreDisplay from './ScoreDisplay';
import GameControls from './GameControls';
import GameOverModal from './GameOverModal';
import { BoardShape, Piece, CellValue } from '../types';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  TETROMINOES,
  TETROMINO_TYPES,
  INITIAL_SPEED,
  SPEED_DECREMENT,
  MIN_SPEED,
  LINES_PER_LEVEL,
  SCORE_POINTS
} from '../constants';
import { useGameSounds } from '../hooks/useGameSounds';

const createEmptyBoard = (): BoardShape =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));

const getRandomPiece = (): Piece => {
  const type = TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];
  const tetromino = TETROMINOES[type];
  return {
    x: Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2),
    y: 0,
    shape: tetromino.shape,
    color: tetromino.color,
  };
};

const TetrisGame: React.FC = () => {
  const [board, setBoard] = useState<BoardShape>(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<Piece | null>(() => getRandomPiece());
  const [score, setScore] = useState(0);
  const [linesCleared, setLinesCleared] = useState(0);
  const [level, setLevel] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(INITIAL_SPEED);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameLoopTimeoutRef = useRef<number | null>(null);

  const { 
    playMoveSound, playRotateSound, playLineClearSound, 
    playDropSound, playHardDropSound, playGameOverSound, playPauseSound 
  } = useGameSounds();

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);
  const minSwipeDistance = 50;

  const handleGameOver = useCallback(() => {
    if (!isGameOver) {
      setIsGameOver(true);
      if (gameLoopTimeoutRef.current) {
        clearTimeout(gameLoopTimeoutRef.current);
      }
      playGameOverSound();
    }
  }, [isGameOver, playGameOverSound]);

  const checkCollision = useCallback((piece: Piece, boardToCheck: BoardShape): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] !== 0) {
          const newY = piece.y + y;
          const newX = piece.x + x;
          if (
            newY >= BOARD_HEIGHT ||
            newX < 0 ||
            newX >= BOARD_WIDTH ||
            (boardToCheck[newY] && boardToCheck[newY][newX] !== 0)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const spawnNewPiece = useCallback(() => {
    if (isGameOver) return; 
    const pieceToSpawn = nextPiece || getRandomPiece();
    setNextPiece(getRandomPiece());
    setCurrentPiece(pieceToSpawn);
    if (checkCollision(pieceToSpawn, board)) {
      handleGameOver();
    }
  }, [nextPiece, board, checkCollision, handleGameOver, isGameOver]);

  const lockPiece = useCallback(() => {
    if (!currentPiece || isGameOver) return; 
    const newBoard = board.map(row => [...row]);
    let piecePartOutsideTop = false;
    currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const boardY = currentPiece.y + y;
          const boardX = currentPiece.x + x;
          if (boardY < 0) { 
            piecePartOutsideTop = true;
          }
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >=0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = currentPiece.color as CellValue;
          }
        }
      });
    });

    if (piecePartOutsideTop) {
      handleGameOver();
      setBoard(newBoard); 
      return;
    }
    
    let linesToClear = 0;
    for (let y = newBoard.length - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell !== 0)) {
        newBoard.splice(y, 1);
        newBoard.unshift(Array(BOARD_WIDTH).fill(0));
        linesToClear++;
        y++; 
      }
    }

    if (linesToClear > 0) {
      playLineClearSound();
      setLinesCleared(prev => prev + linesToClear);
      const pointsPerLine = SCORE_POINTS.LINE_CLEAR || [40, 100, 300, 1200];
      const pointsEarned = pointsPerLine[linesToClear - 1] || pointsPerLine[pointsPerLine.length -1];
      setScore(prev => prev + pointsEarned * (level + 1));
    }
    
    setBoard(newBoard);
    spawnNewPiece();
  }, [currentPiece, board, spawnNewPiece, level, playLineClearSound, handleGameOver, isGameOver, SCORE_POINTS.LINE_CLEAR]);

  const movePiece = useCallback((deltaX: number, deltaY: number): boolean => {
    if (!currentPiece || isPaused || isGameOver) return false;
    const newPiece = { ...currentPiece, x: currentPiece.x + deltaX, y: currentPiece.y + deltaY };
    if (!checkCollision(newPiece, board)) {
      setCurrentPiece(newPiece);
      if (deltaY > 0) playDropSound(); else playMoveSound();
      return true;
    } else if (deltaY > 0) {
      lockPiece();
    }
    return false;
  }, [currentPiece, isPaused, isGameOver, checkCollision, board, lockPiece, playDropSound, playMoveSound]);

  const rotatePiece = useCallback(() => {
    if (!currentPiece || isPaused || isGameOver) return;
    const originalShape = currentPiece.shape;
    const newShape = originalShape[0].map((_, colIndex) =>
      originalShape.map(row => row[colIndex]).reverse()
    );
    const newPieceBase = { ...currentPiece, shape: newShape };
    const kickOffsets = [0, 1, -1, 2, -2]; 
    for (const offset of kickOffsets) {
      const kickedPiece = { ...newPieceBase, x: newPieceBase.x + offset };
      if (!checkCollision(kickedPiece, board)) {
        setCurrentPiece(kickedPiece);
        playRotateSound();
        return;
      }
    }
  }, [currentPiece, isPaused, isGameOver, checkCollision, board, playRotateSound]);
  
  const hardDrop = useCallback(() => {
    if (!currentPiece || isPaused || isGameOver) return;
    let pieceToDrop = {...currentPiece};
    while (!checkCollision({...pieceToDrop, y: pieceToDrop.y + 1}, board)) {
      pieceToDrop.y += 1;
    }
    playHardDropSound();
    setCurrentPiece(pieceToDrop);
    lockPiece(); 
  }, [currentPiece, isPaused, isGameOver, checkCollision, board, lockPiece, playHardDropSound]);

  const startGame = useCallback(() => {
    if (gameLoopTimeoutRef.current) {
      clearTimeout(gameLoopTimeoutRef.current);
    }
    setBoard(createEmptyBoard());
    setCurrentPiece(null); 
    setNextPiece(getRandomPiece()); 
    setScore(0);
    setLinesCleared(0);
    setLevel(0);
    setGameSpeed(INITIAL_SPEED);
    setIsGameOver(false); 
    setIsPaused(false);
    if(gameContainerRef.current) gameContainerRef.current.focus();
  }, []); 

  const handleRestart = useCallback(() => {
    startGame();
  }, [startGame]);

  useEffect(() => {
    if (!isGameOver && !currentPiece && nextPiece) {
      spawnNewPiece();
    }
  }, [isGameOver, currentPiece, nextPiece, spawnNewPiece]);

  const togglePause = useCallback(() => {
    if (isGameOver) return; 
    setIsPaused(prev => {
      const newPausedState = !prev;
      if (!newPausedState && gameContainerRef.current) { 
          gameContainerRef.current.focus();
      }
      playPauseSound();
      return newPausedState;
    });
  }, [isGameOver, playPauseSound]);

  useEffect(() => { 
    if (isGameOver || isPaused || !currentPiece) {
      if (gameLoopTimeoutRef.current) clearTimeout(gameLoopTimeoutRef.current);
      return;
    }
    gameLoopTimeoutRef.current = window.setTimeout(() => {
      movePiece(0, 1);
    }, gameSpeed);
    return () => {
      if (gameLoopTimeoutRef.current) clearTimeout(gameLoopTimeoutRef.current);
    };
  }, [currentPiece, gameSpeed, isGameOver, isPaused, movePiece]);

  useEffect(() => { 
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === 'r') {
        event.preventDefault();
        handleRestart();
        return;
      }
      if (key === 'p') {
        event.preventDefault();
        togglePause();
        return;
      }
      if (isGameOver || isPaused) return;
      let actionTaken = false;
      switch (key) {
        case 'arrowleft': case 'a': movePiece(-1, 0); actionTaken = true; break;
        case 'arrowright': case 'd': movePiece(1, 0); actionTaken = true; break;
        case 'arrowdown': case 's': movePiece(0, 1); actionTaken = true; break;
        case 'arrowup': case 'w': rotatePiece(); actionTaken = true; break;
        case ' ': hardDrop(); actionTaken = true; break;
      }
      if (actionTaken) {
        event.preventDefault(); 
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isGameOver, isPaused, movePiece, rotatePiece, hardDrop, togglePause, handleRestart]);

  useEffect(() => { 
    if (linesCleared >= LINES_PER_LEVEL) {
      const numLevelsUp = Math.floor(linesCleared / LINES_PER_LEVEL);
      const newLevel = level + numLevelsUp;
      setLevel(newLevel);
      setLinesCleared(prev => prev % LINES_PER_LEVEL);
      setGameSpeed(Math.max(MIN_SPEED, INITIAL_SPEED - newLevel * SPEED_DECREMENT));
    }
  }, [linesCleared, level]);

  useEffect(() => { 
    startGame();
  }, []); 

  const displayBoard = useCallback((): BoardShape => {
    const newDisplayBoard = board.map(row => [...row]);
    if (currentPiece) {
      currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const boardY = currentPiece.y + y;
            const boardX = currentPiece.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >=0 && boardX < BOARD_WIDTH) {
                 newDisplayBoard[boardY][boardX] = currentPiece.color as CellValue;
            }
          }
        });
      });
    }
    return newDisplayBoard;
  }, [board, currentPiece]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.targetTouches.length === 1) {
        touchStartX.current = e.targetTouches[0].clientX;
        touchStartY.current = e.targetTouches[0].clientY;
        touchEndX.current = e.targetTouches[0].clientX;
        touchEndY.current = e.targetTouches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.targetTouches.length === 1) {
        touchEndX.current = e.targetTouches[0].clientX;
        touchEndY.current = e.targetTouches[0].clientY;
    }
  };

  const handleTouchEnd = () => {
    if (isPaused && !isGameOver) {
        const deltaX = touchEndX.current - touchStartX.current;
        const deltaY = touchEndY.current - touchStartY.current;
        if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
            togglePause();
        }
        return;
    }
    if (isGameOver) {
        const deltaX = touchEndX.current - touchStartX.current;
        const deltaY = touchEndY.current - touchStartY.current;
        if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
           handleRestart();
        }
        return;
    }
    const deltaX = touchEndX.current - touchStartX.current;
    const deltaY = touchEndY.current - touchStartY.current;
    if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
      rotatePiece(); 
    } 
    else if (Math.abs(deltaY) > Math.abs(deltaX)) {
      if (deltaY > minSwipeDistance) {
        hardDrop();
      }
    } 
    else {
      if (deltaX > minSwipeDistance) {
        movePiece(1, 0);
      } else if (deltaX < -minSwipeDistance) {
        movePiece(-1, 0);
      }
    }
    touchStartX.current = 0;
    touchStartY.current = 0;
    touchEndX.current = 0;
    touchEndY.current = 0;
    if(gameContainerRef.current) gameContainerRef.current.focus();
  };

  return (
    <div 
      ref={gameContainerRef} 
      tabIndex={0} 
      className="relative outline-none flex flex-col items-center justify-start pt-2 pb-4 px-2 sm:px-4 min-h-screen bg-gray-950 text-white select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex flex-col md:flex-row items-start justify-center gap-4 md:gap-6 w-full max-w-xs sm:max-w-sm md:max-w-xl lg:max-w-2xl mt-4 md:mt-0">
        
        <div className="flex-shrink-0 mx-auto md:mx-0"> 
          <Board board={displayBoard()} />
        </div>

        <div className="w-full md:w-48 lg:w-52 flex flex-col space-y-3 sm:space-y-4 items-center md:items-stretch">
          <ScoreDisplay score={score} lines={linesCleared + level * LINES_PER_LEVEL} level={level} />
          {nextPiece && <NextPiecePreview piece={nextPiece} />}
          <GameControls 
            onPauseToggle={togglePause} 
            onRestart={handleRestart}
            isPaused={isPaused} 
            isGameOver={isGameOver} 
          />
          <div className="text-xs text-gray-400 mt-3 p-2 bg-gray-800 rounded w-full">
              <p className="font-semibold mb-1 text-center md:text-left">Controls:</p>
              <ul className="list-disc list-inside ml-2 md:ml-0">
                <li>Arrows/WASD: Move/Rotate</li>
                <li>Space: Hard Drop</li>
                <li>P: Pause/Resume</li>
                <li>R: Restart</li>
              </ul>
          </div>
          <div className="text-center text-xs text-gray-500 mt-auto pt-3 border-t border-gray-700 w-full">
            <p>Developed by</p>
            <p className="font-semibold">Humberto Machado</p>
            <p>Full Stack Developer</p>
            <p>June 2, 2025</p>
          </div>
        </div>
      </div>
      {isGameOver && <GameOverModal score={score} onRestart={handleRestart} />}
    </div>
  );
};

export default TetrisGame;