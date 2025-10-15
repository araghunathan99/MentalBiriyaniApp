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
        const cacheBuster = Date.now();
        const response = await fetch(getFullPath(`content/audio/audio-list.json?t=${cacheBuster}`), {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        });
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
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Handle auto-play next track when current one ends
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || playlist.length === 0) return;

    const handleEnded = () => {
      console.log('🎵 Track ended, advancing to next track');
      setCurrentTrackIndex(prev => {
        const nextIndex = (prev + 1) % playlist.length;
        console.log(`🎵 Next track index: ${nextIndex} (total: ${playlist.length})`);
        return nextIndex;
      });
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [playlist.length]);

  // Load and play current track
  useEffect(() => {
    if (playlist.length === 0 || !audioRef.current) return;

    const currentTrack = playlist[currentTrackIndex];
    if (!currentTrack) return;

    // Check if we need to load a new source
    const currentSrc = audioRef.current.src;
    const trackUrl = currentTrack.url;
    const needsNewSource = !currentSrc || !currentSrc.endsWith(trackUrl.split('/').pop() || '');
    
    if (needsNewSource) {
      console.log('🎵 Loading new track:', currentTrack.filename);
      audioRef.current.src = currentTrack.url;
      savedTimeRef.current = 0; // Reset saved time for new track
    }
    
    if (isPlaying) {
      // Restore saved position if resuming (but not on new track load)
      if (savedTimeRef.current > 0 && !needsNewSource) {
        audioRef.current.currentTime = savedTimeRef.current;
        console.log('🎵 Restored position to:', savedTimeRef.current.toFixed(2), 'seconds');
      }
      
      audioRef.current.play().catch(err => {
        console.error('Failed to play audio:', err);
      });
      console.log('🎵 Now playing:', currentTrack.filename);
    }
  }, [currentTrackIndex, playlist, isPlaying]);

  const play = useCallback(() => {
    console.log('🎵 play() called, playlist length:', playlist.length);
    if (audioRef.current && playlist.length > 0) {
      // Just set isPlaying to true, let the useEffect handle playback
      setIsPlaying(true);
    } else {
      console.log('🎵 Cannot play - audioRef or playlist missing');
    }
  }, [playlist.length]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      // Save current playback position before pausing
      const currentTime = audioRef.current.currentTime;
      savedTimeRef.current = currentTime;
      audioRef.current.pause();
      setIsPlaying(false);
      console.log('🎵 Paused at:', currentTime.toFixed(2), 'seconds (saved for resume)');
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && playlist.length > 0) {
      // Just set isPlaying to true, let the useEffect restore position and play
      setIsPlaying(true);
    }
  }, [playlist.length]);

  return {
    play,
    pause,
    resume,
    isPlaying,
    currentTrack: playlist[currentTrackIndex],
    audioElement: audioRef.current
  };
}
