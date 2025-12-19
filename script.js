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

/* LOAD SONG LIST */
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
  genreBar.innerHTML="";
  genres.forEach(g=>{
    const div=document.createElement("div");
    div.className="genre"+(g==="All"?" active":"");
    div.textContent=g;
    div.onclick=()=>{
      document.querySelectorAll(".genre").forEach(x=>x.classList.remove("active"));
      div.classList.add("active");
      currentGenre=g;
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
    const li=document.createElement("li");
    li.textContent=s.title;
    li.onclick=()=>playSong(i);
    playlistEl.appendChild(li);
  });
}

/* PLAY */
function playSong(i){
  const song=filteredSongs[i];
  if(!song) return;

  currentIndex=i;
  audio.src=song.url;
  titleEl.textContent=song.title;
  artistEl.textContent=song.artist;
  audio.play();
  isPlaying=true;
  playBtn.textContent="⏸";

  document.querySelectorAll(".playlist li").forEach(li=>li.classList.remove("active"));
  playlistEl.children[i].classList.add("active");
}

/* CONTROLS */
playBtn.onclick=()=>{
  if(!audio.src) return;
  if(isPlaying){
    audio.pause(); playBtn.textContent="▶";
  }else{
    audio.play(); playBtn.textContent="⏸";
  }
  isPlaying=!isPlaying;
};

nextBtn.onclick=()=>{
  currentIndex=(currentIndex+1)%filteredSongs.length;
  playSong(currentIndex);
};

prevBtn.onclick=()=>{
  currentIndex=(currentIndex-1+filteredSongs.length)%filteredSongs.length;
  playSong(currentIndex);
};

audio.addEventListener("ended",nextBtn.onclick);

/* SEEK (FIXED) */
audio.addEventListener("loadedmetadata",()=>{
  progress.max=audio.duration;
});

audio.addEventListener("timeupdate",()=>{
  if(!progress.dragging){
    progress.value=audio.currentTime;
  }
});

progress.addEventListener("mousedown",()=>progress.dragging=true);
progress.addEventListener("mouseup",()=>{
  progress.dragging=false;
  audio.currentTime=progress.value;
});

progress.addEventListener("touchstart",()=>progress.dragging=true);
progress.addEventListener("touchend",()=>{
  progress.dragging=false;
  audio.currentTime=progress.value;
});

/* VOLUME */
volume.addEventListener("input",()=>audio.volume=volume.value);

/* SEARCH */
searchInput.addEventListener("input",applyFilter);

/* VISUALIZER */
const AudioContext=window.AudioContext||window.webkitAudioContext;
const audioCtx=new AudioContext();
const source=audioCtx.createMediaElementSource(audio);
const analyser=audioCtx.createAnalyser();
source.connect(analyser);
analyser.connect(audioCtx.destination);
analyser.fftSize=64;

document.body.addEventListener("click",()=>{
  if(audioCtx.state==="suspended") audioCtx.resume();
},{once:true});

function resize(){
  canvas.width=window.innerWidth;
  canvas.height=60;
}
window.addEventListener("resize",resize);
resize();

const data=new Uint8Array(analyser.frequencyBinCount);
function draw(){
  requestAnimationFrame(draw);
  analyser.getByteFrequencyData(data);
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const w=canvas.width/data.length;
  data.forEach((v,i)=>{
    const h=v/2;
    ctx.fillStyle="#00ff66";
    ctx.fillRect(i*w,canvas.height-h,w-2,h);
  });
}
draw();
