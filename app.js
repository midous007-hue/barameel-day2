const RUNNERS={
 rookie:{name:'THE ROOKIE'}, skater:{name:'THE SKATER'}, brona:{name:'BRONA'},
 racer:{name:'THE RACER'}, chiller:{name:'THE CHILLER'}, dreamer:{name:'THE DREAMER'}
};
const CHARACTERS=Object.keys(RUNNERS);
const COLLECTIONS={
 collection01:{name:'ALEXANDRIA SUNSET',total:9,pointsPerPiece:10000}
};
const CHECKPOINTS=[
 {id:'CP01',name:'Checkpoint 01',lat:31.191359,lng:29.916030},
 {id:'CP02',name:'Checkpoint 02',lat:31.190651,lng:29.920590},
 {id:'CP03',name:'Checkpoint 03',lat:31.190300,lng:29.917114}
];

function selected(){return localStorage.getItem('barameelRunner')||'brona'}
function selectRunner(key){if(CHARACTERS.includes(key)) localStorage.setItem('barameelRunner',key)}
function go(url){play('nav');document.body.classList.add('flash');setTimeout(()=>location.href=url,130)}
function back(url='screen04.html'){play('back');go(url)}
function qs(k,d=null){return new URLSearchParams(location.search).get(k) ?? d}
function state(){
  try{return JSON.parse(localStorage.getItem('barameelState')||'{}')}
  catch{return {}}
}
function saveState(s){localStorage.setItem('barameelState',JSON.stringify(s))}
function getPieces(collectionId){
  const s=state(); return s.collections?.[collectionId]?.pieces || [];
}
function addPiece(collectionId,piece,points){
  const s=state(); s.collections ||= {}; s.collections[collectionId] ||= {pieces:[],points:0};
  const c=s.collections[collectionId];
  if(!c.pieces.includes(Number(piece))) c.pieces.push(Number(piece));
  c.points=(c.points||0)+Number(points||0);
  s.totalPoints=(s.totalPoints||0)+Number(points||0);
  saveState(s); return c;
}
function totalPoints(){return state().totalPoints||0}
function allCollected(collectionId){
  const c=COLLECTIONS[collectionId], p=getPieces(collectionId); return c && p.length>=c.total
}
function format(n){return Number(n||0).toLocaleString('en-US')}

/* Original retro arcade-style WebAudio — no external audio files required. */
let AC,master;
function audio(){
  AC ||= new (window.AudioContext||window.webkitAudioContext)();
  if(!master){
    master=AC.createGain(); master.gain.value=.9; master.connect(AC.destination);
  }
  if(AC.state==='suspended') AC.resume(); return AC;
}
function tone(f,d=.11,type='square',g=.28,at=0,slide=0){
  const c=audio(),o=c.createOscillator(),v=c.createGain(),t=c.currentTime+at;
  o.type=type;o.frequency.setValueAtTime(f,t);
  if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,f+slide),t+d);
  v.gain.setValueAtTime(.0001,t);v.gain.exponentialRampToValueAtTime(g,t+.008);v.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(v);v.connect(master);o.start(t);o.stop(t+d+.02);
}
function noise(d=.08,g=.1,at=0){
 const c=audio(),b=c.createBuffer(1,c.sampleRate*d,c.sampleRate),x=b.getChannelData(0);
 for(let i=0;i<x.length;i++)x[i]=(Math.random()*2-1)*(1-i/x.length)**2;
 const s=c.createBufferSource(),v=c.createGain();s.buffer=b;v.gain.value=g;s.connect(v);v.connect(master);s.start(c.currentTime+at);
}
const SEQ={
 rookie:[392,523,659],skater:[494,659,988],brona:[440,554,659,880],
 racer:[330,494,784,988],chiller:[262,330,392],dreamer:[392,494,587,784]
};
function selectSound(k){(SEQ[k]||SEQ.brona).forEach((f,i)=>tone(f,.11,'square',.48,i*.06,i===3?120:0));}
function navSound(){tone(660,.07,'square',.34);tone(880,.08,'square',.3,.06)}
function backSound(){tone(440,.06,'square',.4,0,-80);tone(330,.08,'square',.34,.06,-60)}
function scanSound(){[660,880,1175,1568].forEach((f,i)=>tone(f,.08,'square',.5,i*.065));noise(.05,.08,.02)}
function successSound(){
 [523,659,784,988,1175,1397,1568,1760,2093].forEach((f,i)=>tone(f,.14,'square',.72,i*.075,90));
 [1319,1568,1760,2093,2349,2637,3136].forEach((f,i)=>tone(f,.12,'square',.65,.9+i*.07,120));
 [1047,1319,1568,2093,2637].forEach((f,i)=>tone(f,.72,'square',.62,1.55+i*.02));
 noise(.18,.25,.02); noise(.18,.22,1.0);
}
function play(type,key){try{
 if(type==='select')selectSound(key); else if(type==='back')backSound(); else if(type==='scan')scanSound();
 else if(type==='success')successSound(); else navSound();
}catch{}}

