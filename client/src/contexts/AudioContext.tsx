import { createContext, useContext, ReactNode } from 'react';
import { useAudioPlaylist } from '@/hooks/useAudioPlaylist';

interface AudioContextType {
  play: () => void;
  pause: () => void;
  resume: () => void;
  isPlaying: boolean;
  currentTrack?: { filename: string; url: string };
  audioElement: HTMLAudioElement | null;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioPlaylist = useAudioPlaylist();

  return (
    <AudioContext.Provider value={audioPlaylist}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
}
