const audio = document.getElementById("audio");
const playlistEl = document.getElementById("playlist");
const titleEl = document.getElementById("title");
const artistEl = document.getElementById("artist");
const playBtn = document.getElementById("play");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");
const searchInput = document.getElementById("search");
const genreBar = document.getElementById("genreBar");

let songs = [];
let filteredSongs = [];
let currentIndex = 0;
let isPlaying = false;
let currentGenre = "All";

/* LOAD JSON */
fetch("music-list.json")
  .then(res => res.json())
  .then(data => {
    songs = data;
    initGenres();
    applyFilter();
  });

/* GENRE INIT */
function initGenres(){
  const genres = ["All", ...new Set(songs.map(s => s.genre))];
  genreBar.innerHTML = "";

  genres.forEach(g => {
    const div = document.createElement("div");
    div.className = "genre" + (g === "All" ? " active" : "");
    div.textContent = g;
    div.onclick = () => {
      document.querySelectorAll(".genre").forEach(x=>x.classList.remove("active"));
      div.classList.add("active");
      currentGenre = g;
      applyFilter();
    };
    genreBar.appendChild(div);
  });
}

/* APPLY SEARCH + GENRE */
function applyFilter(){
  const q = searchInput.value.toLowerCase();
  filteredSongs = songs.filter(s =>
    (currentGenre === "All" || s.genre === currentGenre) &&
    s.title.toLowerCase().includes(q)
  );
  renderPlaylist();
}

/* RENDER PLAYLIST */
function renderPlaylist(){
  playlistEl.innerHTML = "";
  filteredSongs.forEach((song, i) => {
    const li = document.createElement("li");
    li.textContent = song.title;
    li.onclick = () => playSong(i);
    playlistEl.appendChild(li);
  });
}

/* PLAY */
function playSong(index){
  const song = filteredSongs[index];
  if(!song) return;

  currentIndex = index;
  audio.src = song.url;
  titleEl.textContent = song.title;
  artistEl.textContent = song.artist;
  audio.play();
  isPlaying = true;
  playBtn.textContent = "⏸";

  document.querySelectorAll(".playlist li").forEach(li=>li.classList.remove("active"));
  playlistEl.children[index].classList.add("active");
}

/* CONTROLS */
playBtn.onclick = () => {
  if(!audio.src) return;
  if(isPlaying){
    audio.pause();
    playBtn.textContent = "▶";
  }else{
    audio.play();
    playBtn.textContent = "⏸";
  }
  isPlaying = !isPlaying;
};

nextBtn.onclick = () => {
  currentIndex = (currentIndex + 1) % filteredSongs.length;
  playSong(currentIndex);
};

prevBtn.onclick = () => {
  currentIndex = (currentIndex - 1 + filteredSongs.length) % filteredSongs.length;
  playSong(currentIndex);
};

audio.addEventListener("ended", nextBtn.onclick);
searchInput.addEventListener("input", applyFilter);
