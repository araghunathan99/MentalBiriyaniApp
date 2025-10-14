import { useState, useEffect, useRef } from "react";
import { Play, Pause, Music, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFullPath } from "@/lib/basePath";
import { useToast } from "@/hooks/use-toast";

interface Song {
  id: string;
  filename: string;
  url: string;
  displayName: string;
}

export default function SongsView() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentPlayingSong, setCurrentPlayingSong] = useState<string | null>(null);
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());
  const [isPlaylistMode, setIsPlaylistMode] = useState(false);
  const [playlistSongs, setPlaylistSongs] = useState<Song[]>([]);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Load songs dynamically from audio-list.json
  useEffect(() => {
    async function loadSongs() {
      try {
        const response = await fetch(getFullPath('content/audio/audio-list.json'));
        if (!response.ok) {
          console.error('Failed to load audio list');
          return;
        }

        const data = await response.json();
        const audioItems = data.items || [];

        const loadedSongs: Song[] = audioItems.map((item: any) => {
          // URL encode the filename for proper HTTP access
          const encodedFilename = encodeURIComponent(item.filename);

          return {
            id: item.id,
            filename: item.filename,
            url: getFullPath(`content/audio/${encodedFilename}`),
            displayName: item.displayName
          };
        });

        setSongs(loadedSongs);
        console.log(`✅ Loaded ${loadedSongs.length} songs from audio-list.json`);
      } catch (error) {
        console.error('Error loading songs:', error);
      }
    }

    loadSongs();
  }, []);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      console.log('🎵 SongsView: Initializing audio element');
      audioRef.current = new Audio();
      audioRef.current.volume = 0.5;
      audioRef.current.preload = 'auto';
      
      // Add general error handler
      audioRef.current.addEventListener('error', (e) => {
        const target = e.target as HTMLAudioElement;
        console.error('🎵 SongsView: Audio element error:', {
          error: target.error,
          src: target.src,
          networkState: target.networkState,
          readyState: target.readyState
        });
      });
    }

    return () => {
      if (audioRef.current) {
        console.log('🎵 SongsView: Cleaning up audio element');
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Handle playlist auto-advance
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      console.log('🎵 SongsView: Track ended in playlist mode');
      if (isPlaylistMode && playlistSongs.length > 0) {
        // Clear current playing song to prevent toggle behavior
        setCurrentPlayingSong(null);
        
        setCurrentPlaylistIndex(prev => {
          const nextIndex = (prev + 1) % playlistSongs.length;
          console.log(`🎵 SongsView: Advancing to next track ${nextIndex + 1}/${playlistSongs.length}`);
          const nextSong = playlistSongs[nextIndex];
          if (nextSong) {
            // Play next song asynchronously
            setTimeout(() => playSong(nextSong.id), 100);
          }
          return nextIndex;
        });
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [isPlaylistMode, playlistSongs]);

  const playSong = async (songId: string) => {
    // Search in both main songs list and playlist songs
    let song = songs.find(s => s.id === songId);
    if (!song && isPlaylistMode) {
      song = playlistSongs.find(s => s.id === songId);
    }
    
    if (!song || !audioRef.current) {
      console.error('Song not found:', songId);
      return;
    }

    if (currentPlayingSong === songId) {
      // Pause if currently playing
      audioRef.current.pause();
      setCurrentPlayingSong(null);
      console.log('⏸️ Paused:', song.displayName);
    } else {
      try {
        // Stop current playback
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        
        // Set new source
        console.log('🎵 Attempting to load:', song.displayName);
        console.log('📍 URL:', song.url);
        audioRef.current.src = song.url;
        
        // Wait for audio to be ready and play
        await new Promise<void>((resolve, reject) => {
          if (!audioRef.current) {
            reject(new Error('Audio element not available'));
            return;
          }

          const onCanPlay = () => {
            console.log('✅ Audio ready to play');
            audioRef.current?.removeEventListener('canplay', onCanPlay);
            audioRef.current?.removeEventListener('error', onError);
            resolve();
          };

          const onError = (e: Event) => {
            const target = e.target as HTMLAudioElement;
            console.error('❌ Audio error event:', {
              error: target.error,
              src: target.src,
              networkState: target.networkState,
              readyState: target.readyState
            });
            audioRef.current?.removeEventListener('canplay', onCanPlay);
            audioRef.current?.removeEventListener('error', onError);
            reject(new Error(`Failed to load audio: ${target.error?.message || 'Unknown error'}`));
          };

          audioRef.current.addEventListener('canplay', onCanPlay, { once: true });
          audioRef.current.addEventListener('error', onError, { once: true });
          audioRef.current.load();
        });

        await audioRef.current.play();
        setCurrentPlayingSong(songId);
        console.log('🎵 Playing:', song.displayName);
      } catch (err) {
        console.error('Failed to play song:', err);
        setCurrentPlayingSong(null);
        toast({
          title: "Playback Error",
          description: `Could not play "${song.displayName}". Check console for details.`,
          variant: "destructive"
        });
      }
    }
  };

  const toggleSongSelection = (songId: string) => {
    setSelectedSongs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(songId)) {
        newSet.delete(songId);
      } else {
        newSet.add(songId);
      }
      return newSet;
    });
  };

  const playSelectedAsPlaylist = () => {
    if (selectedSongs.size === 0) {
      toast({
        title: "No Songs Selected",
        description: "Please select at least one song to create a playlist",
      });
      return;
    }

    const playlist = songs.filter(song => selectedSongs.has(song.id));
    setPlaylistSongs(playlist);
    setIsPlaylistMode(true);
    setCurrentPlaylistIndex(0);
    
    // Start playing first song
    if (playlist[0]) {
      playSong(playlist[0].id);
    }

    toast({
      title: "Playlist Created",
      description: `Playing ${playlist.length} song${playlist.length > 1 ? 's' : ''}`,
    });
  };

  const clearSelection = () => {
    setSelectedSongs(new Set());
    setIsPlaylistMode(false);
    setPlaylistSongs([]);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Selection Controls */}
      {selectedSongs.size > 0 && (
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between p-3">
            <span className="text-sm text-muted-foreground">
              {selectedSongs.size} song{selectedSongs.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={clearSelection}
                data-testid="button-clear-selection"
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={playSelectedAsPlaylist}
                data-testid="button-play-playlist"
              >
                <Play className="h-4 w-4 mr-1" />
                Play Playlist
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Songs List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 pb-24 space-y-2">
          {songs.map((song) => {
            const isPlaying = currentPlayingSong === song.id;
            const isSelected = selectedSongs.has(song.id);
            const isInCurrentPlaylist = isPlaylistMode && playlistSongs.some(s => s.id === song.id);

            return (
              <div
                key={song.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isSelected ? 'bg-primary/10 border border-primary/20' : 'bg-card hover-elevate'
                }`}
                data-testid={`song-item-${song.id}`}
              >
                {/* Selection Checkbox */}
                <button
                  onClick={() => toggleSongSelection(song.id)}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-colors flex items-center justify-center ${
                    isSelected
                      ? 'bg-primary border-primary'
                      : 'border-muted-foreground/30 hover-elevate'
                  }`}
                  data-testid={`button-select-${song.id}`}
                >
                  {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                </button>

                {/* Song Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <p className="text-sm font-medium truncate">{song.displayName}</p>
                  </div>
                  {isInCurrentPlaylist && (
                    <p className="text-xs text-muted-foreground mt-1">In current playlist</p>
                  )}
                </div>

                {/* Play Button */}
                <Button
                  size="icon"
                  variant={isPlaying ? "default" : "ghost"}
                  onClick={() => playSong(song.id)}
                  className="flex-shrink-0"
                  data-testid={`button-play-${song.id}`}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Playlist Info */}
      {isPlaylistMode && playlistSongs.length > 0 && (
        <div className="sticky bottom-0 z-30 bg-background/95 backdrop-blur-xl border-t border-border p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                Playlist ({currentPlaylistIndex + 1}/{playlistSongs.length})
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearSelection}
              data-testid="button-stop-playlist"
            >
              Stop Playlist
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
