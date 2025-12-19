const audio = document.getElementById("audio");
const playlistEl = document.getElementById("playlist");
const titleEl = document.getElementById("title");
const artistEl = document.getElementById("artist");

const playBtn = document.getElementById("play");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");

const progress = document.getElementById("progress");
const volume = document.getElementById("volume");
const searchInput = document.getElementById("search");
const genreBar = document.getElementById("genreBar");

const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

let songs = [];
let filteredSongs = [];
let currentIndex = 0;
let isPlaying = false;
let currentGenre = "All";

/* LOAD DATA */
fetch("music-list.json")
  .then(res => res.json())
  .then(data => {
    songs = data;
    initGenres();
    applyFilter();
  });

/* GENRES */
function initGenres(){
  const genres = ["All", ...new Set(songs.map(s=>s.genre))];
  genreBar.innerHTML = "";
  genres.forEach(g=>{
    const div = document.createElement("div");
    div.className = "genre" + (g==="All"?" active":"");
    div.textContent = g;
    div.onclick = ()=>{
      document.querySelectorAll(".genre").forEach(x=>x.classList.remove("active"));
      div.classList.add("active");
      currentGenre = g;
      applyFilter();
    };
    genreBar.appendChild(div);
  });
}

/* FILTER */
function applyFilter(){
  const q = searchInput.value.toLowerCase();
  filteredSongs = songs.filter(s =>
    (currentGenre==="All" || s.genre===currentGenre) &&
    s.title.toLowerCase().includes(q)
  );
  renderPlaylist();
}

/* PLAYLIST */
function renderPlaylist(){
  playlistEl.innerHTML="";
  filteredSongs.forEach((s,i)=>{
    const li = document.createElement("li");
    li.textContent = s.title;
    li.onclick = ()=> playSong(i);
    playlistEl.appendChild(li);
  });
}

/* PLAY SONG */
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
playBtn.onclick = ()=>{
  if(!audio.src) return;
  if(isPlaying){
    audio.pause();
    playBtn.textContent="▶";
  }else{
    audio.play();
    playBtn.textContent="⏸";
  }
  isPlaying = !isPlaying;
};

nextBtn.onclick = ()=>{
  currentIndex = (currentIndex+1)%filteredSongs.length;
  playSong(currentIndex);
};

prevBtn.onclick = ()=>{
  currentIndex = (currentIndex-1+filteredSongs.length)%filteredSongs.length;
  playSong(currentIndex);
};

audio.addEventListener("ended", nextBtn.onclick);

/* PROGRESS BAR */
audio.addEventListener("timeupdate", ()=>{
  progress.value = (audio.currentTime / audio.duration) * 100 || 0;
});

progress.addEventListener("input", ()=>{
  audio.currentTime = (progress.value/100)*audio.duration;
});

/* VOLUME */
volume.addEventListener("input", ()=>{
  audio.volume = volume.value;
});

/* SEARCH */
searchInput.addEventListener("input", applyFilter);

/* VISUALIZER */
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
const source = audioCtx.createMediaElementSource(audio);
const analyser = audioCtx.createAnalyser();
source.connect(analyser);
analyser.connect(audioCtx.destination);
analyser.fftSize = 64;

const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

function resize(){
  canvas.width = window.innerWidth;
  canvas.height = 60;
}
window.addEventListener("resize", resize);
resize();

function draw(){
  requestAnimationFrame(draw);
  analyser.getByteFrequencyData(dataArray);

  ctx.clearRect(0,0,canvas.width,canvas.height);
  const barWidth = canvas.width / bufferLength;

  dataArray.forEach((v,i)=>{
    const h = v/2;
    ctx.fillStyle = "#00ff66";
    ctx.fillRect(i*barWidth, canvas.height-h, barWidth-2, h);
  });
}
draw();