function loadArt(id,src){
 const im=document.getElementById(id); if(!im)return;
 im.src=src; im.onload=()=>im.classList.add('ready');
 im.onerror=()=>{im.src='./assets/screen01-start.png';im.classList.add('ready')}
}
function setText(id,v){const e=document.getElementById(id);if(e)e.textContent=v}
function hotspot(id,fn){const e=document.getElementById(id);if(e)e.addEventListener('click',fn)}
function installTouch(){document.querySelectorAll('.hotspot').forEach(e=>e.addEventListener('touchstart',()=>{}, {passive:true}))}

async function startQRScanner(onResult){
 if(!navigator.mediaDevices?.getUserMedia){toast('Camera is not available in this browser.');return}
 const video=document.getElementById('cameraVideo'), placeholder=document.getElementById('cameraPlaceholder');
 try{
  const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720},frameRate:{ideal:30}},audio:false});
  video.srcObject=stream; video.playsInline=true; video.muted=true; await video.play();
  video.style.display='block'; if(placeholder)placeholder.style.display='none';
  if(!('BarcodeDetector' in window)){toast('QR camera is ready. This browser does not expose QR detection.');return}
  let detector;
  try{detector=new BarcodeDetector({formats:['qr_code']})}catch{detector=new BarcodeDetector()}
  const loop=async()=>{
    if(!video.srcObject)return;
    try{
      const codes=await detector.detect(video);
      const qr=codes.find(x=>x.rawValue);
      if(qr){ stopCamera(); play('scan'); onResult(qr.rawValue); return; }
    }catch{}
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
 }catch(e){if(placeholder)placeholder.style.display='grid';toast('Please allow camera access.')}
}
function stopCamera(){const v=document.getElementById('cameraVideo');v?.srcObject?.getTracks().forEach(t=>t.stop());if(v)v.srcObject=null}
function parseQR(raw){
 try{
  const x=JSON.parse(raw);
  if(x.collection && x.piece) return {collection:String(x.collection),piece:Number(x.piece),points:Number(x.points||COLLECTIONS[x.collection]?.pointsPerPiece||0)};
 }catch{}
 const m=String(raw).match(/^BARAMEEL\|([^|]+)\|(\d+)(?:\|(\d+))?/i);
 if(m)return {collection:m[1],piece:Number(m[2]),points:Number(m[3]||COLLECTIONS[m[1]]?.pointsPerPiece||0)};
 return null;
}
function toast(msg){let e=document.querySelector('.toast');if(!e){e=document.createElement('div');e.className='toast';document.body.appendChild(e)}e.textContent=msg;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('show'),1800)}

