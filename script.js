const audio = document.getElementById("audio");
const playlistEl = document.getElementById("playlist");
const titleEl = document.getElementById("title");
const artistEl = document.getElementById("artist");
const playBtn = document.getElementById("play");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");

let songs = [];
let currentIndex = 0;
let isPlaying = false;

/* LOAD MUSIC LIST */
fetch("music-list.json")
  .then(res => res.json())
  .then(data => {
    songs = data;
    renderPlaylist();
    loadSong(0);
  });

function renderPlaylist(){
  playlistEl.innerHTML = "";
  songs.forEach((song, i) => {
    const li = document.createElement("li");
    li.textContent = song.title;
    li.onclick = () => playSong(i);
    playlistEl.appendChild(li);
  });
}

function loadSong(index){
  const song = songs[index];
  audio.src = song.url;
  titleEl.textContent = song.title;
  artistEl.textContent = song.artist;
  setActive(index);
}

function playSong(index){
  currentIndex = index;
  loadSong(index);
  audio.play();
  isPlaying = true;
  playBtn.textContent = "⏸";
}

playBtn.onclick = () => {
  if(isPlaying){
    audio.pause();
    playBtn.textContent = "▶";
  } else {
    audio.play();
    playBtn.textContent = "⏸";
  }
  isPlaying = !isPlaying;
};

nextBtn.onclick = () => {
  currentIndex = (currentIndex + 1) % songs.length;
  playSong(currentIndex);
};

prevBtn.onclick = () => {
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  playSong(currentIndex);
};

audio.addEventListener("ended", nextBtn.onclick);

function setActive(index){
  document.querySelectorAll(".playlist li").forEach(li => li.classList.remove("active"));
  playlistEl.children[index].classList.add("active");
}
