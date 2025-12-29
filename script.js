// Music Player Application
class MusicPlayer {
    constructor() {
        this.songs = [];
        this.currentSongIndex = -1;
        this.isPlaying = false;
        this.isShuffled = false;
        this.isRepeated = false;
        this.audio = document.getElementById('audioPlayer');
        this.initializeSongs();
        this.setupEventListeners();
        this.renderSongs();
    }

    // Initialize with default Tamil songs
    initializeSongs() {
        this.songs = [
            {
                id: 1,
                name: 'Fear Song',
                artist: 'Devara',
                url: './songs/fear-song-devara.mp3' // Add your audio file in 'songs' folder
            },
            {
                id: 2,
                name: 'Vanga Kadal Ellai',
                artist: 'Surra',
                url: './songs/vanga-kadal-ellai-surra.mp3' // Add your audio file in 'songs' folder
            },
            {
                id: 3,
                name: 'Senjitaley',
                artist: 'Remo',
                url: './songs/senjitaley-remo.mp3' // Add your audio file in 'songs' folder
            }
        ];
        this.saveToLocalStorage();
    }

    // Setup all event listeners
    setupEventListeners() {
        // Play/Pause button
        document.getElementById('playPauseBtn').addEventListener('click', () => this.togglePlayPause());
        
        // Next/Previous buttons
        document.getElementById('nextBtn').addEventListener('click', () => this.playNext());
        document.getElementById('prevBtn').addEventListener('click', () => this.playPrevious());
        
        // Shuffle and Repeat
        document.getElementById('shuffleBtn').addEventListener('click', () => this.toggleShuffle());
        document.getElementById('repeatBtn').addEventListener('click', () => this.toggleRepeat());
        
        // Progress slider
        const progressSlider = document.getElementById('progressSlider');
        progressSlider.addEventListener('input', (e) => {
            const percent = e.target.value;
            this.audio.currentTime = (percent / 100) * this.audio.duration;
        });
        
        // Volume slider
        const volumeSlider = document.getElementById('volumeSlider');
        volumeSlider.addEventListener('input', (e) => {
            this.audio.volume = e.target.value / 100;
            this.updateVolumeIcon(e.target.value);
        });
        
        // Audio events
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.onSongEnd());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        
        // Modal controls
        document.getElementById('addSongBtn').addEventListener('click', () => this.openModal());
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('songForm').addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Close modal on outside click
        document.getElementById('songModal').addEventListener('click', (e) => {
            if (e.target.id === 'songModal') {
                this.closeModal();
            }
        });
    }

    // Render songs list
    renderSongs() {
        const container = document.getElementById('songsContainer');
        container.innerHTML = '';
        
        this.songs.forEach((song, index) => {
            const songCard = document.createElement('div');
            songCard.className = 'song-card';
            if (index === this.currentSongIndex) {
                songCard.classList.add('playing');
            }
            
            songCard.innerHTML = `
                <div class="song-card-header">
                    <div class="song-thumbnail-large">
                        <i class="fas fa-music"></i>
                    </div>
                    <div class="song-actions">
                        <button class="action-btn edit" onclick="musicPlayer.editSong(${song.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="musicPlayer.deleteSong(${song.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="song-info">
                    <h3>${song.name}</h3>
                    <p>${song.artist}</p>
                </div>
            `;
            
            songCard.addEventListener('click', (e) => {
                if (!e.target.closest('.song-actions')) {
                    this.playSong(index);
                }
            });
            
            container.appendChild(songCard);
        });
    }

    // Play a song
    playSong(index) {
        if (index < 0 || index >= this.songs.length) return;
        
        this.currentSongIndex = index;
        const song = this.songs[index];
        
        this.audio.src = song.url;
        this.audio.play();
        this.isPlaying = true;
        
        this.updatePlayerUI();
        this.renderSongs();
    }

    // Toggle play/pause
    togglePlayPause() {
        if (this.currentSongIndex === -1 && this.songs.length > 0) {
            this.playSong(0);
            return;
        }
        
        if (this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
        } else {
            this.audio.play();
            this.isPlaying = true;
        }
        
        this.updatePlayPauseButton();
    }

    // Play next song
    playNext() {
        if (this.songs.length === 0) return;
        
        if (this.isShuffled) {
            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * this.songs.length);
            } while (nextIndex === this.currentSongIndex && this.songs.length > 1);
            this.playSong(nextIndex);
        } else {
            const nextIndex = (this.currentSongIndex + 1) % this.songs.length;
            this.playSong(nextIndex);
        }
    }

    // Play previous song
    playPrevious() {
        if (this.songs.length === 0) return;
        
        if (this.isShuffled) {
            let prevIndex;
            do {
                prevIndex = Math.floor(Math.random() * this.songs.length);
            } while (prevIndex === this.currentSongIndex && this.songs.length > 1);
            this.playSong(prevIndex);
        } else {
            const prevIndex = (this.currentSongIndex - 1 + this.songs.length) % this.songs.length;
            this.playSong(prevIndex);
        }
    }

    // Toggle shuffle
    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        const btn = document.getElementById('shuffleBtn');
        if (this.isShuffled) {
            btn.style.color = '#1db954';
        } else {
            btn.style.color = '#b3b3b3';
        }
    }

    // Toggle repeat
    toggleRepeat() {
        this.isRepeated = !this.isRepeated;
        const btn = document.getElementById('repeatBtn');
        if (this.isRepeated) {
            btn.style.color = '#1db954';
        } else {
            btn.style.color = '#b3b3b3';
        }
    }

    // Handle song end
    onSongEnd() {
        if (this.isRepeated) {
            this.audio.currentTime = 0;
            this.audio.play();
        } else {
            this.playNext();
        }
    }

    // Update progress bar
    updateProgress() {
        if (this.audio.duration) {
            const percent = (this.audio.currentTime / this.audio.duration) * 100;
            document.getElementById('progress').style.width = percent + '%';
            document.getElementById('progressSlider').value = percent;
            document.getElementById('currentTime').textContent = this.formatTime(this.audio.currentTime);
        }
    }

    // Update duration
    updateDuration() {
        document.getElementById('duration').textContent = this.formatTime(this.audio.duration);
    }

    // Format time
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Update play/pause button
    updatePlayPauseButton() {
        const btn = document.getElementById('playPauseBtn');
        const icon = btn.querySelector('i');
        if (this.isPlaying) {
            icon.className = 'fas fa-pause';
        } else {
            icon.className = 'fas fa-play';
        }
    }

    // Update player UI
    updatePlayerUI() {
        if (this.currentSongIndex >= 0) {
            const song = this.songs[this.currentSongIndex];
            document.getElementById('currentSongName').textContent = song.name;
            document.getElementById('currentSongArtist').textContent = song.artist;
        }
        this.updatePlayPauseButton();
    }

    // Update volume icon
    updateVolumeIcon(volume) {
        const icon = document.getElementById('volumeIcon');
        if (volume == 0) {
            icon.className = 'fas fa-volume-mute';
        } else if (volume < 50) {
            icon.className = 'fas fa-volume-down';
        } else {
            icon.className = 'fas fa-volume-up';
        }
    }

    // CRUD Operations

    // Create - Open modal for adding song
    openModal(songId = null) {
        const modal = document.getElementById('songModal');
        const form = document.getElementById('songForm');
        const title = document.getElementById('modalTitle');
        
        if (songId) {
            // Edit mode
            const song = this.songs.find(s => s.id === songId);
            title.textContent = 'Edit Song';
            document.getElementById('songName').value = song.name;
            document.getElementById('songArtist').value = song.artist;
            document.getElementById('songUrl').value = song.url;
            form.dataset.editId = songId;
        } else {
            // Add mode
            title.textContent = 'Add New Song';
            form.reset();
            delete form.dataset.editId;
        }
        
        modal.classList.add('active');
    }

    // Close modal
    closeModal() {
        document.getElementById('songModal').classList.remove('active');
        document.getElementById('songForm').reset();
    }

    // Handle form submit (Create/Update)
    handleFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const songName = document.getElementById('songName').value.trim();
        const songArtist = document.getElementById('songArtist').value.trim();
        let songUrl = document.getElementById('songUrl').value.trim();
        
        // If it's a local file path, ensure it starts with ./
        if (songUrl && !songUrl.startsWith('http') && !songUrl.startsWith('./') && !songUrl.startsWith('/')) {
            songUrl = './songs/' + songUrl;
        }
        
        if (form.dataset.editId) {
            // Update existing song
            this.updateSong(parseInt(form.dataset.editId), songName, songArtist, songUrl);
        } else {
            // Create new song
            this.createSong(songName, songArtist, songUrl);
        }
        
        this.closeModal();
    }

    // Create new song
    createSong(name, artist, url) {
        const newId = this.songs.length > 0 ? Math.max(...this.songs.map(s => s.id)) + 1 : 1;
        const newSong = {
            id: newId,
            name,
            artist,
            url
        };
        this.songs.push(newSong);
        this.saveToLocalStorage();
        this.renderSongs();
    }

    // Read - Get song by ID (already handled in renderSongs)
    
    // Update song
    updateSong(id, name, artist, url) {
        const index = this.songs.findIndex(s => s.id === id);
        if (index !== -1) {
            this.songs[index] = { ...this.songs[index], name, artist, url };
            this.saveToLocalStorage();
            this.renderSongs();
            
            // If currently playing, update audio source
            if (this.currentSongIndex === index) {
                this.audio.src = url;
                if (this.isPlaying) {
                    this.audio.play();
                }
                this.updatePlayerUI();
            }
        }
    }

    // Delete song
    deleteSong(id) {
        if (confirm('Are you sure you want to delete this song?')) {
            const index = this.songs.findIndex(s => s.id === id);
            if (index !== -1) {
                this.songs.splice(index, 1);
                
                // Adjust current song index if needed
                if (this.currentSongIndex === index) {
                    if (this.songs.length > 0) {
                        this.currentSongIndex = Math.min(index, this.songs.length - 1);
                        this.playSong(this.currentSongIndex);
                    } else {
                        this.currentSongIndex = -1;
                        this.audio.pause();
                        this.audio.src = '';
                        this.isPlaying = false;
                        this.updatePlayerUI();
                    }
                } else if (this.currentSongIndex > index) {
                    this.currentSongIndex--;
                }
                
                this.saveToLocalStorage();
                this.renderSongs();
            }
        }
    }

    // Edit song
    editSong(id) {
        this.openModal(id);
    }

    // Local Storage
    saveToLocalStorage() {
        localStorage.setItem('musicPlayerSongs', JSON.stringify(this.songs));
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('musicPlayerSongs');
        if (saved) {
            this.songs = JSON.parse(saved);
        }
    }
}

// Initialize the music player when page loads
let musicPlayer;
window.addEventListener('DOMContentLoaded', () => {
    musicPlayer = new MusicPlayer();
    musicPlayer.loadFromLocalStorage();
    if (musicPlayer.songs.length > 0) {
        musicPlayer.renderSongs();
    } else {
        musicPlayer.initializeSongs();
    }
});

