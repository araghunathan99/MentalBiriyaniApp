import { useState, useEffect, useRef, useCallback } from 'react';
import { getFullPath } from '@/lib/basePath';

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface AudioTrack {
  filename: string;
  url: string;
}

export function useAudioPlaylist() {
  const [playlist, setPlaylist] = useState<AudioTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const savedTimeRef = useRef<number>(0); // Save playback position when pausing

  // Load audio files dynamically from audio-list.json
  useEffect(() => {
    async function loadAudioPlaylist() {
      try {
        const response = await fetch(getFullPath('content/audio/audio-list.json'));
        if (!response.ok) {
          console.error('Failed to load audio list for playlist');
          return;
        }

        const data = await response.json();
        const audioItems = data.items || [];

        const tracks: AudioTrack[] = audioItems.map((item: any) => {
          const encodedFilename = encodeURIComponent(item.filename);
          return {
            filename: item.displayName || item.filename,
            url: getFullPath(`content/audio/${encodedFilename}`)
          };
        });

        // Shuffle the playlist
        const shuffledTracks = shuffleArray(tracks);
        setPlaylist(shuffledTracks);

        console.log('🎵 Audio playlist created with', shuffledTracks.length, 'tracks (shuffled)');
      } catch (error) {
        console.error('Error loading audio playlist:', error);
      }
    }

    loadAudioPlaylist();
  }, []);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = 0.3; // Set volume to 30%
      
      // Auto-play next track when current one ends
      audioRef.current.addEventListener('ended', () => {
        setCurrentTrackIndex(prev => (prev + 1) % playlist.length);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [playlist.length]);

  // Load and play current track
  useEffect(() => {
    if (playlist.length === 0 || !audioRef.current) return;

    const currentTrack = playlist[currentTrackIndex];
    if (!currentTrack) return;

    // Only change source if it's a different track
    if (audioRef.current.src !== currentTrack.url) {
      audioRef.current.src = currentTrack.url;
      savedTimeRef.current = 0; // Reset saved time for new track
    }
    
    if (isPlaying) {
      // Restore saved position if resuming
      if (savedTimeRef.current > 0) {
        audioRef.current.currentTime = savedTimeRef.current;
        savedTimeRef.current = 0;
      }
      
      audioRef.current.play().catch(err => {
        console.error('Failed to play audio:', err);
      });
      console.log('🎵 Now playing:', currentTrack.filename);
    }
  }, [currentTrackIndex, playlist, isPlaying]);

  const play = useCallback(() => {
    if (audioRef.current && playlist.length > 0) {
      audioRef.current.play().catch(err => {
        console.error('Failed to play audio:', err);
      });
      setIsPlaying(true);
    }
  }, [playlist.length]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      // Save current playback position before pausing
      savedTimeRef.current = audioRef.current.currentTime;
      audioRef.current.pause();
      setIsPlaying(false);
      console.log('🎵 Paused at:', savedTimeRef.current.toFixed(2), 'seconds');
    }
  }, []);

  const resume = useCallback(() => {
    play();
  }, [play]);

  return {
    play,
    pause,
    resume,
    isPlaying,
    currentTrack: playlist[currentTrackIndex],
    audioElement: audioRef.current
  };
}