function distanceM(a,b){
 const R=6371000, p=Math.PI/180, dLat=(b.lat-a.lat)*p,dLon=(b.lng-a.lng)*p;
 const x=Math.sin(dLat/2)**2+Math.cos(a.lat*p)*Math.cos(b.lat*p)*Math.sin(dLon/2)**2;
 return 2*R*Math.asin(Math.sqrt(x));
}
function locateToCheckpoint(id,done){
 const cp=CHECKPOINTS.find(x=>x.id===id)||CHECKPOINTS[0];
 if(!navigator.geolocation){done({cp,meters:null});return}
 navigator.geolocation.getCurrentPosition(pos=>done({cp,meters:distanceM({lat:pos.coords.latitude,lng:pos.coords.longitude},cp)}),()=>done({cp,meters:null}),{enableHighAccuracy:true,timeout:8000,maximumAge:30000})
}
function init(){
 const page=document.body.dataset.page;
 const key=selected();
 if(page==='start')hotspot('startBtn',()=>go('screen02.html'));
 if(page==='select'){
   const k=qs('runner',key); selectRunner(k);
   const confirm=document.getElementById('confirm');
   document.querySelectorAll('[data-runner]').forEach(e=>e.addEventListener('click',()=>{const r=e.dataset.runner;selectRunner(r);play('select',r);loadArt('art',`./assets/screen02-${r}.png`);}));
   if(confirm)confirm.onclick=()=>{play('success');go('screen03.html')};
   loadArt('art',`./assets/screen02-${key}.png`);
 }
 if(page==='confirm'){
   loadArt('art',`./assets/screen03-${key}.png`);
   hotspot('continue',()=>{play('success');go('screen04.html')});
 }
 if(page==='home'){
   loadArt('art',`./assets/screen04-${key}.png`);
   setText('points',format(totalPoints()));
   const c=getPieces('collection01');setText('pieces',`${c.length} / 9`);
   hotspot('scan',()=>go('screen05.html'));
   hotspot('hunt',()=>go('screen08.html'));
   hotspot('leaderboard',()=>go('screen09.html'));
   hotspot('redeem',()=>go('screen10.html'));
   hotspot('how',()=>toast('Scan checkpoints, collect puzzle pieces, build collections, and redeem rewards.'));
 }
 if(page==='scan'){
   loadArt('art','./assets/screen05-scanner.png');
   hotspot('back',()=>back('screen04.html'));
   hotspot('openCamera',async()=>{play('scan');await startQRScanner(raw=>{
     const data=parseQR(raw); if(!data){toast('This is not a BARAMEEL checkpoint QR.');return}
     sessionStorage.setItem('lastQR',JSON.stringify(data));go('screen06.html')
   })});
 }
 if(page==='puzzle'){
   loadArt('art','./assets/screen06-puzzle.png');
   const raw=sessionStorage.getItem('lastQR'); let data=null;try{data=JSON.parse(raw)}catch{}
   if(!data){toast('No scanned checkpoint found.');return}
   const meta=COLLECTIONS[data.collection]||{name:data.collection,total:9,pointsPerPiece:data.points||0};
   const c=addPiece(data.collection,data.piece,data.points||meta.pointsPerPiece);
   setText('collectionName',meta.name||data.collection);
   setText('pieceCount',`${c.pieces.length} / ${meta.total}`);
   setText('pieceNumber',String(data.piece).padStart(2,'0'));
   setText('piecePoints',`+${format(data.points||meta.pointsPerPiece)} POINTS`);
   for(let i=1;i<=9;i++){const slot=document.getElementById(`piece-${i}`);if(slot){slot.classList.toggle('collected',c.pieces.includes(i)); if(c.pieces.includes(i))slot.src=`./assets/collections/${data.collection}/pieces/collection01-piece-${String(i).padStart(2,'0')}.png`;}}
   play('success');
   hotspot('nice',()=>{play('nav'); if(allCollected(data.collection))go('screen10.html'); else go('screen04.html')});
 }
 if(page==='next'){
   loadArt('art','./assets/screen07-next-checkpoint.png');
   const id=qs('id','CP01'); locateToCheckpoint(id,r=>{
     setText('distance',r.meters==null?'—':`${Math.round(r.meters)} M`);
     setText('checkpoint',r.cp.name.toUpperCase());
   });
   hotspot('back',()=>back('screen04.html'));
 }
 if(page==='hunt'){
   loadArt('art','./assets/screen08-checkpoint-hunt.png');
   const p=getPieces('collection01');setText('collected',`${p.length} / 9`);
   for(let i=1;i<=9;i++){const s=document.getElementById(`hunt-${i}`);if(s)s.classList.toggle('on',p.includes(i))}
   hotspot('back',()=>back('screen04.html'));
   hotspot('next',()=>go('screen07.html?id=CP01'));
 }
 if(page==='leaderboard'){
   loadArt('art','./assets/screen09-leaderboard.png');
   setText('myPoints',format(totalPoints()));setText('myRank','#07');
   hotspot('back',()=>back('screen04.html'));
 }
 if(page==='redeem'){
   loadArt('art','./assets/screen10-redeem.png');
   setText('balance',format(totalPoints()));
   const unlocked=allCollected('collection01');setText('collectionStatus',unlocked?'COLLECTION COMPLETE':'COMPLETE THE COLLECTION');
   document.querySelectorAll('[data-reward]').forEach(e=>e.addEventListener('click',()=>{
     const cost=Number(e.dataset.reward); if(totalPoints()<cost){toast('Not enough points yet.');return}
     if(!unlocked){toast('Complete the 9-piece collection first.');return}
     play('success');toast('REWARD UNLOCKED!');
   }));
   hotspot('back',()=>back('screen04.html'));
 }
 installTouch();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
