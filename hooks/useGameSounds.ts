import { useCallback, useEffect, useRef } from 'react';

export const useGameSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error("Web Audio API is not supported in this browser.", e);
    }
    
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);

  const playSound = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.05) => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    gainNode.gain.setValueAtTime(volume, audioContextRef.current.currentTime);

    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
  }, []);

  const playMoveSound = useCallback(() => playSound(200, 50, 'square'), [playSound]);
  const playRotateSound = useCallback(() => playSound(300, 70, 'triangle'), [playSound]);
  const playLineClearSound = useCallback(() => playSound(400, 150, 'sine'), [playSound]);
  const playDropSound = useCallback(() => playSound(150, 100, 'square', 0.08), [playSound]);
  const playHardDropSound = useCallback(() => playSound(180, 120, 'sawtooth', 0.1), [playSound]);
  const playGameOverSound = useCallback(() => { 
    playSound(100, 300, 'sawtooth', 0.1); 
    setTimeout(() => playSound(80, 400, 'sawtooth', 0.1), 150);
  }, [playSound]);
  const playPauseSound = useCallback(() => playSound(250, 100, 'triangle', 0.03), [playSound]);


  return { playMoveSound, playRotateSound, playLineClearSound, playDropSound, playHardDropSound, playGameOverSound, playPauseSound };
};