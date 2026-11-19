'use strict';
(function(){
'use strict';

/* ============ 防破解：随机源 / 存档签名 / 反调试 ============ */
const _crypto = (window.crypto || window.msCrypto);
const _rbuf = new Uint32Array(1);
function RND(){
  if(_crypto && _crypto.getRandomValues){
    _crypto.getRandomValues(_rbuf);
    return _rbuf[0] / 4294967296;
  }
  return Math.random();          // 老浏览器兜底
}

const _SK = 'dj' + '9x3k' + 'v12';
function _sig(str){
  let h1 = 0x811c9dc5 >>> 0, h2 = 0x1000193 >>> 0;
  for(let i = 0; i < str.length; i++){
    const c = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
    h2 = (Math.imul(h2 + c, 2654435761) >>> 0);
  }
  return h1.toString(36) + '.' + h2.toString(36);
}
function seal(d){ return {d, s:_sig(_SK + JSON.stringify(d) + _SK)}; }
function unseal(o){
  if(!o || typeof o !== 'object' || !o.d || !o.s) return null;
  return _sig(_SK + JSON.stringify(o.d) + _SK) === o.s ? o.d : null;
}

let TAMPER = false;          // 一旦判定作弊，本局成绩作废
function tripwire(){
  if(document.hidden) return;
  const t = Date.now();
  // eslint-disable-next-line no-debugger
  debugger;
  if(Date.now() - t > 500) TAMPER = true;      // 只有明显被断点拦住才算
}
setInterval(tripwire, 3500);


/* ================= 灵根 ================= */
const RARITY = [
  {id:'fangu',   name:'凡骨·无灵根', p:62,     color:'#8b8197', odds:'六成的人，终生无灵根',
   atk:15, spell:0,  hp:110, mp:0,  dr:0.50, selfDrain:1, desperate:true, extraPills:2,
   desc:'没有灵力，用不了法术，肉身每回合自行损耗。\n但凡人有一种东西修士没有——气血见底时，反而更狠。'},
  {id:'xia',     name:'下品灵根', p:25,     color:'#7f8f7a', odds:'四个人里有一个',
   atk:10, spell:20, hp:100, mp:8,  dr:0.48,
   desc:'勉强能引气入体。法术粗浅，但总归比凡人多一条路。'},
  {id:'zhong',   name:'中品灵根', p:8,      color:'#6f9fb8', odds:'十二个人里有一个',
   atk:12, spell:24, hp:105, mp:10, dr:0.46,
   desc:'资质中上。放在寻常宗门，算个内门弟子。'},
  {id:'shang',   name:'上品灵根', p:3.2,    color:'#8f7fc4', odds:'三十个人里有一个',
   atk:14, spell:27, hp:110, mp:12, dr:0.44,
   desc:'万里挑一的资质，宗门会抢。'},
  {id:'jipin',   name:'极品灵根', p:1.2,    color:'#c9a227', odds:'八十人里有一个（百里挑一）',
   atk:16, spell:30, hp:115, mp:14, dr:0.42, respect:true,
   desc:'天生道种。你出生那天，山门的老钟自己响了。'},
  {id:'tian',    name:'天灵根',   p:0.4,    color:'#e0b34a', odds:'二百五十人里有一个',
   atk:18, spell:34, hp:120, mp:16, dr:0.40, respect:true,
   desc:'天道偏心。你呼吸就是修行。'},
  {id:'bianyi',  name:'变异灵根', p:0.15,   color:'#5fd0b0', odds:'六百七十人里有一个（千里挑一）',
   atk:19, spell:36, hp:122, mp:18, dr:0.39, respect:true,
   desc:'五行之外多出来的一根。没人教过你，也没人能教你。'},
  {id:'hundun',  name:'混沌道体', p:0.04,   color:'#d4544a', odds:'两千五百人里有一个（万里挑一）',
   atk:21, spell:40, hp:126, mp:20, dr:0.36, respect:true,
   desc:'五行不入你身，天劫在你眼里只是天气。'},
  {id:'daotai',  name:'先天道胎', p:0.008,  color:'#f0e6ff', odds:'一万二千五百人里有一个',
   atk:23, spell:44, hp:129, mp:22, dr:0.33, respect:true,
   desc:'你不曾出生，你是被天地"显化"出来的。'},
  {id:'wugou',   name:'无垢仙体', p:0.001,  color:'#9fe8ff', odds:'十万人里有一个（十万里挑一）',
   atk:25, spell:48, hp:132, mp:24, dr:0.30, respect:true,
   desc:'生来不带一丝尘。劫雷落在你身上，会自己散开。'},
  {id:'tiandao', name:'天道之子', p:0.0001, color:'#ffd76a', odds:'百万人里有一个',
   atk:28, spell:54, hp:136, mp:28, dr:0.26, respect:true,
   desc:'天不是你的敌人。天是你的父亲。'},
  {id:'hongmeng',name:'鸿蒙道体', p:0.00001,color:'#ffffff', odds:'千万人里有一个',
   atk:32, spell:60, hp:140, mp:32, dr:0.22, respect:true,
   desc:'你不是来渡劫的。\n你是来看看这方天地还够不够结实。'}
];

/* 结局表在 endings.js 里（199 种） */

/* ================= 敌人 ================= */
const WAVES = [
  {name:'劫云',   hp:39, seq:[['atk',8],['atk',8],['charge',0],['atk',15],['atk',7]], talk:'cloud'},
  {name:'心魔',   hp:53, seq:[['atk',7],['guard',8],['atk',12],['charge',0],['atk',17],['atk',6]], talk:'demon'},
  {name:'天雷',   hp:71, seq:[['atk',9],['charge',0],['atk',18],['atk',8],['guard',10],['atk',13],['charge',0],['atk',20]], talk:'thunder'}
];
const ENRAGE_FROM = 5, ENRAGE_STEP = 0.09, ENRAGE_CAP = 2.3, ATK_MULT = 1.95;
const BASE_SEQ = WAVES.map(w => w.seq.map(x => x.slice()));   // 每次开局还原，防止拒绝选项永久加成

/* ================= 台词 ================= */
/* 心魔：照着现实里最疼的地方扎，但不碰政治与色情 */
const LINES = {
  demon_start: [
    '又来了一个。上一个也是这样看着我的。',
    '你身上有股味道——是怕。',
    '别急着动手。先想想，你凭什么觉得自己能过去。',
    '你这副样子，我见过太多次了。'
  ],
  demon_guard: [
    '躲？躲到几时？',
    '护体护得住皮，护不住心。',
    '你把头埋起来，就当雷看不见你了？',
    '你连挨一下都不敢，还想渡劫？'
  ],
  demon_pill: [
    '吃药？药救得了伤，救不了你。',
    '你吞下去的每一颗丹，都在告诉我你有多怕死。',
    '你连疼都受不了。'
  ],
  demon_talis: [
    '借外力压我？你压住的只是你自己。',
    '符是好东西。可惜用符的人不行。'
  ],
  demon_low: [
    '气血都散了吧。手抖成这样，还想结印？',
    '你听见没有？你自己的心跳，乱了。',
    '再撑两回合。我赌你撑不到。',
    '现在认输，还能留条命回去。'
  ],
  demon_hit: [
    '疼吗？疼就对了。',
    '这一下，你师父没教过你吧。',
    '你以为你在修行？你只是在躲。'
  ],
  demon_charge: [
    '站好了。别动。',
    '让我看看，你还有什么招。',
    '这一下，我用了三成力。'
  ],
  demon_kill: [
    '……有点意思。',
    '你打死的是我的壳。',
    '别高兴。我还有很多张脸。'
  ],
  /* 现实世界的刀 */
  demon_real: [
    '你上个月的工资，够买这具肉身吗？',
    '她走的那天，你连一句重话都没敢说。',
    '你同学的孩子都会打酱油了，你还在改命。',
    '朋友圈里那个买房的人，当年成绩不如你。',
    '你被优化那天，HR 的语气比我还温柔。',
    '你妈问你过得好不好，你说挺好的。',
    '你上一次睡够六个小时，是什么时候？',
    '你说你在等一个机会。你等了几年了？',
    '你怕的不是死。你怕的是死了也没人在意。',
    '你攒的那点钱，够你病一次吗？'
  ],
  /* 跪舔：遇到高资质就换脸 */
  demon_respect: [
    '仙长……方才多有冒犯，小的该死。',
    '道爷这身骨相，小的不敢直视。',
    '您这样的资质，何苦来渡这劫？说一声，小的自己散了。',
    '小道有眼无珠，您别跟小道一般见识。',
    '仙长饶命。小的给您磕一个。'
  ],
  /* 凡骨：踩 */
  demon_sneer: [
    '凡骨也配站在这里？',
    '你连灵力都没有，拿什么跟我谈道？',
    '你这身子，一碰就碎。'
  ],
  seduce: [
    '放下剑。我让你不必再怕任何天劫。',
    '你修这道，是为了长生，还是为了不再被人踩？我都给你。',
    '跟我走。你受过的所有委屈，我替你讨回来。',
    '你不必再努力了。真的。'
  ],
  thunder: [
    '轰——',
    '……',
    '天道已记下你的名字。'
  ]
};

/* ================= 存档 ================= */
const SAVE_KEY = 'dujie_save_v2';
const DEFAULT_SAVE = {stones:0, pills:0, talis:0, endings:{}, roots:{}, runs:0, best:0, board:[], rolls:0, rollDay:'',
  arts:[], equip:[], unlockedRoots:[], selectedRoot:null, friends:[], borrowed:false, borrowedArt:null,
  borrowedFrom:'', worldDate:'', worldScore:0, name:'无名道友', legacy:0,
  zhou:null, blood:null, ident:null, fanguLv:0, loseStreak:0, bloodSeen:{}, identSeen:{},
  realm:0, deaths:0, possessed:[], array:null, help:0, dayRuns:0, dayKey:'',
  quotes:[], renjian:false};
let SAVE = loadSave();
function loadSave(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if(!raw) return {...DEFAULT_SAVE};
    let s = JSON.parse(raw);
    if(s && s.s && s.d){                       // 新格式：带签名
      const d = unseal(s);
      if(!d){ TAMPER = true; return {...DEFAULT_SAVE}; }
      s = d;
    } else if(s){                              // 旧格式 / 无签名：视为被改过
      try{ localStorage.removeItem(SAVE_KEY); }catch(e){}
      return {...DEFAULT_SAVE};   // 重置成新档，不牵连本局
    }
    Object.keys(DEFAULT_SAVE).forEach(k => { if(s[k] === undefined) s[k] = DEFAULT_SAVE[k]; });
    const today = new Date().toISOString().slice(0,10);
    if(s.rollDay !== today){ s.rollDay = today; s.rolls = 0; }
    return s;
  }catch(e){ return {...DEFAULT_SAVE}; }
}
function saveNow(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(seal(SAVE))); }catch(e){} }

/* ================= 工具 ================= */
const $ = id => document.getElementById(id);
const rnd = (a,b) => a + RND()*(b-a);
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const pick = a => a[Math.floor(RND()*a.length)];
function hasMod(m){ return !!(S.trial && S.trial.mods && S.trial.mods.indexOf(m) >= 0); }
function enrageStart(){ return hasMod('solitude') ? 3 : ENRAGE_FROM; }
function enrageOf(t){ return Math.min(ENRAGE_CAP, 1 + Math.max(0, t - enrageStart()) * ENRAGE_STEP); }
function show(id){ ['s-gacha','s-prep','s-battle','s-offer','s-result','s-dex','s-cave','s-card','s-defy','s-event','s-enlighten','s-possess'].forEach(s =>
  $(s).classList.toggle('hidden', s !== id)); }
function toast(msg){
  const d = document.createElement('div'); d.className = 'toast'; d.textContent = msg;
  document.body.appendChild(d); setTimeout(()=>d.remove(), 1800);
}

/* ================= 音效（合成，无外部资源） ================= */
let AC = null;
function audio(){ if(!AC){ try{ AC = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } return AC; }
function sfx(type){
  const ac = audio(); if(!ac) return;
  const t = ac.currentTime;
  const g = ac.createGain(); g.connect(ac.destination);
  if(type === 'hit'){
    const o = ac.createOscillator(); o.type='square'; o.frequency.setValueAtTime(220,t);
    o.frequency.exponentialRampToValueAtTime(90,t+0.12);
    g.gain.setValueAtTime(0.05,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.13);
    o.connect(g); o.start(t); o.stop(t+0.14);
  } else if(type === 'hurt'){
    const o = ac.createOscillator(); o.type='sawtooth'; o.frequency.setValueAtTime(120,t);
    o.frequency.exponentialRampToValueAtTime(50,t+0.25);
    g.gain.setValueAtTime(0.09,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.26);
    o.connect(g); o.start(t); o.stop(t+0.27);
  } else if(type === 'win'){
    [523,659,784,1047].forEach((f,i)=>{
      const o = ac.createOscillator(), gg = ac.createGain();
      o.type='sine'; o.frequency.value=f;
      gg.gain.setValueAtTime(0.0001,t+i*0.11);
      gg.gain.exponentialRampToValueAtTime(0.07,t+i*0.11+0.02);
      gg.gain.exponentialRampToValueAtTime(0.0001,t+i*0.11+0.3);
      o.connect(gg); gg.connect(ac.destination); o.start(t+i*0.11); o.stop(t+i*0.11+0.32);
    });
  }
}

/* ================= 粒子 ================= */
const fx = $('fx'), fxc = fx.getContext('2d');
let parts = [];
function resizeFx(){ fx.width = innerWidth; fx.height = innerHeight; }
resizeFx(); addEventListener('resize', resizeFx);
function burst(x, y, color, n = 22, spread = 4.5){
  for(let i=0;i<n;i++){
    const a = RND()*Math.PI*2, sp = rnd(1, spread);
    parts.push({x, y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp-1, life:1, color, r:rnd(1.2,3.2)});
  }
}
(function tickFx(){
  fxc.clearRect(0,0,fx.width,fx.height);
  parts = parts.filter(p => p.life > 0);
  for(const p of parts){
    p.x += p.vx; p.y += p.vy; p.vy += 0.09; p.vx *= 0.99; p.life -= 0.017;
    fxc.globalAlpha = Math.max(0, p.life);
    fxc.fillStyle = p.color;
    fxc.beginPath(); fxc.arc(p.x, p.y, Math.max(0.1, p.r*Math.max(0,p.life)), 0, 7); fxc.fill();
  }
  fxc.globalAlpha = 1;
  requestAnimationFrame(tickFx);
})();

/* ================= 场景渲染（水墨立绘） ================= */
const cv = $('foeCanvas');
let cx = cv.getContext('2d');
const F = {wave:0, hit:0, atk:0, boom:0, speak:0, hpPct:1, t:0, tint:null, hurt:0, dpr:1, artMode:false};

/* 关卡背景贴图：加载成功则切换成"贴图模式"，canvas 只画特效 */
function useArt(id){
  const stage = $('stage');
  const url = 'art/' + id + '.jpg?v=2';
  stage.style.backgroundImage = 'none';
  F.artMode = false;
  const img = new Image();
  img.onload = () => {
    if(!S || !S.trial || S.trial.id !== id) return;
    stage.style.backgroundImage = `linear-gradient(rgba(4,10,9,.28) 0%, rgba(4,10,9,.45) 52%, rgba(4,10,9,.86) 100%), url('${url}')`;
    stage.style.backgroundSize = 'cover';
    stage.style.backgroundPosition = 'center';
    F.artMode = true;
  };
  img.src = url;
}

const STARS = (() => {
  const a = [];
  for(let i=0;i<70;i++) a.push({x:RND(), y:RND()*0.55, r:rnd(0.4,1.5), p:rnd(0,6.28)});
  return a;
})();

function sceneSize(){
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = cv.clientWidth || 320, h = cv.clientHeight || 320;
  if(cv.width !== Math.round(w*dpr) || cv.height !== Math.round(h*dpr)){
    cv.width = Math.round(w*dpr); cv.height = Math.round(h*dpr);
    F.dpr = dpr;
  }
  cx.setTransform(dpr,0,0,dpr,0,0);
  return {W:w, H:h};
}

function bgSky(W,H,t){
  const g = cx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#050b0b');
  g.addColorStop(.35,'#0a1a19');
  g.addColorStop(.62,'#102523');
  g.addColorStop(1,'#060d0c');
  cx.fillStyle=g; cx.fillRect(0,0,W,H);

  // 星
  STARS.forEach(s=>{
    const tw = .35 + Math.abs(Math.sin(t*.8 + s.p))*.6;
    cx.globalAlpha = tw*.8;
    cx.fillStyle = '#dfe6ff';
    cx.beginPath(); cx.arc(s.x*W, s.y*H, s.r, 0, 7); cx.fill();
  });
  cx.globalAlpha = 1;

  // 月
  const mx = W*.78, my = H*.16, mr = Math.min(W,H)*.075;
  const mg = cx.createRadialGradient(mx,my,mr*.2,mx,my,mr*3.4);
  mg.addColorStop(0,'rgba(255,248,220,.55)');
  mg.addColorStop(.25,'rgba(240,230,200,.16)');
  mg.addColorStop(1,'rgba(240,230,200,0)');
  cx.fillStyle=mg; cx.beginPath(); cx.arc(mx,my,mr*3.4,0,7); cx.fill();
  cx.fillStyle='rgba(252,246,226,.92)';
  cx.beginPath(); cx.arc(mx,my,mr,0,7); cx.fill();
}

function mountain(W,H,baseY,amp,alpha,color,seedOffset,t,speed){
  cx.save();
  cx.globalAlpha = alpha;
  cx.fillStyle = color;
  cx.beginPath();
  cx.moveTo(0,H);
  for(let x=0;x<=W;x+=6){
    const k = (x/W)*4 + seedOffset + t*speed;
    const y = baseY - amp*(Math.sin(k)*.5 + Math.sin(k*2.3+1.7)*.28 + Math.sin(k*4.1+3.1)*.14);
    cx.lineTo(x,y);
  }
  cx.lineTo(W,H); cx.closePath(); cx.fill();
  cx.restore();
}

function moonbeam(W,H){
  const mx = W*.78, my = H*.16;
  cx.save();
  cx.globalCompositeOperation = 'lighter';
  const g = cx.createLinearGradient(mx, my, mx-W*.5, H);
  g.addColorStop(0,'rgba(200,220,255,.09)');
  g.addColorStop(.55,'rgba(170,200,255,.05)');
  g.addColorStop(1,'rgba(170,200,255,0)');
  cx.fillStyle = g;
  cx.beginPath();
  cx.moveTo(mx-18, my-14);
  cx.lineTo(mx+18, my-14);
  cx.lineTo(mx-W*.28, H);
  cx.lineTo(mx-W*.62, H);
  cx.closePath(); cx.fill();
  cx.restore();
}

function drawCliff(W,H,t){
  cx.fillStyle = '#08070d';
  cx.beginPath();
  cx.moveTo(0,H);
  cx.lineTo(0,H*.86);
  cx.bezierCurveTo(W*.12,H*.83, W*.2,H*.88, W*.34,H*.86);
  cx.bezierCurveTo(W*.46,H*.845, W*.56,H*.9, W*.66,H*.93);
  cx.bezierCurveTo(W*.78,H*.96, W*.9,H*.92, W,H*.95);
  cx.lineTo(W,H);
  cx.closePath(); cx.fill();
  // 崖边微光
  cx.strokeStyle='rgba(140,170,220,.14)'; cx.lineWidth=1;
  cx.beginPath();
  cx.moveTo(0,H*.86);
  cx.bezierCurveTo(W*.12,H*.83, W*.2,H*.88, W*.34,H*.86);
  cx.bezierCurveTo(W*.46,H*.845, W*.56,H*.9, W*.66,H*.93);
  cx.stroke();
}

function mistBand(W,H,y,alpha,t,offset){
  cx.save();
  cx.globalAlpha = alpha;
  const g = cx.createLinearGradient(0,y-24,0,y+24);
  g.addColorStop(0,'rgba(180,200,230,0)');
  g.addColorStop(.5,'rgba(180,200,230,.16)');
  g.addColorStop(1,'rgba(180,200,230,0)');
  cx.fillStyle=g;
  cx.fillRect(0,y-24,W,48);
  // 云絮
  for(let i=0;i<7;i++){
    const px = ((i*W/6 + t*6 + offset)%(W+120))-60;
    const r = 42 + (i%3)*16;
    const rg = cx.createRadialGradient(px,y,2,px,y,r*.6);
    rg.addColorStop(0,'rgba(200,215,240,.20)');
    rg.addColorStop(1,'rgba(200,215,240,0)');
    cx.fillStyle=rg; cx.beginPath(); cx.ellipse(px,y,r,r*.22,0,0,7); cx.fill();
  }
  cx.restore();
}

/* 道人：仙风道骨（逐层绘制，带轮廓光） */
function drawImmortal(W,H,t,hurt,pct){
  const s = Math.min(W,H)/260;
  const bob = Math.sin(t*1.15)*2.2*s;
  const bx = W*0.31, by = H*0.885 + bob;
  const sway = Math.sin(t*0.9)*0.02;

  cx.save();
  cx.translate(bx, by);
  cx.rotate(hurt>0 ? -0.06 : sway*0.4);
  cx.scale(s,s);

  const robe = '#101626', robeDark = '#0a0f19';
  const rim = 'rgba(150,195,255,0.55)';

  // 落影（贴图模式下要更实，才锚得住地面）
  const sg = cx.createRadialGradient(0,8,2,0,8,72);
  sg.addColorStop(0,'rgba(0,0,0,.72)'); sg.addColorStop(.55,'rgba(0,0,0,.32)');
  sg.addColorStop(1,'rgba(0,0,0,0)');
  cx.fillStyle=sg; cx.beginPath(); cx.ellipse(0,8,66,13,0,0,7); cx.fill();

  // 脚下灵环
  cx.save();
  cx.globalCompositeOperation='lighter';
  cx.strokeStyle=`rgba(120,180,255,${.16+Math.sin(t*1.8)*.06})`;
  cx.lineWidth=1.6;
  cx.beginPath(); cx.ellipse(0,6,44,9,0,0,7); cx.stroke();
  cx.restore();

  // 身后飘带（三条，长）
  cx.strokeStyle='rgba(130,170,230,.30)'; cx.lineWidth=3.4;
  for(let k=0;k<3;k++){
    const ph = t*1.4 + k*1.9;
    cx.beginPath();
    cx.moveTo(-2,-52+k*5);
    cx.bezierCurveTo(42+Math.sin(ph)*16, -50, 74+Math.sin(ph*1.3)*20, -14, 96+Math.sin(ph*1.1)*16, 14+k*4);
    cx.stroke();
  }

  // 道袍下摆
  cx.fillStyle = robe;
  cx.beginPath();
  cx.moveTo(-16,-56);
  cx.bezierCurveTo(-26,-34, -34,-10, -40+Math.sin(t*1.4)*4, 6);
  cx.bezierCurveTo(-20,10, -8,6, 0,4);
  cx.bezierCurveTo(10,6, 22,10, 42+Math.sin(t*1.4+1)*4, 6);
  cx.bezierCurveTo(36,-10, 28,-34, 18,-56);
  cx.closePath(); cx.fill();

  // 褶皱线
  cx.strokeStyle='rgba(90,120,170,.35)'; cx.lineWidth=1;
  [-9,0,9].forEach((dx,i)=>{
    cx.beginPath(); cx.moveTo(dx,-52);
    cx.bezierCurveTo(dx*1.3,-30, dx*1.5,-6, dx*2+Math.sin(t*1.4+i)*3, 3);
    cx.stroke();
  });

  // 腰带
  cx.strokeStyle='rgba(200,180,140,.55)'; cx.lineWidth=2.6;
  cx.beginPath(); cx.moveTo(-13,-38); cx.lineTo(13,-38); cx.stroke();

  // 左右宽袖
  cx.fillStyle = robe;
  const lsw = Math.sin(t*1.5)*2.5, rsw = Math.cos(t*1.5)*2.5;
  cx.beginPath();
  cx.moveTo(-15,-54);
  cx.bezierCurveTo(-34,-50+lsw, -44,-34, -33,-24+lsw);
  cx.bezierCurveTo(-26,-18, -15,-26, -12,-38);
  cx.closePath(); cx.fill();
  cx.beginPath();
  cx.moveTo(15,-54);
  cx.bezierCurveTo(34,-50+rsw, 42,-36, 31,-26+rsw);
  cx.bezierCurveTo(24,-20, 15,-28, 12,-38);
  cx.closePath(); cx.fill();

  // 袖口描边
  cx.strokeStyle = rim; cx.lineWidth=1.1; cx.globalAlpha=.5;
  cx.beginPath(); cx.moveTo(-33,-24+lsw); cx.quadraticCurveTo(-24,-19,-15,-26); cx.stroke();
  cx.beginPath(); cx.moveTo(31,-26+rsw); cx.quadraticCurveTo(23,-21,14,-28); cx.stroke();
  cx.globalAlpha=1;

  // 脖颈 + 头（侧脸）
  cx.fillStyle = robeDark;
  cx.beginPath(); cx.rect(-4,-58,8,6); cx.fill();
  cx.beginPath(); cx.ellipse(0,-64,7.6,8.4,0,0,7); cx.fill();

  // 发髻 + 簪
  cx.beginPath(); cx.ellipse(-1,-72,5,4.4,0.2,0,7); cx.fill();
  cx.strokeStyle='rgba(225,235,255,.85)'; cx.lineWidth=1.3;
  cx.beginPath(); cx.moveTo(-8,-73.5); cx.lineTo(8,-71.5); cx.stroke();
  // 发丝
  cx.strokeStyle='rgba(30,40,60,.95)'; cx.lineWidth=1.6;
  cx.beginPath(); cx.moveTo(-5,-70); cx.quadraticCurveTo(-12,-62,-10,-52); cx.stroke();
  cx.beginPath(); cx.moveTo(-3,-70); cx.quadraticCurveTo(-9,-58,-7,-50); cx.stroke();

  // 面部轮廓光
  cx.strokeStyle='rgba(190,220,255,.6)'; cx.lineWidth=1;
  cx.beginPath(); cx.arc(0,-64,7.6,-1.5,0.5); cx.stroke();

  // 手持长剑（剑尖向下，斜握）
  cx.save();
  cx.translate(20,-34); cx.rotate(0.42 + Math.sin(t*1.2)*0.01);
  cx.strokeStyle='rgba(205,225,255,.75)'; cx.lineWidth=2.4;
  cx.beginPath(); cx.moveTo(0,-16); cx.lineTo(0,30); cx.stroke();
  const sw = .35 + Math.sin(t*3.2)*.15;
  cx.strokeStyle=`rgba(160,200,255,${sw})`; cx.lineWidth=6;
  cx.beginPath(); cx.moveTo(0,-10); cx.lineTo(0,26); cx.stroke();
  cx.strokeStyle=`rgba(230,245,255,${sw+.2})`; cx.lineWidth=1;
  cx.beginPath(); cx.moveTo(0,-12); cx.lineTo(0,28); cx.stroke();
  // 剑格 + 柄
  cx.strokeStyle='rgba(230,200,130,.8)'; cx.lineWidth=2.4;
  cx.beginPath(); cx.moveTo(-6,-16); cx.lineTo(6,-16); cx.stroke();
  cx.beginPath(); cx.moveTo(0,-16); cx.lineTo(0,-24); cx.stroke();
  cx.restore();

  // 场景反射光（暖金，压在下缘）
  cx.save();
  cx.globalCompositeOperation='lighter';
  const wg = cx.createLinearGradient(0,-30,0,10);
  wg.addColorStop(0,'rgba(200,160,90,0)');
  wg.addColorStop(1,'rgba(200,160,90,.16)');
  cx.fillStyle=wg;
  cx.beginPath(); cx.moveTo(-18,-30); cx.lineTo(18,-30); cx.lineTo(30,6); cx.lineTo(-30,6); cx.closePath(); cx.fill();
  cx.restore();

  // 全身轮廓光（左缘）
  cx.globalCompositeOperation='lighter';
  cx.strokeStyle='rgba(120,175,255,.30)'; cx.lineWidth=1.6;
  cx.beginPath();
  cx.moveTo(-15,-55);
  cx.bezierCurveTo(-26,-44,-32,-20,-34,4);
  cx.stroke();
  const og = cx.createRadialGradient(0,-46,6,0,-46,58);
  og.addColorStop(0,'rgba(110,160,255,.10)');
  og.addColorStop(1,'rgba(110,160,255,0)');
  cx.fillStyle=og; cx.beginPath(); cx.arc(0,-46,58,0,7); cx.fill();
  cx.globalCompositeOperation='source-over';

  if(hurt>0){
    cx.globalAlpha = Math.min(.5, hurt);
    cx.fillStyle='#a12a2a';
    cx.beginPath(); cx.ellipse(0,-34,24,34,0,0,7); cx.fill();
    cx.globalAlpha=1;
  }
  cx.restore();

  if(pct < 0.35){
    cx.strokeStyle = `rgba(200,80,70,${.22+Math.sin(t*6)*.1})`;
    cx.lineWidth=1;
    cx.beginPath(); cx.arc(bx, by-50*s, 28*s, 0, 7); cx.stroke();
  }

  // 脚边雾气：把人"焊"进贴图里，不再像贴纸
  cx.save();
  cx.globalCompositeOperation = 'lighter';
  for(let i=0;i<3;i++){
    const r = (46 + i*22)*s;
    const y = by + 4 - i*3;
    const mg = cx.createRadialGradient(bx, y, 2, bx, y, r);
    mg.addColorStop(0, 'rgba(180,200,220,.10)');
    mg.addColorStop(1, 'rgba(180,200,220,0)');
    cx.fillStyle = mg;
    cx.beginPath(); cx.ellipse(bx, y, r, r*0.24, 0, 0, 7); cx.fill();
  }
  cx.restore();

  // 右侧冷光（来自敌人方向的逆光）
  cx.save();
  cx.globalCompositeOperation = 'lighter';
  cx.strokeStyle = 'rgba(150,200,255,.20)';
  cx.lineWidth = 1.4;
  cx.beginPath();
  cx.moveTo(bx + 15*s, by - 56*s);
  cx.bezierCurveTo(bx + 30*s, by - 40*s, bx + 34*s, by - 12*s, bx + 26*s, by + 2*s);
  cx.stroke();
  cx.restore();
}

/* 崖边松枝 */
function drawPine(W,H,t){
  cx.save();
  cx.strokeStyle='rgba(6,6,10,.95)'; cx.lineWidth=3;
  cx.beginPath();
  cx.moveTo(W*0.055,H);
  cx.bezierCurveTo(W*0.07,H*.84, W*0.045,H*.72, W*0.08,H*.62);
  cx.stroke();
  cx.lineWidth=1.4;
  // 针叶簇
  for(let i=0;i<14;i++){
    const nx = W*0.045 + (i*7.3)%(W*0.075), ny = H*0.60 + (i*11)%(H*0.16);
    cx.beginPath();
    cx.moveTo(nx,ny);
    cx.lineTo(nx+8, ny-4+Math.sin(t*1.6+i)*1.2);
    cx.stroke();
  }
  for(let i=0;i<4;i++){
    const y = H*.66 + i*H*.055;
    const x = W*0.07 + i*2;
    const len = (34-i*6)*Math.min(W,H)/320;
    cx.beginPath();
    cx.moveTo(x,y);
    cx.quadraticCurveTo(x+len*.6, y-6, x+len, y-2+Math.sin(t*1.2+i)*1.5);
    cx.stroke();
  }
  cx.restore();
}

/* 崖石 */
function drawRock(W,H){
  cx.fillStyle='#07060b';
  cx.beginPath();
  cx.moveTo(W*0.86,H);
  cx.lineTo(W*0.88,H*.90);
  cx.bezierCurveTo(W*0.90,H*.86, W*0.95,H*.88, W,H*.87);
  cx.lineTo(W,H);
  cx.closePath(); cx.fill();
  cx.strokeStyle='rgba(130,160,210,.16)'; cx.lineWidth=1;
  cx.beginPath(); cx.moveTo(W*0.88,H*.90); cx.bezierCurveTo(W*0.90,H*.86, W*0.95,H*.88, W,H*.87); cx.stroke();
}

function bolt(x1,y1,x2,y2,depth,alpha,width){
  const seg = 7, pts=[[x1,y1]];
  for(let i=1;i<seg;i++){
    const k=i/seg;
    pts.push([x1+(x2-x1)*k + rnd(-16,16), y1+(y2-y1)*k + rnd(-12,12)]);
  }
  pts.push([x2,y2]);
  cx.save();
  cx.globalAlpha = alpha;
  cx.strokeStyle = '#e8eeff';
  cx.lineWidth = width || 2.4;
  cx.shadowColor = '#9fb6ff'; cx.shadowBlur = 22;
  cx.beginPath(); cx.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++) cx.lineTo(pts[i][0],pts[i][1]);
  cx.stroke();
  cx.lineWidth = (width||2.4) * 0.45;
  cx.strokeStyle = '#ffffff'; cx.stroke();
  if(depth>0) bolt(x2,y2, x2+rnd(-46,46), y2+rnd(12,44), depth-1, alpha*0.55, (width||2.4)*0.7);
  cx.restore();
}

function drawCloud(W,H){
  const t=F.t;
  // 云团：三层，越靠下越暗
  const blobs=[[.50,.42,60,.9],[.30,.50,44,.75],[.70,.50,46,.75],[.42,.31,40,.65],
               [.60,.34,36,.6],[.5,.58,34,.7],[.22,.40,26,.5],[.78,.40,26,.5]];
  blobs.forEach(([x,y,r,k],i)=>{
    const px=W*x+Math.sin(t*.7+i*1.7)*11, py=H*y+Math.cos(t*.55+i*1.1)*8;
    const g=cx.createRadialGradient(px,py,2,px,py,r);
    g.addColorStop(0,`rgba(140,128,176,${.58*k})`);
    g.addColorStop(.5,`rgba(62,46,88,${.5*k})`);
    g.addColorStop(1,'rgba(14,9,22,0)');
    cx.fillStyle=g; cx.beginPath(); cx.arc(px,py,r,0,7); cx.fill();
  });
  // 雨幕
  cx.save();
  cx.strokeStyle='rgba(150,165,210,.22)'; cx.lineWidth=1;
  for(let i=0;i<22;i++){
    const rx=((i*61 + t*220)%(W+60))-30;
    const ry=((i*43 + t*420)%(H+80))-40;
    cx.beginPath(); cx.moveTo(rx,ry); cx.lineTo(rx-5,ry+18); cx.stroke();
  }
  cx.restore();
  // 眼：光柱 + 瞳孔
  const ex=W/2, ey=H*.46;
  [-17,17].forEach(dx=>{
    const gl=cx.createRadialGradient(ex+dx,ey,1,ex+dx,ey,20);
    gl.addColorStop(0,'rgba(255,236,200,.98)');
    gl.addColorStop(.35,'rgba(240,110,80,.8)');
    gl.addColorStop(1,'rgba(240,110,80,0)');
    cx.fillStyle=gl; cx.beginPath(); cx.arc(ex+dx,ey,20,0,7); cx.fill();
    cx.fillStyle='rgba(255,245,220,.95)';
    cx.beginPath(); cx.ellipse(ex+dx,ey,2.6,5.2,0,0,7); cx.fill();
  });
  // 闪电
  if(F.charged || F.atk>0 || RND()<0.02) bolt(W*.28,H*.30, W*.55,H*.66, 2, .95, 3);
  if(RND()<0.01) bolt(W*.72,H*.28, W*.58,H*.62, 2, .75, 2);
}

function drawDemon(W,H){
  const t=F.t;
  const sway = Math.sin(t*1.1)*5 + (F.atk>0? F.atk*28:0);
  const breath = 1 + Math.sin(t*1.6)*0.015;
  // 红雾
  const bg=cx.createRadialGradient(W/2,H*.55,8,W/2,H*.55,130);
  bg.addColorStop(0,'rgba(160,40,40,.24)'); bg.addColorStop(1,'rgba(160,40,40,0)');
  cx.fillStyle=bg; cx.fillRect(0,0,W,H);

  cx.save(); cx.translate(sway,0); cx.scale(breath,breath);
  // 双肩 + 头（剪影）
  cx.fillStyle='rgba(12,7,13,.97)';
  cx.beginPath();
  cx.moveTo(W*.5-52, H*.96);
  cx.bezierCurveTo(W*.5-50, H*.60, W*.5-30, H*.53, W*.5-17, H*.50);
  cx.lineTo(W*.5+17, H*.50);
  cx.bezierCurveTo(W*.5+30, H*.53, W*.5+50, H*.60, W*.5+52, H*.96);
  cx.closePath(); cx.fill();
  // 头
  cx.beginPath(); cx.ellipse(W*.5, H*.40, 27, 31, 0, 0, 7); cx.fill();
  // 面具感：眼部暗区
  cx.fillStyle='rgba(40,14,18,.9)';
  cx.beginPath(); cx.ellipse(W*.5, H*.40, 22, 12, 0, 0, 7); cx.fill();
  // 眼
  const glow = 0.7 + Math.sin(t*2.4)*0.2 + (F.speak>0?0.25:0);
  [-10,10].forEach(dx=>{
    const g=cx.createRadialGradient(W*.5+dx, H*.40, 1, W*.5+dx, H*.40, 13);
    g.addColorStop(0,`rgba(255,200,180,${glow})`);
    g.addColorStop(.4,`rgba(232,70,58,${glow*.85})`);
    g.addColorStop(1,'rgba(232,70,58,0)');
    cx.fillStyle=g; cx.beginPath(); cx.arc(W*.5+dx, H*.40, 13, 0, 7); cx.fill();
  });
  // 嘴角（说话时张开）
  cx.strokeStyle=`rgba(200,60,50,${.35 + (F.speak>0?.4:0)})`;
  cx.lineWidth=1.6;
  cx.beginPath();
  cx.arc(W*.5, H*.46, 12 + (F.speak>0?3:0), 0.25*Math.PI, 0.75*Math.PI);
  cx.stroke();
  // 裂纹
  cx.strokeStyle='rgba(220,80,66,.55)'; cx.lineWidth=1.1;
  for(let i=0;i<4;i++){
    const sx=W*.5+rnd(-24,24), sy=H*.34;
    cx.beginPath(); cx.moveTo(sx,sy);
    cx.lineTo(sx+rnd(-14,14), sy+20);
    cx.lineTo(sx+rnd(-16,16), sy+38);
    cx.stroke();
  }
  cx.restore();
  // 影子
  const sh=cx.createRadialGradient(W/2,H*.95,2,W/2,H*.95,80);
  sh.addColorStop(0,'rgba(190,40,30,.3)'); sh.addColorStop(1,'rgba(190,40,30,0)');
  cx.fillStyle=sh; cx.beginPath(); cx.ellipse(W/2,H*.95,80,13,0,0,7); cx.fill();
}

function drawThunder(W,H){
  const t=F.t;
  const pulse = .55 + Math.sin(t*3.6)*.2 + (F.charged?.3:0);
  // 天空裂口
  const g=cx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,`rgba(170,196,255,${.22*pulse})`);
  g.addColorStop(.45,`rgba(130,160,255,${.12*pulse})`);
  g.addColorStop(1,'rgba(130,160,255,0)');
  cx.fillStyle=g; cx.fillRect(W*.26,0,W*.48,H*.82);
  // 主雷 + 分叉
  bolt(W*.5, 4, W*.5, H*.70, 3, .96, 3.4);
  if(RND()<.13) bolt(W*.44,H*.18, W*.56,H*.52, 2, .75, 2);
  if(RND()<.09) bolt(W*.56,H*.12, W*.43,H*.56, 2, .65, 1.8);
  // 冲击波
  const ringR = 60 + (Math.sin(t*2.2)*18);
  cx.strokeStyle=`rgba(200,220,255,${.18*pulse})`; cx.lineWidth=2;
  cx.beginPath(); cx.ellipse(W/2, H*.86, ringR, ringR*0.22, 0, 0, 7); cx.stroke();
  // 地面光斑
  const sh=cx.createRadialGradient(W/2,H*.86,4,W/2,H*.86,100);
  sh.addColorStop(0,`rgba(170,200,255,${.4*pulse})`);
  sh.addColorStop(1,'rgba(170,200,255,0)');
  cx.fillStyle=sh; cx.beginPath(); cx.ellipse(W/2,H*.86,100,18,0,0,7); cx.fill();
}

/* ---- 战斗特效层 ---- */
const FX = [];
function fxSword(){ FX.push({k:'sword', t:0, life:.34}); }
function fxSpell(){ FX.push({k:'spell', t:0, life:.5}); }
function fxBurst(x,y,color,n){ FX.push({k:'burst', t:0, life:.5, x, y, color, n:n||18}); }
function fxSlash(){ FX.push({k:'slash', t:0, life:.3}); }

function drawFX(W,H){
  for(let i=FX.length-1;i>=0;i--){
    const f = FX[i];
    f.t += 0.016/ (f.life||0.4) * 0.4;
    const k = Math.min(1, f.t);
    if(f.k === 'sword'){
      const x0 = W*0.33, y0 = H*0.72, x1 = W*0.58, y1 = H*0.34;
      for(let s=0;s<3;s++){
        const d = Math.max(0, k - s*0.06);
        if(d<=0) continue;
        const px = x0 + (x1-x0)*d, py = y0 + (y1-y0)*d;
        cx.save();
        cx.globalCompositeOperation='lighter';
        cx.strokeStyle = `rgba(200,225,255,${(1-k)*0.9})`;
        cx.lineWidth = 2.4 - s*0.6;
        cx.shadowColor='#9fc4ff'; cx.shadowBlur=18;
        cx.beginPath(); cx.moveTo(px - 26, py + 14); cx.lineTo(px, py); cx.stroke();
        cx.restore();
      }
      if(k>=1) FX.splice(i,1);
    } else if(f.k === 'spell'){
      const x0 = W*0.33, y0 = H*0.70, x1 = W*0.58, y1 = H*0.32;
      const px = x0+(x1-x0)*k, py = y0+(y1-y0)*k;
      cx.save(); cx.globalCompositeOperation='lighter';
      const g = cx.createRadialGradient(px,py,1,px,py,26);
      g.addColorStop(0,'rgba(220,235,255,.95)'); g.addColorStop(.5,'rgba(120,170,255,.55)');
      g.addColorStop(1,'rgba(120,170,255,0)');
      cx.fillStyle=g; cx.beginPath(); cx.arc(px,py,26,0,7); cx.fill(); cx.restore();
      if(k>=1){ fxBurst(x1,y1,'#9fc4ff',22); FX.splice(i,1); }
    } else if(f.k === 'burst'){
      cx.save(); cx.globalCompositeOperation='lighter';
      for(let p=0;p<f.n;p++){
        const a = (p/f.n)*6.283 + f.t*2;
        const r = k*46;
        cx.globalAlpha = (1-k)*0.8;
        cx.fillStyle = f.color;
        cx.beginPath(); cx.arc(f.x+Math.cos(a)*r, f.y+Math.sin(a)*r*0.7, 2.2*(1-k), 0, 7); cx.fill();
      }
      cx.restore();
      if(k>=1) FX.splice(i,1);
    } else if(f.k === 'slash'){
      cx.save(); cx.globalAlpha = (1-k)*0.9; cx.globalCompositeOperation='lighter';
      cx.strokeStyle='#ff8a7a'; cx.lineWidth=3;
      cx.beginPath(); cx.moveTo(W*0.15, H*0.55 + k*20); cx.lineTo(W*0.85, H*0.42 - k*20); cx.stroke();
      cx.restore();
      if(k>=1) FX.splice(i,1);
    }
  }
}

let _lastFrame = 0, bgCache = null, bgKey = '', frameN = 0;
// 低配模式：?lite=1 或检测到低端机 → 只画一次，不做逐帧动画
const LITE = /[?&]lite=1/.test(location.search) ||
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
(function drawLoop(){
  const now = performance.now();
  if(LITE && frameN > 1 && !FX.length){ return; }
  if(now - _lastFrame < (LITE ? 120 : 33)){ return requestAnimationFrame(drawLoop); }
  _lastFrame = now;
  F.t = now/1000;
  const {W,H} = sceneSize();
  const t = F.t;

  if(F.artMode){
    cx.clearRect(0,0,W,H);
    // 贴图只做背景，人物仍然实时绘制（有呼吸、受伤、飘带）
    // 轻微模糊 + 降饱和，让程序画的人贴进水墨背景里
    cx.save();
    cx.filter = 'blur(0.5px) saturate(0.88)';
    drawImmortal(W,H,t,F.hurt,F.hpPct);
    cx.restore();
    drawFX(W,H);
    if(F.hit > 0){
      cx.globalAlpha = F.hit*0.4; cx.fillStyle='#fff'; cx.fillRect(0,0,W,H); cx.globalAlpha=1;
      F.hit -= 0.06;
    }
    if(F.atk > 0) F.atk -= 0.02;
    if(F.speak > 0) F.speak -= 0.01;
    if(F.hurt > 0) F.hurt -= 0.02;
    return requestAnimationFrame(drawLoop);
  }

  // 静态层缓存（每 3 秒重建一次，大幅降低每帧开销）
  if(!bgCache || bgKey !== W+'x'+H || (frameN % 90 === 0)){
    if(!bgCache || bgKey !== W+'x'+H){
      bgCache = document.createElement('canvas');
      bgCache.width = Math.round(W*F.dpr); bgCache.height = Math.round(H*F.dpr);
      bgKey = W+'x'+H;
    }
    const bctx = bgCache.getContext('2d');
    const realCx = cx;
    cx = bctx;
    cx.setTransform(F.dpr,0,0,F.dpr,0,0);
    cx.clearRect(0,0,W,H);
    bgSky(W,H,t);
    mountain(W,H, H*.78, 26, .55, '#16302a', 0.0, t, .012);
    mountain(W,H, H*.72, 34, .70, '#0e201d', 2.1, t, .020);
    mountain(W,H, H*.80, 20, .85, '#07100f', 4.3, t, .030);
    moonbeam(W,H);
    drawCliff(W,H,t);
    drawRock(W,H);
    drawPine(W,H,t);
    cx = realCx;
  }
  frameN++;
  cx.drawImage(bgCache, 0, 0, W, H);
  mistBand(W,H, H*.66, 1.0, t, 0);
  mistBand(W,H, H*.78, .8, -t*1.3, 40);

  // 敌人（画面上方，随关卡换形）
  const ew = Math.min(W*0.62, 300), eh = ew*0.78;
  cx.save();
  cx.translate(W*0.58, H*0.30);
  const shake = F.hit*6;
  cx.translate(rnd(-shake,shake), rnd(-shake,shake));
  cx.scale(ew/260, eh/200);
  cx.translate(-130,-100);
  if(F.wave === 0) drawCloud(260,200);
  else if(F.wave === 1) drawDemon(260,200);
  else drawThunder(260,200);
  cx.restore();

  // 主角
  drawImmortal(W,H,t,F.hurt, F.hpPct);

  drawFX(W,H);

  // 色调
  if(F.tint){
    cx.globalAlpha = 0.10; cx.fillStyle = F.tint; cx.fillRect(0,0,W,H); cx.globalAlpha = 1;
  }

  if(F.hit > 0){
    cx.globalAlpha = F.hit*0.5;
    cx.fillStyle = '#fff'; cx.fillRect(0,0,W,H);
    cx.globalAlpha = 1;
    F.hit -= 0.06;
  }
  if(F.atk > 0) F.atk -= 0.02;
  if(F.speak > 0) F.speak -= 0.01;
  if(F.hurt > 0) F.hurt -= 0.02;
  requestAnimationFrame(drawLoop);
})();

/* ================= 抽灵根 ================= */
let rolled = null;
function rollCost(){ return SAVE.rolls === 0 ? 0 : 30; }

function rollRarity(){
  const total = RARITY.reduce((a, r) => a + r.p, 0);
  let r = RND() * total, acc = 0;
  for(const x of RARITY){ acc += x.p; if(r <= acc) return x; }
  return RARITY[RARITY.length - 1];
}

function doRoll(){
  const cost = rollCost();
  if(cost > 0 && SAVE.stones < cost){ toast('灵石不足，需 ' + cost); return; }
  if(cost > 0){ SAVE.stones -= cost; saveNow(); }

  const core = $('gachaCore');
  core.classList.remove('reveal'); core.classList.add('spin');
  $('rarityCard').classList.remove('show');
  $('btnKeep').disabled = true;
  SAVE.rolls++; saveNow(); refreshRollUI();

  setTimeout(() => {
    const r = rollRarity();
    rolled = r;
    document.documentElement.style.setProperty('--rc', r.color);
    core.classList.remove('spin'); core.classList.add('reveal');
    core.querySelector('.core-txt').textContent = r.name.slice(0,1);

    $('rcName').textContent = r.name;
    $('rcName').style.color = r.color;
    $('rcOdds').textContent = r.odds;
    $('rcStats').textContent =
      `气血 ${r.hp} · 攻 ${r.atk} · 灵力 ${r.mp}` + (r.spell ? ` · 术 ${r.spell}` : ' · 无法术') + '\n' + r.desc;
    // 出身：九州 × 血脉 × 身份
    SAVE.zhou = rollZhou().id; SAVE.blood = rollBlood().id; SAVE.ident = rollIdent().id;
    SAVE.bloodSeen = SAVE.bloodSeen || {}; SAVE.identSeen = SAVE.identSeen || {};
    SAVE.bloodSeen[SAVE.blood] = (SAVE.bloodSeen[SAVE.blood]||0) + 1;
    SAVE.identSeen[SAVE.ident] = (SAVE.identSeen[SAVE.ident]||0) + 1;
    saveNow();
    const z = ZHOU.find(x => x.id === SAVE.zhou);
    const b = BLOOD.find(x => x.id === SAVE.blood);
    const it = IDENT.find(x => x.id === SAVE.ident);
    $('rcStats').textContent += `\n${z.note}`;
    $('originChips').innerHTML =
      `<span>${z.name}·${z.adj}</span><span><b>${b.name}</b>血脉</span><span>${it.name}</span>`;

    $('rarityCard').classList.add('show');
    $('btnKeep').disabled = false;
    if(!SAVE.unlockedRoots.includes(r.id)){ SAVE.unlockedRoots.push(r.id); saveNow(); }
    burst(innerWidth/2, 190, r.color, r.p < 0.01 ? 70 : 26, r.p < 0.01 ? 8 : 4.5);
    if(r.p < 0.01) toast('稀有 · ' + r.odds);
  }, 780);
}

function refreshRollUI(){
  const last = RARITY.find(x => x.id === SAVE.selectedRoot);
  const b = $('btnUseLast');
  if(b){
    b.style.display = last ? 'block' : 'none';
    if(last) b.textContent = `用 ${last.name} 入劫（免抽）`;
  }
  const cost = rollCost();
  $('btnRoll').textContent = cost === 0 ? '落 胎' : '重投胎 · ' + cost + ' 灵石';
  $('rollCount').textContent = cost === 0
    ? '今日首次投胎 · 免费'
    : `今日已测 ${SAVE.rolls} 次 · 现有灵石 ${SAVE.stones}`;
}

/* ================= 战斗 ================= */
let S = null;

function waveSet(){
  const r = SAVE.realm || 0;
  const hpM = 0.55 + r * 0.40;
  const atkM = 0.78 + r * 0.13;
  const T = TRIALS[Math.min(9, SAVE.realm || 0)];
  return WAVES.map((w, i) => ({
    ...w,
    name: T.enemies[i],
    hp: Math.round(w.hp * hpM),
    seq: w.seq.map(([k, v]) => [k, k === 'atk' ? Math.round(v * atkM) : v])
  }));
}

function startBattle(root0){
  let root = root0;
  if(root.id === 'fangu' && (SAVE.fanguLv||0) > 0){
    const ev = FANGU_EVOLVE[Math.min(SAVE.fanguLv, 3)];
    root = {...root, atk:ev.atk, spell:ev.spell, hp:ev.hp, mp:ev.mp, dr:ev.dr, name:ev.name};
  }
  const bonusPill = SAVE.pills, bonusTalis = SAVE.talis;
  SAVE.pills = 0; SAVE.talis = 0; saveNow();

  S = {
    waves: waveSet(),
    root,
    hp: root.hp, hpMax: root.hp,
    mp: root.mp, mpMax: root.mp || 1,
    pills: 2 + bonusPill + (root.extraPills||0) + Math.min(SAVE.legacy||0, 3),
    talis: 1 + bonusTalis,
    wave: 0, waveTurn: 0, turns: 0,
    ehp: WAVES[0].hp, ehpMax: WAVES[0].hp,
    shield: 0, charged: false, idx: 0,
    over: false, won: false, yielded: false,
    usedItems: 0, atkBuff: 1, selfDrainExtra: 0, demonPact: false, demonRefused: false,
    offerShown: false,
    spellBoost: 1, guardBonus: 0, huxin: false, powang: false, xuming: false,
    hist: [], log: []
  };

  // 宝物效果（装备 2 件 + 借来 1 件）
  cleanArts();
  const artsList = equippedArts().map(a => a.id);
  if(SAVE.borrowed && SAVE.borrowedArt) artsList.push(SAVE.borrowedArt);
  artsList.forEach(id => {
    if(id === 'juling'){ S.mp += 4; S.mpMax += 4; log('聚灵珠：灵力 +4'); }
    if(id === 'huxin')  S.huxin = true;
    if(id === 'powang') S.powang = true;
    if(id === 'yinlei') S.spellBoost = 1.25;
    if(id === 'guixi')  S.guardBonus = 0.08;
    if(id === 'xuming') S.xuming = true;
    if(id === 'cangfeng') S.atkFlat = (S.atkFlat||0) + 3;
    if(id === 'taixu'){ S.mp += 3; S.mpMax += 3; }
    if(id === 'shihun') S.killHeal = 8;
    if(id === 'tianji') S.tianji = true;
    if(id === 'qixing') S.tickHeal = 3;
    if(id === 'huihui') S.perWaveHeal = 10;
    if(id === 'yusui') S.healBonus = 10;
    if(id === 'wuzibei') S.guardMp = 1;
    if(id === 'xuanjia') S.shieldFirst = 0.30;
    if(id === 'yinhun')  S.chargeDmg = 1.20;
    if(id === 'taiyi')   S.healMult = 1.6;
    if(id === 'mirage')  S.mirageGrace = true;
    if(id === 'pojian')  S.firstStrike = true;
    if(id === 'huihun')  S.autoHeal = 15;
    if(id === 'jincan')  S.mpTick = 1;
    if(id === 'shiling') S.killMp = 2;
    if(id === 'yuqing')  S.chargeShield = true;
    if(id === 'tisi')    S.xuming = true;
  });
  if(artsList.length) log('随身宝物：' + artsList.map(i=>ARTS[i].name).join('、'));

  S.trial = TRIALS[Math.min(9, SAVE.realm || 0)];
  F.tint = S.trial.tint;
  useArt(S.trial.id);
  if($('trialTag')){
    $('trialTag').innerHTML = `<b>${S.trial.name}</b> · ${S.trial.sub}`;
    const pool = (typeof TRIAL_LINES !== 'undefined' && TRIAL_LINES[S.trial.id]) || [S.trial.quote];
    $('trialQuote').textContent = pick(pool);
    $('trialNote').textContent = S.trial.note;
  }

  // 悟道积累
  if(SAVE.bonusHp){ S.hpMax += SAVE.bonusHp; S.hp += SAVE.bonusHp; }
  if(SAVE.bonusAtk){ S.atkFlat = (S.atkFlat||0) + SAVE.bonusAtk; }
  if(SAVE.bonusSpell){ S.spellBoost = (S.spellBoost||1) + SAVE.bonusSpell * 0.05; }

  // 阵法
  if(SAVE.array === 'juling'){ S.mpMax += 4; S.mp += 4; S.mpTickBonus = 1; log('阵法·聚灵：灵力 +4，每回合 +1'); }
  if(SAVE.array === 'hushan'){ S.drBonus = (S.drBonus||0) + 0.06; log('阵法·护山：减伤 +6%'); }
  if(SAVE.array === 'shalu'){ S.atkFlat = (S.atkFlat||0) + 2; S.spellBoost = (S.spellBoost||1) + 0.15; log('阵法·杀阵：攻 +2，法术 +15%'); }

  // 出身加成
  const zz = ZHOU.find(x => x.id === SAVE.zhou);
  const bb = BLOOD.find(x => x.id === SAVE.blood);
  const ii = IDENT.find(x => x.id === SAVE.ident);
  const applyBonus = (bo) => {
    if(!bo) return;
    if(bo.hp){ S.hpMax += bo.hp; S.hp += bo.hp; }
    if(bo.atk) S.atkFlat = (S.atkFlat||0) + bo.atk;
    if(bo.mp){ S.mpMax += bo.mp; S.mp += bo.mp; }
    if(bo.heal) S.healBonus = (S.healBonus||0) + bo.heal;
    if(bo.talis) S.talis += bo.talis;
    if(bo.pills) S.pills += bo.pills;
    if(bo.dr) S.drBonus = (S.drBonus||0) + bo.dr;
    if(bo.firstShield) S.shieldFirst = Math.max(S.shieldFirst||0, bo.firstShield);
    if(bo.firstStrike) S.firstStrike = true;
    if(bo.powang) S.powang = true;
    if(bo.regen) S.perWaveHeal = (S.perWaveHeal||0) + bo.regen;
    if(bo.rage) S.rageBonus = bo.rage;
    if(bo.stones){ SAVE.stones += bo.stones; saveNow(); }
  };
  applyBonus(zz && zz.bonus);
  applyBonus(bb && bb.bonus);
  applyBonus(ii && ii.bonus);
  if(zz || bb || ii) log(`出身：${zz?zz.name+'·'+zz.adj:'—'} ｜ ${bb?bb.name+'血脉':'—'} ｜ ${ii?ii.name:'—'}`);
  S.pills0 = S.pills; S.talis0 = S.talis;
  if(SAVE.borrowed){ SAVE.borrowed = false; SAVE.borrowedArt = null; saveNow(); }
  // 还原敌人序列（拒绝心魔会临时改它）
  WAVES.forEach((w,i) => { w.seq = BASE_SEQ[i].map(x => x.slice()); });

  // 有人在你渡劫时使坏：好友榜最高分决定干扰强度
  const topF = (SAVE.friends || []).slice().sort((a,b) => b.s - a.s)[0];
  if(topF && topF.s > 0){
    S.sniper = topF.n;
    S.enemyBuff = (S.enemyBuff || 0) + Math.min(0.20, topF.s / 6000);
    log(`<span class="bad">${topF.n} 在远处动了手脚（伤害 +${Math.round(Math.min(0.20, topF.s/6000)*100)}%）</span>`);
  }

  if(SAVE.legacy) log(`<span class="crit">残魂第 ${SAVE.legacy} 世：多带 ${Math.min(SAVE.legacy,3)} 颗丹，气血 +${SAVE.legacy*4}</span>`);
  S.hp = Math.min(S.hpMax, S.hp + (SAVE.legacy||0)*4);
  S.hpMax += (SAVE.legacy||0)*4;

  show('s-battle');
  F.wave = 0; F.hpPct = 1;
  setFoe(0);
  render();
  say('云层压下来了。你听见风里有东西在呼吸。');
}

function setFoe(i){
  S.wave = i; S.waveTurn = 0;
  S.ehp = S.waves[i].hp; S.ehpMax = S.waves[i].hp;
  S.shield = 0; S.charged = false; S.idx = 0;
  F.wave = i; F.hit = 0;
  S.tianjiUsed = false; S.firstUsed = false; S.chargedHit = false;
  if(i > 0 && S.perWaveHeal){
    S.hp = Math.min(S.hpMax, S.hp + S.perWaveHeal);
    log(`回天丹：气血 +${S.perWaveHeal}`);
  }
  $('foeName').textContent = S.waves[i].name;
}

let sayTimer = null, typeTimer = null;
function say(text){
  if(!text) return;
  const el = $('speech'), box = $('speechTxt');
  el.classList.remove('hidden');
  box.textContent = '';
  F.speak = 1;
  clearInterval(typeTimer); clearTimeout(sayTimer);
  let i = 0;
  typeTimer = setInterval(() => {
    box.textContent = text.slice(0, ++i);
    if(i >= text.length) clearInterval(typeTimer);
  }, 42);
  sayTimer = setTimeout(() => el.classList.add('hidden'), 4200 + text.length * 90);
}
function demonSay(kind){
  if(S.waves[S.wave].talk !== 'demon') return;
  let pool;
  const tl = (typeof TAUNTS !== 'undefined') && TAUNTS[S.trial && S.trial.id];
  if(tl && (kind === 'start' || kind === 'atk' || kind === 'charge' || kind === 'lowhp')){
    say(pick(tl)); return;
  }
  if(kind === 'start') pool = S.root.respect ? LINES.demon_respect : (S.root.id === 'fangu' ? LINES.demon_sneer : LINES.demon_start);
  else if(kind === 'real') pool = LINES.demon_real;
  else pool = LINES['demon_' + kind] || LINES.demon_start;
  say(pick(pool));
}

/* ---- 渲染 ---- */
function intentInfo(step){
  const seq = S.waves[S.wave].seq;
  const [k, v] = seq[(S.idx + step) % seq.length];
  const enrage = enrageOf(S.waveTurn);
  if(k === 'atk'){
    const dmg = Math.round(v * enrage * ATK_MULT * (step === 0 && S.charged ? 2 : 1));
    return {label:'攻击', value:dmg, cls:'atk', dmg};
  }
  if(k === 'charge') return {label:'蓄力', value:'—', cls:'charge', dmg:0};
  return {label:'护盾', value:'+' + v, cls:'guard', dmg:0};
}

function render(){
  if(!S) return;
  const enr = Math.round((enrageOf(S.waveTurn)-1)*100);
  $('waveTag').textContent = (REALMS[SAVE.realm||0] || REALMS[0]).name + ' · ' +
    ['第一层','第二层','第三层'][S.wave] + (enr>0 ? ` · 狂暴 ${enr}%` : '');
  $('turnTag').textContent = '回合 ' + S.turns;

  $('foeName').textContent = S.waves[S.wave].name +
    (S.shield>0 ? `（护盾 ${S.shield}）` : '') + (S.charged ? '（蓄力中）' : '');
  $('foeHp').style.width = clamp(S.ehp/S.ehpMax*100,0,100) + '%';
  $('foeHpNum').textContent = hasMod('fear')
    ? '??? / ???'
    : Math.max(0,Math.round(S.ehp)) + ' / ' + S.ehpMax;
  F.hpPct = clamp(S.ehp/S.ehpMax,0,1);

  // 只给一步，而且是"看个大概"——可能看错
  if(S.fogTurn !== S.turns){
    S.fogTurn = S.turns;
    const real = S.waves[S.wave].seq[S.idx][0];
    const liePool = ['atk','charge','guard'].filter(x => x !== real);
    S.fogLie = RND() < 0.45 ? liePool[Math.floor(RND()*liePool.length)] : null;
  }
  const realK = S.waves[S.wave].seq[S.idx][0];
  const shownK = S.truthShown ? realK : (S.fogLie || realK);
  const [, rawV] = S.waves[S.wave].seq[S.idx];
  const trueDmg = Math.round(rawV * enrageOf(S.waveTurn) * ATK_MULT * (S.charged ? 2 : 1));
  const tier = trueDmg < S.hpMax*0.09 ? '轻' : (trueDmg < S.hpMax*0.17 ? '中' : '重');
  const view = {
    atk: S.truthShown ? `出手 ${tier}` : `出手，气势${tier}`,
    charge: '气机一沉，像在攒什么',
    guard: '它收势自守'
  }[shownK];
  const cls = {atk:'atk', charge:'charge', guard:'guard'}[shownK];
  $('intents').innerHTML = `
    <div class="intent now ${cls}">
      <span>它的下一步</span><b>${view}</b>
    </div>
    <button class="peek" id="btnPeek" ${S.mp>=1?'':'disabled'}>观气 1灵力</button>`;
  const pk = $('btnPeek');
  if(pk) pk.onclick = () => {
    if(S.mp < 1 || S.truthShown) return;
    S.mp -= 1; S.truthShown = true; S.peekUsed = true;
    log('<span class="crit">你凝神观气，看清了它的路数</span>');
    render();
  };

  $('hpBar').style.width = clamp(S.hp/S.hpMax*100,0,100) + '%';
  $('hpNum').textContent = Math.max(0,Math.round(S.hp)) + ' / ' + S.hpMax;
  if(S.root.mp === 0){
    $('mpBar').style.width = '0%';
    $('mpNum').textContent = '无灵根 · 无法术';
  } else {
    $('mpBar').style.width = clamp(S.mp/S.mpMax*100,0,100) + '%';
    $('mpNum').textContent = Math.round(S.mp) + ' / ' + S.mpMax;
  }

  const eqNames = equippedArts().map(a => ARTS[a.id].name);
  $('tagRoot').textContent = S.root.name + (eqNames.length ? ' + ' + eqNames.join('/') : '');
  $('tagPill').textContent = '丹 ×' + S.pills;
  $('tagTalis').textContent = '符 ×' + S.talis;

  $('sAtk').textContent = '伤 ' + Math.round((S.root.atk + (S.atkFlat||0)) * S.atkBuff);
  $('sSpell').textContent = S.root.spell ? `灵4 伤${S.root.spell}` : '无法术';
  $('sGuard').textContent = '减伤' + Math.round((1-S.root.dr)*100) + '%';
  $('sPill').textContent = '回24';
  $('sTalis').textContent = S.talis > 0 ? '断一击' : '已用完';

  const dis = S.over;
  document.querySelectorAll('.act').forEach(b => b.disabled = dis);
  document.querySelector('[data-act=spell]').disabled = dis || !S.root.spell || S.mp < 4;
  document.querySelector('[data-act=pill]').disabled = dis || S.pills <= 0 || S.hp >= S.hpMax;
  document.querySelector('[data-act=talis]').disabled = dis || S.talis <= 0;
  const hb = document.querySelector('[data-act=help]');
  if(hb){ hb.disabled = dis || !(SAVE.help > 0); $('sHelp').textContent = SAVE.help > 0 ? '余 ' + SAVE.help + ' 次' : '无人可助'; }

  $('log').innerHTML = S.log.slice(-5).join('<br>');
  $('log').scrollTop = 1e6;
}
function log(html){ S.log.push(html); }

/* ---- 特效 ---- */
function floatDmg(x, y, text, hurt, big){
  const d = document.createElement('div');
  d.className = 'float-dmg' + (hurt?' hurt':'') + (big?' big':'');
  d.textContent = text;
  d.style.left = x + 'px'; d.style.top = y + 'px';
  document.body.appendChild(d);
  setTimeout(()=>d.remove(), 950);
}
function hitFx(color, dmg){
  F.hit = 0.85;
  const r = $('stage').getBoundingClientRect();
  floatDmg(r.left + r.width/2 + rnd(-40,40), r.top + 84, dmg, false, dmg >= 25);
  burst(r.left + r.width/2, r.top + 90, color, 22, 5);
  const s = document.createElement('div');
  s.className = 'slash';
  s.style.left = (r.left + r.width/2 - 90) + 'px';
  s.style.top = (r.top + 86) + 'px';
  s.style.setProperty('--a', rnd(-30,-12) + 'deg');
  document.body.appendChild(s);
  setTimeout(()=>s.remove(), 400);
  sfx('hit');
}
function enemyAttackFx(dmg){
  F.atk = 1; F.hurt = 1; fxSlash();
  const st = $('stage');
  st.classList.remove('shake'); void st.offsetWidth; st.classList.add('shake');
  const v = document.createElement('div');
  v.className = 'vignette'; document.body.appendChild(v);
  setTimeout(()=>v.remove(), 520);
  floatDmg(innerWidth/2 + rnd(-50,50), innerHeight*0.44, '-' + dmg, true, dmg >= 25);
  sfx('hurt');
}

/* ---- 回合 ---- */
function act(kind){
  if(!S || S.over) return;

  if(kind === 'help'){
    if(!(SAVE.help > 0)){ toast('没有道友可助（借宝码可换来助拳）'); return; }
    SAVE.help--; saveNow();
    S.turns++; S.waveTurn++;
    const d = 30;
    S.ehp -= d;
    S.hp = Math.min(S.hpMax, S.hp + 15);
    hitFx('#ffd9a0', d);
    log(`<span class="crit">道友出手</span>：造成 ${d} 伤害，气血 +15`);
    const taken = enemyTurn(false);
    S.hist.push({t:S.turns, act:'help', dealt:d, taken, hp:Math.round(S.hp), chargedBefore:false});
    return after();
  }

  if(kind === 'yield'){
    S.over = true; S.won = false; S.yielded = true;
    return finish();
  }

  S.turns++; S.waveTurn++;
  const chargedBefore = S.charged;
  let guarded = false, dealt = 0, taken = 0;

  if(kind === 'pill'){
    S.pills--; S.usedItems++;
    const before = S.hp;
    const healAmt = Math.round((24 + (S.healBonus||0)) * (S.healMult||1) * (hasMod('illness') ? 0.5 : 1));
    S.hp = Math.min(S.hpMax, S.hp + healAmt);
    log(`服下回春丹，气血 +${Math.round(S.hp-before)}` + (hasMod('illness') ? ' <span class="bad">（病中，药力减半）</span>' : ''));
    demonSay('pill');
    taken = enemyTurn(false);
  } else if(kind === 'talis'){
    S.talis--; S.usedItems++;
    dealt = Math.round(rnd(5,7));
    S.ehp -= dealt;
    hitFx('#b79cff', dealt);
    log(`<span class="crit">镇魂符</span>镇住${S.waves[S.wave].name}，其本回合无法行动`);
    demonSay('talis');
    S.idx = (S.idx+1) % S.waves[S.wave].seq.length;
    S.charged = false;
    S.hist.push({t:S.turns, act:kind, dealt, taken:0, hp:Math.round(S.hp), chargedBefore});
    return after();
  } else if(kind === 'guard'){
    guarded = true;
    S.mp = Math.min(S.mpMax, S.mp + 2 + (S.guardMp||0));
    dealt = Math.round(rnd(1.5,2.5));
    S.ehp -= dealt;
    log(`护体：灵力 +2，本回合减伤 ${Math.round((1-S.root.dr+S.guardBonus)*100)}%`);
    demonSay('guard');
    taken = enemyTurn(true);
  } else if(kind === 'spell'){
    S.mp -= 4;
    const charged = S.waves[S.wave].seq[S.idx][0] === 'charge';
    dealt = Math.round(S.root.spell * S.spellBoost * rnd(0.88,1.12) * (charged?1.5:1));
    fxSpell();
    S.ehp -= dealt;
    hitFx(S.root.color, dealt);
    log(`法术轰出，<b>${dealt}</b> 伤害` + (charged?'（趁蓄力，1.5 倍）':''));
    taken = enemyTurn(false);
  } else {
    const charged = S.waves[S.wave].seq[S.idx][0] === 'charge';
    const desp = (S.root.desperate && S.hp < S.hpMax*0.3) ? 1.6 : 1;
    const first = (S.firstStrike && !S.firstHit) ? (S.firstHit = true, 1.5) : 1;
    const rage = (S.rageBonus && S.hp < S.hpMax*0.3) ? (1 + S.rageBonus) : 1;
    dealt = Math.round((S.root.atk + (S.atkFlat||0)) * S.atkBuff * desp * first * rage * rnd(0.88,1.12) * (charged?1.5:1) * (charged && S.chargeDmg ? S.chargeDmg : 1));
    S.ehp -= dealt;
    hitFx('#ffd9a0', dealt);
    fxSword();
    log(`剑诀斩落，<b>${dealt}</b> 伤害` + (charged?'（趁蓄力，1.5 倍）':'') +
        (desp>1?' <span class="crit">不屈</span>':''));
    taken = enemyTurn(false);
  }

  S.hist.push({t:S.turns, act:kind, dealt, taken, hp:Math.round(S.hp), chargedBefore});
  after();
}

function enemyTurn(guarded){
  if(S.ehp <= 0) return 0;
  const seq = S.waves[S.wave].seq;
  const [k, v] = seq[S.idx];

  if(k === 'charge'){
    S.charged = true;
    log(`${S.waves[S.wave].name} 正在蓄力……`);
    demonSay('charge');
    S.idx = (S.idx+1) % seq.length;
    return 0;
  }
  if(k === 'guard'){
    S.shield += v;
    log(`${S.waves[S.wave].name} 凝聚护盾 +${v}`);
    S.idx = (S.idx+1) % seq.length;
    return 0;
  }

  const enrage = enrageOf(S.waveTurn);
  const wasCharged = S.charged;
  let dmg = Math.round(v * (S.charged?2:1) * enrage * ATK_MULT * (1 + (S.enemyBuff||0)) * rnd(0.9,1.1));
  S.charged = false;
  S.chargedHit = wasCharged;
  if(guarded){
    let red = S.root.dr - (S.guardBonus||0) - (S.drBonus||0);
    if(hasMod('betray')){ red = 1 - (1 - red) * 0.5; log('<span class="bad">人言如刀，护体只剩一半用处</span>'); }
    dmg = Math.round(dmg * Math.max(0.12, red));
  }
  if(S.shield > 0){
    const absorb = Math.min(S.shield, dmg);
    S.shield -= absorb; dmg -= absorb;
    if(absorb > 0) log(`护盾吸收 ${absorb}`);
  }
  if(S.shieldFirst && !S.firstUsed && dmg > 0){
    S.firstUsed = true; dmg = Math.round(dmg * (1 - S.shieldFirst));
    log('<span class="crit">玄龟甲：首击减伤</span>');
  }
  if(S.chargeShield && S.chargedHit && dmg > 0){
    S.chargedHit = false; dmg = Math.round(dmg * 0.5);
    log('<span class="crit">玉清符：卸掉一半雷力</span>');
  }
  // 心魔/天雷会自我修复：逼你爆发，逼你用符用法术
  if(S.wave > 0 && S.waveTurn % 5 === 0 && S.ehp > 0 && S.ehp < S.ehpMax){
    const heal = Math.round(S.ehpMax * 0.08);
    S.ehp = Math.min(S.ehpMax, S.ehp + heal);
    log(`<span class="bad">${S.waves[S.wave].name} 自行修复 +${heal}</span>`);
  }
  if(S.tianji && !S.tianjiUsed && dmg > 0){
    S.tianjiUsed = true; dmg = Math.round(dmg * 0.5);
    log('<span class="crit">天机镜挡下半数力道</span>');
  }
  if(dmg > 0 && S.huxin){
    S.huxin = false; dmg = 0;
    log('<span class="crit">护心镜替你挡下了这一击</span>');
  }
  if(dmg > 0){
    S.hp -= dmg;
    enemyAttackFx(dmg);
    log(`<span class="bad">${S.waves[S.wave].name} 反击，气血 -${dmg}</span>`);
    if(dmg >= 25) demonSay('hit');
  }
  S.idx = (S.idx+1) % seq.length;
  return dmg;
}

function innerVoice(){
  if(typeof INNER_LINES === 'undefined') return;
  if(S.turns % 4 !== 0) return;
  const line = pick(INNER_LINES);
  log(`<span class="inner">${line}</span>`);
}

function trialTick(){
  if(!S.trial || S.over) return;
  const m = S.trial.mods || [];
  if(m.indexOf('hunger') >= 0 && S.hp > 0 && S.turns % 2 === 0){
    S.hp -= 2;
    log('<span class="bad">饥火攻心，气血 -2</span>');
  }
  if(m.indexOf('farewell') >= 0 && S.hp > 0){
    S.atkFlat = (S.atkFlat || 0) - 0.4;
    log(`<span class="bad">你还在想那道门槛，出手软了（攻 ${S.atkFlat.toFixed(1)}）</span>`);
  }
  if(m.indexOf('fame') >= 0 && S.turns % 3 === 0 && S.hp > 0){
    S.atkFlat = (S.atkFlat || 0) + 2;
    S.hpMax = Math.max(20, S.hpMax - 4);
    S.hp = Math.min(S.hp, S.hpMax);
    log('<span class="crit">你收下了那份香火（攻 +2，气血上限 -4）</span>');
  }
  if(m.indexOf('aging') >= 0 && S.hp > 0){
    S.hpMax = Math.max(20, S.hpMax - 2);
    S.hp = Math.min(S.hp, S.hpMax);
    log('<span class="bad">又老了一岁（气血上限 -2）</span>');
  }
  if(m.indexOf('power') >= 0 && S.ehp > 0){
    S.shield += 4;
    log('<span class="bad">他被规矩护着，护盾 +4</span>');
  }
  if(m.indexOf('void') >= 0 && S.turns % 2 === 0){
    S.ehp = Math.min(S.ehpMax, S.ehp + Math.round(S.hpMax * 0.05));
    log('<span class="bad">镜中的你替他补了一口气</span>');
  }
}

function after(){
  if(S.mpTick && S.hp > 0) S.mp = Math.min(S.mpMax, S.mp + S.mpTick);
  if(S.mpTickBonus && S.hp > 0) S.mp = Math.min(S.mpMax, S.mp + S.mpTickBonus);
  if(S.autoHeal && !S.autoHealUsed && S.hp > 0 && S.hp < S.hpMax * 0.2){
    S.autoHealUsed = true; S.hp = Math.min(S.hpMax, S.hp + S.autoHeal);
    log(`<span class="crit">回魂香：气血 +${S.autoHeal}</span>`);
  }
  trialTick();
  innerVoice();
  S.truthShown = false;
  if(S.tickHeal && S.turns % 3 === 0 && S.hp > 0){
    S.hp = Math.min(S.hpMax, S.hp + S.tickHeal);
    log(`七星灯：气血 +${S.tickHeal}`);
  }
  if(S.root.selfDrain && S.hp > 0){
    S.hp -= S.root.selfDrain;
    log(`<span class="bad">凡骨肉身损耗 -${S.root.selfDrain}</span>`);
  }
  if(S.selfDrainExtra && S.hp > 0){
    S.hp -= S.selfDrainExtra;
    log(`<span class="bad">心魔反噬 -${S.selfDrainExtra}</span>`);
  }
  if(S.hp > 0 && S.hp < S.hpMax*0.3 && RND() < 0.55) demonSay('low');

  if(S.hp <= 0 && S.xuming){
    S.xuming = false; S.hp = 18;
    log('<span class="crit">续命灯燃尽，你被硬拽了回来</span>');
  }
  if(S.hp <= 0 && !S.defyUsed){
    S.defyUsed = true;
    return showDefy();
  }
  if(S.hp <= 0){ S.over = true; S.won = false; render(); return finish(); }

  if(S.ehp <= 0){
    log(`<span class="good">${S.waves[S.wave].name} 溃散</span>`);
    if(S.killMp) S.mp = Math.min(S.mpMax, S.mp + S.killMp);
    if(S.killHeal && S.hp > 0){
      S.hp = Math.min(S.hpMax, S.hp + S.killHeal);
      log(`噬魂幡：气血 +${S.killHeal}`);
    }
    if(S.wave === 2){ S.over = true; S.won = true; render(); return finish(); }
    demonSay('kill');
    S.nextWave = S.wave + 1;
    if((S.eventsDone || 0) < 1 && RND() < 0.35){ S.eventsDone = (S.eventsDone || 0) + 1; return showEvent(); }
    advanceWave();
  }

  // 心魔幻境：第二层血量过半时触发一次
  if(!S.offerShown && S.wave === 1 && S.ehp <= S.ehpMax*0.5 && !S.over){
    S.offerShown = true;
    return showOffer();
  }
  render();
}

/* ---- 心魔幻境 ---- */
function showOffer(){
  show('s-offer');
  $('offerSub').textContent = '它停手了。它说，可以给你一条更快的路。';
  const cards = [
    {id:'accept', title:'接受它的力量', body:'攻击 +30%，但它每回合抽你 3 点气血。',
     cost:'代价：每回合自损 3', rec:false},
    {id:'refuse', title:'拒绝', body:'立刻回复 25 气血，但它恼了，本层攻击 +15%。',
     cost:'代价：这一层更难', rec:true},
    {id:'delay', title:'拖', body:'这一回合什么都不做，它也不动。',
     cost:'代价：白给一个回合', rec:false}
  ];
  $('offerCards').innerHTML = cards.map(c =>
    `<div class="offer-card ${c.rec?'rec':''}" data-offer="${c.id}">
       <b>${c.title}</b><span>${c.body}</span><span class="cost">${c.cost}</span>
     </div>`).join('');
  $('offerCards').querySelectorAll('[data-offer]').forEach(el => {
    el.onclick = () => chooseOffer(el.dataset.offer);
  });
}

function chooseOffer(id){
  show('s-battle');
  if(id === 'accept'){
    S.atkBuff = 1.3; S.selfDrainExtra = S.mirageGrace ? 1 : 3; S.demonPact = true;
    log('<span class="crit">你接过了它的力量。攻击 +30%，每回合自损 3。</span>');
    say('很好。现在，我们是一伙的了。');
  } else if(id === 'refuse'){
    const before = S.hp;
    S.hp = Math.min(S.hpMax, S.hp + 25);
    S.demonRefused = true;
    log(`<span class="good">你说不必。气血 +${Math.round(S.hp-before)}。它恼了。</span>`);
    say('你会后悔的。我保证。');
    S.waves[1].seq = S.waves[1].seq.map(([k,v]) => [k, k==='atk' ? Math.round(v*1.15) : v]);
  } else {
    log('你什么都没做。它也什么都没做。');
    say('……你在等什么？');
  }
  render();
}

/* ================= 复盘 ================= */
function buildRecap(){
  const h = S.hist;

  if(S.won){
    const lines = [];
    const best = h.reduce((a,b) => (b.dealt > (a? a.dealt : -1) ? b : a), null);
    if(best) lines.push(`最狠的一击在第 <b>${best.t}</b> 回合，打了 <b>${best.dealt}</b> 点。`);
    const guards = h.filter(x => x.act === 'guard').length;
    lines.push(`你护体 <b>${guards}</b> 次，吃丹 <b>${3 - S.pills}</b> 颗，用符 <b>${2 - S.talis}</b> 张。`);
    if(S.hp / S.hpMax >= .6) lines.push('气血还剩六成以上——这一局你打得比雷还稳。');
    else lines.push(`剩 <b>${Math.round(S.hp)}</b> 点气血活下来。下次未必。`);
    return lines.map(s => '· ' + s).join('<br>');
  }

  const lines = [];
  const fatalIdx = h.findIndex(x => x.hp <= 0);
  const last = fatalIdx >= 0 ? fatalIdx : h.length - 1;
  const tail = h.slice(Math.max(0,last-1), last+1);

  // 致命一击分析
  const big = h.reduce((a,b) => (b.taken > (a? a.taken : -1) ? b : a), null);
  if(big && big.taken > 0){
    if(big.chargedBefore && big.act !== 'guard'){
      lines.push(`第 <b>${big.t}</b> 回合它还蓄着力，你选择出手，吃下了 <b>${big.taken}</b> 点。护体本可以把这一下压到 ${Math.round(big.taken*S.root.dr)}。`);
    } else if(big.taken >= 25){
      lines.push(`第 <b>${big.t}</b> 回合，你一口气吃了 <b>${big.taken}</b> 点。那是全场最重的一击。`);
    }
  }
  // 贪蓄力
  const greedy = h.filter(x => x.chargedBefore && x.act !== 'guard' && x.taken >= 15).length;
  if(greedy >= 2) lines.push(`你 <b>${greedy}</b> 次在它蓄力时抢输出，每次都被回敬。蓄力回合的攻击是双倍。`);

  // 没用完的丹
  if(S.pills > 0) lines.push(`你倒下时身上还剩 <b>${S.pills}</b> 颗回春丹。`);

  // 一直没护体
  const guards = h.filter(x => x.act === 'guard').length;
  if(guards === 0 && h.length > 6) lines.push(`整场战斗你<b>一次护体都没有</b>。减伤 ${Math.round((1-S.root.dr)*100)}% 是免费挂在按钮上的。`);

  // 死于狂暴
  const enr = enrageOf(S.waveTurn);
  if(enr > 1.4) lines.push(`你打到第 <b>${S.waveTurn}</b> 回合，它已经狂暴 <b>${Math.round((enr-1)*100)}%</b>。拖得越久，它越强。`);

  if(!lines.length) lines.push('这一局你没什么可挑的。就是差一点。');
  return lines.map(s => '· ' + s).join('<br>');
}

/* ================= 结算 ================= */
function realmOf(){
  if(!S.won){
    if(S.wave === 0) return 'lianqi';
    if(S.wave === 1) return S.turns > 18 ? 'zhuji' : 'jindan';
    return S.turns > 26 ? 'yuanying' : 'huashen';
  }
  const hp = S.hp / S.hpMax;
  if(hp >= .45 && S.usedItems === 0 && S.turns <= 16) return 'xian';
  if(hp >= .40 && S.usedItems <= 1) return 'dujie';
  if(hp >= .35) return 'dacheng';
  if(hp >= .29) return 'heti';
  if(hp >= .23) return 'lianxu';
  if(hp >= .17) return 'huashen';
  if(hp >= .11) return 'yuanying';
  if(hp >= .06) return 'jindan';
  return 'zhuji';
}

function fateOf(){
  const hp = S.hp / S.hpMax;
  if(S.won){
    if(S.usedItems === 0 && hp > .6) return 'feisheng';
    if(hp < .2) return 'cangqu';
    if(S.root.id === 'fangu') return 'rousheng';
    if(S.demonRefused) return 'gongde';
    if(S.turns <= 12) return 'feisheng';
    return 'pojie';
  }
  if(S.turns >= 14 && S.root.id === 'huo') return 'zouhuo';
  if(S.wave === 0) return 'daoxiao';
  if(S.wave === 1) return 'duoshe';
  if(S.turns >= 26) return 'dengku';
  return 'bingjie';
}

function specialOf(){
  const guards = S.hist.filter(x => x.act === 'guard').length;
  const greedy = S.hist.filter(x => x.chargedBefore && x.act !== 'guard' && x.taken >= 15).length;
  const arts = equippedArts().length;

  if(!S.won){
    if(S.yielded) return null;
    if(greedy >= 2) return 'greedy_die';
    if(arts >= 2 && S.pills > 0) return 'rich_die';
    return null;
  }
  if(S.demonPact) return 'demon_pact';
  if(S.root.id === 'fangu' && S.hp / S.hpMax > .45) return 'mortal_win';
  if(S.root.id === 'hundun' || S.root.id === 'daotai') return 'chaos_win';
  if(S.demonRefused && S.hp / S.hpMax < .2) return 'dao_heart';
  if(guards >= 8) return 'turtle_win';
  if(S.usedItems === 0 && arts === 0) return 'naked_win';
  if(guards === 0) return 'ironhead';
  return null;
}

function starsOf(){
  if(!S.won) return 0;
  const hp = S.hp / S.hpMax;
  if(hp >= .7 && S.usedItems === 0) return 3;
  if(hp >= .4 || S.usedItems <= 1) return 2;
  return 1;
}

function computeEnding(){
  if(S.forceEnding) return {id:S.forceEnding, stars:0};
  if(S.defied && S.won) return {id:'defy_win', stars:starsOf()};

  // 成仙优先：只要达到仙的门槛，就别被特殊结局截胡
  if(S.won && SAVE.renjian) return {id:'renjian', stars:3};
  if(S.won && realmOf() === 'xian') return {id:'xian__' + fateOf(), stars:3};

  // 现实向：先判，再判道途
  if(S.yielded) return {id:'mom_call', stars:0};
  if(!S.won){
    if(S.turns >= 26) return {id:'sleep', stars:0};
    if((SAVE.loseStreak||0) >= 3) return {id:'kpi', stars:0};
    if((SAVE.stones||0) < 20) return {id:'bill', stars:0};
  }

  const sp = specialOf();
  if(sp) return {id:sp, stars:starsOf()};
  const realm = realmOf();
  let fate = fateOf();
  if(S.yielded) fate = 'cangqu';
  return {id: realm + '__' + fate, stars: starsOf()};
}

function openPossess(){
  const list = (SAVE.friends || []).slice().sort((a,b) => b.s - a.s).slice(0, 5);
  if(!list.length){ toast('榜上无人，无处可夺'); return; }
  const mine = Math.max(1, SAVE.best || 1);
  $('possessList').innerHTML = list.map((f, i) => {
    const odds = Math.max(0.12, Math.min(0.85, 0.62 - (f.s / (mine + f.s)) * 0.5));
    return `<div class="possess-row" data-i="${i}">
      <div><b>${f.n}</b><span class="dim tiny"> · ${f.s} 分</span></div>
      <div class="pct">成算 ${Math.round(odds*100)}%</div>
    </div>`;
  }).join('');
  $('possessList').querySelectorAll('.possess-row').forEach(el => {
    el.onclick = () => {
      const f = list[+el.dataset.i];
      const odds = Math.max(0.12, Math.min(0.85, 0.62 - (f.s / (mine + f.s)) * 0.5));
      if(RND() < odds){
        const gain = Math.max(10, Math.round(f.s * 0.12));
        SAVE.best = (SAVE.best || 0) + gain;
        SAVE.possessed = SAVE.possessed || [];
        SAVE.possessed.push({n: f.n, s: f.s, ok: true});
        saveNow();
        $('resEnding').innerHTML = `<b style="color:var(--red-l)">夺舍</b><br>你找到了 ${f.n}，从他身上撕下一线道行。<br><span class="dim" style="font-size:12px">夺得 ${gain} 分</span>`;
        toast(`夺舍成功 · ${f.n} · +${gain} 分`);
      } else {
        SAVE.selectedRoot = null;
        SAVE.stones = Math.floor(SAVE.stones / 2);
        SAVE.realm = 0;
        saveNow();
        $('resEnding').innerHTML = `<b style="color:var(--red-l)">夺舍失败</b><br>${f.n} 的道行不是白给的。<br>你被反噬，灵根散尽。<br><span class="dim" style="font-size:12px">回到练气，重新投胎</span>`;
        toast('夺舍失败 · 灵根散尽');
      }
      show('s-result');
      $('btnPossess').disabled = true;
    };
  });
  show('s-possess');
}

function openEnlighten(){
  const cards = [];
  // 一、属性
  const attrs = [
    {t:'气血 +10', d:'肉身再厚一分', apply:() => { SAVE.bonusHp = (SAVE.bonusHp||0) + 10; }},
    {t:'攻击 +1', d:'出手更狠一点', apply:() => { SAVE.bonusAtk = (SAVE.bonusAtk||0) + 1; }},
    {t:'法术 +2', d:'灵根再通一分', apply:() => { SAVE.bonusSpell = (SAVE.bonusSpell||0) + 2; }}
  ];
  cards.push({k:'一 · 修行', ...pick(attrs)});
  // 二、宝物
  const artIds = ART_IDS.filter(id => !SAVE.arts.includes(id));
  if(artIds.length){
    const id = pick(artIds);
    cards.push({k:'二 · 外物', t:ARTS[id].name, d:ARTS[id].desc, apply:() => { SAVE.arts.push(id); }});
  }
  // 三、一句话
  const pool = (typeof ENLIGHTEN !== 'undefined') ? ENLIGHTEN.filter(x => !SAVE.quotes.includes(x)) : [];
  if(pool.length){
    const line = pick(pool);
    cards.push({k:'三 · 道心', t:'「' + line + '」', d:'记住它，进图鉴', cls:'quote',
      apply:() => {
        SAVE.quotes.push(line);
        if(SAVE.quotes.length >= 10 && !SAVE.renjian){
          SAVE.renjian = true;
          toast('十句已齐 · 人间清醒');
        }
      }});
  }

  $('daoCards').innerHTML = cards.map((c,i) => `
    <div class="dao-card ${c.cls||''}" data-i="${i}">
      <div class="k">${c.k}</div>
      <div class="t">${c.t}</div>
      <div class="d">${c.d}</div>
    </div>`).join('');

  $('daoCards').querySelectorAll('.dao-card').forEach(el => {
    el.onclick = () => {
      const c = cards[+el.dataset.i];
      c.apply(); saveNow();
      toast('已悟：' + c.t.replace(/[「」]/g,'').slice(0,12));
      show('s-result');
    };
  });
  show('s-enlighten');
}

function finish(){
  const invalid = TAMPER || !selfConsistent();
  if(invalid){
    show('s-result');
    $('resTitle').textContent = '此 局 无 效';
    $('resStars').textContent = '☆☆☆';
    $('resEnding').innerHTML = '<b style="color:var(--red-l)">成绩作废</b><br>这一局的数据对不上，没有记入图鉴，也没有灵石。';
    document.querySelector('.recap').style.display = 'none';
    $('resStats').innerHTML = '<div class="row"><span>原因</span><b>数据被改动或调试器开启</b></div>';
    $('btnReborn').style.display = 'none';
    $('btnMakeCard').style.display = 'none';
    $('dexNew').classList.add('hidden');
    S = null; TAMPER = false;
    return;
  }
  $('btnMakeCard').style.display = 'block';

  const e = computeEnding();
  const stars = e.stars;
  const score = Math.round(stars*1000 + Math.max(0,S.hp)*3 + (S.won ? Math.max(0,40-S.turns)*10 : S.wave*120));
  const gain = S.won ? 26 + stars*8 : 8 + S.wave*4;

  // 境界推进 / 掉落
  const oldRealm = SAVE.realm || 0;
  let breakthrough = null;
  if(S.won){
    SAVE.realm = Math.min(9, oldRealm + 1);
    SAVE.deaths = 0;
    const bonusStones = 20 + SAVE.realm * 8;
    const bonusPills = 1;
    SAVE.stones += bonusStones;
    SAVE.pills += bonusPills;
    if(SAVE.realm % 3 === 0) SAVE.talis += 1;
    breakthrough = {from: oldRealm, to: SAVE.realm, stones: bonusStones, pills: bonusPills};
  } else {
    // 失败后果：跌境 / 陨落 / 残魂，按概率掷
    SAVE.deaths = (SAVE.deaths || 0) + 1;
    let outcome;
    if(oldRealm === 0){
      outcome = RND() < 0.55 ? 'soul' : 'fall';       // 练气跌无可跌
    } else {
      const x = RND() + (SAVE.deaths - 1) * 0.12;      // 连败越久越容易出事
      outcome = x < 0.50 ? 'demote' : (x < 0.78 ? 'soul' : 'fall');
    }
    if(outcome === 'demote'){
      SAVE.realm = oldRealm - 1;
    } else if(outcome === 'soul'){
      SAVE.legacy = Math.min(3, (SAVE.legacy || 0) + 1);
      SAVE.realm = Math.max(0, oldRealm);
      SAVE.pills += 1;
    } else {
      SAVE.realm = 0;
      SAVE.selectedRoot = null;
      SAVE.stones = Math.floor(SAVE.stones / 2);
      SAVE.deaths = 0;
      toast('陨落：灵根散尽，要重新投胎');
    }
    SAVE.lastOutcome = outcome;
  }

  SAVE.stones += gain; SAVE.runs++;
  SAVE.best = Math.max(SAVE.best, score);
  SAVE.endings[e.id] = (SAVE.endings[e.id]||0) + 1;
  SAVE.roots[S.root.id] = (SAVE.roots[S.root.id]||0) + 1;
  SAVE.board.push({score, ending:e.id, root:S.root.name});
  SAVE.board.sort((a,b)=>b.score-a.score);
  SAVE.board = SAVE.board.slice(0,8);
  saveNow();

  if(breakthrough){
    const fl = document.createElement('div'); fl.className = 'break-flash';
    const tx = document.createElement('div'); tx.className = 'break-text';
    tx.textContent = REALMS[breakthrough.to].name;
    document.body.appendChild(fl); document.body.appendChild(tx);
    setTimeout(() => { fl.remove(); tx.remove(); }, 1700);
    burst(innerWidth/2, innerHeight*0.42, '#ffd76a', 70, 9);
  }

  if(typeof ENDING_LINES_WIN !== 'undefined'){
    const pool = S.won ? ENDING_LINES_WIN : ENDING_LINES_LOSE;
    $('resEnding').innerHTML += `<div class="sign-off">${pick(pool)}</div>`;
  }

  S.endingId = e.id;
  S.lastScore = score;
  show('s-result');
  if(S.won) openEnlighten();
  $('resTitle').textContent = S.won ? '渡 劫 成 功' : (S.yielded ? '你 退 了' : '劫 未 渡');
  $('resStars').textContent = '★'.repeat(stars) + '☆'.repeat(3-stars);
  const guardsN = S.hist.filter(x => x.act === 'guard').length;
  const isXian = (ENDINGS[e.id] && ENDINGS[e.id].realm === 'xian') || e.id === 'defy_win';
  const pillsUsed = Math.max(0, (S.pills0 || 0) - S.pills);
  const talisUsed = Math.max(0, (S.talis0 || 0) - S.talis);
  S.statsLine = `这一局：${S.turns} 回合 · 护体 ${guardsN} 次 · 丹 ${pillsUsed} 颗 · 符 ${talisUsed} 张` +
    (S.won ? (isXian ? ` · 用时 ${S.turns} 回合成仙` : ` · ${S.turns} 回合渡过`)
           : (S.yielded ? ' · 主动退出' : ` · 倒在第 ${S.wave + 1} 层`)) +
    (S.defied ? ' · 逆天一次' : '') + ((SAVE.legacy||0) ? ` · 第 ${SAVE.legacy} 世` : '');
  $('resEnding').innerHTML = `<b style="color:var(--gold)">${ENDINGS[e.id].name}</b><br>${ENDINGS[e.id].text.replace(/\n/g,'<br>')}<br><span class="dim" style="font-size:12px">${S.statsLine}</span>`;
  SAVE.loseStreak = S.won ? 0 : (SAVE.loseStreak||0) + 1;

  const rc = buildRecap();
  document.querySelector('.recap').style.display = rc ? 'block' : 'none';
  $('recapBody').innerHTML = rc;

  const realmNow = REALMS[SAVE.realm || 0];
  const bk = breakthrough
    ? `<div class="row" style="color:var(--gold)"><span>突破</span><b>${REALMS[breakthrough.from].name} → ${REALMS[breakthrough.to].name}</b></div>
       <div class="row"><span>突破所得</span><b>灵石 +${breakthrough.stones} · 丹 +${breakthrough.pills}${SAVE.realm % 3 === 0 ? ' · 符 +1' : ''}</b></div>`
    : (() => {
        const o = SAVE.lastOutcome;
        const txt = o === 'fall' ? '陨落 · 灵根散尽'
          : o === 'soul' ? '残魂转世 · 留一线命'
          : '跌境 · 退一阶';
        return `<div class="row"><span>后果</span><b style="color:var(--red-l)">${txt}</b></div>
                <div class="row"><span>境界</span><b>${realmNow.name}</b></div>`;
      })();

  const possessPool = (SAVE.friends || []).slice().sort((a,b)=>b.s-a.s)[0];
  const canPossess = !S.won && possessPool;
  $('btnPossess').style.display = canPossess ? 'block' : 'none';
  if(canPossess) $('btnPossess').textContent = `夺舍 ${possessPool.n} · 取他一线道行`;

  $('resStats').innerHTML = bk + `
    <div class="row"><span>灵根</span><b>${S.root.name}</b></div>
    <div class="row"><span>回合</span><b>${S.turns}</b></div>
    <div class="row"><span>剩余气血</span><b>${Math.max(0,Math.round(S.hp))} / ${S.hpMax}</b></div>
    <div class="row"><span>评分</span><b>${score}</b></div>
    <div class="row"><span>灵石</span><b>+${gain}</b></div>`;

  const canReborn = !S.won && !S.yielded && (SAVE.legacy||0) < 3;
  $('btnReborn').style.display = canReborn ? 'block' : 'none';
  $('btnReborn').textContent = `残魂夺舍 · 转入凡躯（第 ${(SAVE.legacy||0)+1} 世）`;
  if(S.won && SAVE.legacy){ SAVE.legacy = 0; saveNow(); }

  $('dexNew').classList.toggle('hidden', (SAVE.endings[e.id]||0) > 1);
  $('dexNew').textContent = '新结局入图鉴：' + ENDINGS[e.id].name;
  burst(innerWidth/2, innerHeight*0.3, S.won?'#d4af37':'#8b8197', S.won?70:20, 6);
  if(S.won) sfx('win');
}

/* ================= 市集/图鉴 ================= */
const SHOP = [
  {id:'pill', name:'回春丹', desc:'入劫时多带一颗。战斗回血 24。', cost:12},
  {id:'talis', name:'镇魂符', desc:'多带一张。断敌人一整回合。', cost:18}
];
function renderPrep(){
  $('stoneNum').textContent = SAVE.stones;
  $('bagPill').textContent = SAVE.pills;
  $('bagTalis').textContent = SAVE.talis;
  $('shop').innerHTML = SHOP.map(it => `
    <div class="item">
      <div><b>${it.name}</b><small>${it.desc}</small></div>
      <button data-buy="${it.id}" ${SAVE.stones < it.cost ? 'disabled' : ''}>${it.cost} 灵石</button>
    </div>`).join('');
  $('shop').querySelectorAll('button[data-buy]').forEach(b => {
    b.onclick = () => {
      const it = SHOP.find(x => x.id === b.dataset.buy);
      if(SAVE.stones < it.cost) return;
      SAVE.stones -= it.cost; SAVE[it.id]++; saveNow(); renderPrep();
    };
  });
}
function renderDex(){
  const KEYS = ENDING_KEYS;
  const got = KEYS.filter(k => SAVE.endings[k]);
  $('dexSum').textContent = `结局 ${got.length}/${KEYS.length} · 灵根 ${Object.keys(SAVE.roots).length}/${RARITY.length} · 宝物 ${SAVE.arts.length} · 累计 ${SAVE.runs} 次 · 最高分 ${SAVE.best}`;

  const qs = SAVE.quotes || [];
  if($('quoteCount')) $('quoteCount').textContent = `${qs.length}/10` + (SAVE.renjian ? ' · 人间清醒已解锁' : '');
  if($('dexQuotes')) $('dexQuotes').innerHTML = qs.length
    ? qs.map(q => `<div class="qline">「${q}」</div>`).join('')
    : '<div class="dim tiny">还没有记住任何一句。</div>';

  $('dexEndings').innerHTML = REALMS.map(r => {
    const keys = KEYS.filter(k => ENDINGS[k].realm === r.id);
    const g = keys.filter(k => SAVE.endings[k]).length;
    return `<div class="realm-row"><div class="realm-h">${r.name} <em>${g}/${keys.length}</em></div>
      <div class="realm-grid">${keys.map(k => {
        const n = SAVE.endings[k] || 0;
        return `<div class="ecell ${n?'got':''}" title="${n?ENDINGS[k].name:''}">
          ${n ? ENDINGS[k].fate ? FATE[ENDINGS[k].fate].name : ENDINGS[k].name.slice(0,4) : '·'}</div>`;
      }).join('')}</div></div>`;
  }).join('') + `<div class="realm-row"><div class="realm-h">特殊 <em>${KEYS.filter(k=>ENDINGS[k].special && SAVE.endings[k]).length}/9</em></div>
    <div class="realm-grid">${KEYS.filter(k=>ENDINGS[k].special).map(k => {
      const n = SAVE.endings[k] || 0;
      return `<div class="ecell ${n?'got':''}">${n?ENDINGS[k].name:'·'}</div>`;
    }).join('')}</div></div>`;
  const seenB = SAVE.bloodSeen || {}, seenI = SAVE.identSeen || {};
  $('dexBlood') && ($('dexBlood').innerHTML = BLOOD.map(b => {
    const n = seenB[b.id] || 0;
    return `<div class="dex ${n?'got':''}"><b>${n?b.name+'血脉':'？？？'}</b>${n?'见过 '+n+' 次':b.desc}</div>`;
  }).join(''));
  $('dexIdent') && ($('dexIdent').innerHTML = IDENT.map(t => {
    const n = seenI[t.id] || 0;
    return `<div class="dex ${n?'got':''}"><b>${n?t.name:'？？？'}</b>${n?'见过 '+n+' 次':t.desc}</div>`;
  }).join(''));

  $('dexRoots').innerHTML = RARITY.map(r => {
    const n = SAVE.roots[r.id]||0;
    return `<div class="dex ${n?'got':''}"><b>${n?r.name:'？？？'}</b>${n?'用过 '+n+' 次':r.odds}</div>`;
  }).join('');
  $('board').innerHTML = SAVE.board.length
    ? SAVE.board.map((b,i)=>`<div class="row"><span>#${i+1} ${b.root} · ${ENDINGS[b.ending]?ENDINGS[b.ending].name:''}</span><b>${b.score}</b></div>`).join('')
    : '<div class="row"><span>还没有记录</span><b>—</b></div>';
}


/* ================= 宝物 / 仓库 / 借宝 / 榜 ================= */
const ARTS = {
  huxin:  {name:'护心镜', perm:true,  weight:3,  desc:'每局第一击伤害归零'},
  juling: {name:'聚灵珠', perm:true,  weight:5,  desc:'入劫时灵力 +4'},
  powang: {name:'破妄瞳', perm:true,  weight:3,  desc:'能预见第 4 个意图'},
  cangfeng:{name:'藏锋剑', perm:true, weight:6,  desc:'剑诀伤害 +3'},
  taixu:  {name:'太虚袍', perm:true,  weight:5,  desc:'灵力上限 +3'},
  shihun: {name:'噬魂幡', perm:true,  weight:2,  desc:'每击溃一层，回 8 气血'},
  yinlei: {name:'引雷针', perm:false, weight:26, desc:'法术伤害 +25%', days:3},
  guixi:  {name:'龟息袍', perm:false, weight:26, desc:'护体减伤 +8%',  days:3},
  xuming: {name:'续命灯', perm:false, weight:20, desc:'气血归零免死一次，回 18', days:1},
  tianji: {name:'天机镜', perm:false, weight:18, desc:'每层第一击减伤一半', days:3},
  qixing: {name:'七星灯', perm:false, weight:18, desc:'每 3 回合回 3 气血', days:3},
  huihui: {name:'回天丹', perm:false, weight:16, desc:'每进一层回 10 气血', days:3},
  yusui:  {name:'玉髓',   perm:false, weight:16, desc:'回春丹回血 +10', days:3},
  wuzibei:{name:'无字碑', perm:false, weight:14, desc:'护体额外 +1 灵力', days:3},
  xuanjia:{name:'玄龟甲', perm:true,  weight:2,  desc:'每层第一击减伤 30%'},
  yinhun: {name:'引魂铃', perm:true,  weight:2,  desc:'趁蓄力出手时伤害 +20%'},
  taiyi:  {name:'太乙针', perm:true,  weight:2,  desc:'回春丹治疗量 +60%'},
  mirage: {name:'净世莲', perm:true,  weight:2,  desc:'心魔幻境的自损减半'},
  pojian: {name:'破军符', perm:false, weight:14, desc:'每层第一击伤害 +50%', days:3},
  huihun: {name:'回魂香', perm:false, weight:13, desc:'气血跌破 20% 时自动回 15（一次）', days:3},
  jincan: {name:'金蚕丝', perm:false, weight:13, desc:'每回合自动 +1 灵力', days:3},
  shiling:{name:'噬灵袋', perm:false, weight:12, desc:'击溃一层回 2 灵力', days:3},
  yuqing: {name:'玉清符', perm:false, weight:12, desc:'每层第一次蓄力重击减半', days:3},
  tisi:   {name:'替死符', perm:false, weight:10, desc:'气血归零免死一次，回 18', days:1}
};
const ARRAYS = {
  juling: {name:'聚灵阵', desc:'灵力上限 +4，每回合 +1 灵力'},
  hushan: {name:'护山阵', desc:'减伤 +6%'},
  shalu:  {name:'杀阵',   desc:'攻 +2，法术 +15%'}
};
const ART_IDS = Object.keys(ARTS);
const DAY = 86400000;

function artAlive(a){ return a.exp === 0 || a.exp > Date.now(); }
function artLabel(a){
  if(a.exp === 0) return '永久';
  const d = Math.ceil((a.exp - Date.now())/DAY);
  return d <= 0 ? '已过期' : `限时 ${d} 天`;
}
function hasArt(id){
  return SAVE.arts.some(a => a.id === id && artAlive(a));
}
function equippedArts(){
  return SAVE.equip.map(id => SAVE.arts.find(a => a.id === id && artAlive(a))).filter(Boolean);
}
function cleanArts(){
  SAVE.arts = SAVE.arts.filter(artAlive);
  SAVE.equip = SAVE.equip.filter(id => hasArt(id));
}

function openCave(){
  cleanArts(); saveNow();
  $('caveStones').textContent = SAVE.stones;
  renderIdent(); renderClan(); renderArray(); renderStore(); renderBorrow(); renderFriends(); renderWorld();
  show('s-cave');
}

/* ---- 身份 ---- */
function renderIdent(){
  const cur = SAVE.selectedRoot;
  $('identList').innerHTML = RARITY.map(r => {
    const unlocked = SAVE.unlockedRoots.includes(r.id);
    return `<div class="ident ${unlocked?'':'lock'} ${cur===r.id?'on':''}">
      <div><b style="color:${unlocked?r.color:'var(--dim)'}">${unlocked?r.name:'？？？'}</b>
      <small>${unlocked?r.odds:r.odds}</small></div>
      ${unlocked ? (cur===r.id ? '<button disabled>当前</button>' : `<button data-pick="${r.id}">更换</button>`) : '<button disabled>未解锁</button>'}
    </div>`;
  }).join('');
  $('identList').querySelectorAll('[data-pick]').forEach(b => {
    b.onclick = () => { SAVE.selectedRoot = b.dataset.pick; saveNow(); renderIdent(); toast('已换上 ' + RARITY.find(r=>r.id===b.dataset.pick).name); };
  });
}

/* ---- 宝箱 ---- */
function openChest(){
  if(SAVE.stones < 25){ toast('灵石不足，需 25'); return; }
  SAVE.stones -= 25;
  const pool = [];
  ART_IDS.forEach(id => { const a = ARTS[id]; for(let i=0;i<a.weight;i++) pool.push(id); });
  const id = pick(pool);
  const a = ARTS[id];
  const exp = a.perm ? 0 : Date.now() + (a.days||1)*DAY;
  SAVE.arts.push({id, exp});
  saveNow();
  $('caveStones').textContent = SAVE.stones;
  renderStore(); renderIdent();
  burst(innerWidth/2, innerHeight*0.4, a.perm?'#d4af37':'#7f9fd8', 34, 6);
  toast(`开出 ${a.name} · ${a.perm?'永久':'限时 '+a.days+' 天'}`);
  $('chestHint').textContent = `刚才开出：${a.name}（${a.perm?'永久':'限时' }）`;
}

/* ---- 仓库 ---- */
function renderStore(){
  cleanArts();
  if(!SAVE.arts.length){
    $('artList').innerHTML = '<p class="dim tiny">仓库空的。抽一个宝箱试试。</p>'; return;
  }
  const seen = {};
  $('artList').innerHTML = SAVE.arts.map((a,i) => {
    const meta = ARTS[a.id];
    seen[a.id] = (seen[a.id]||0)+1;
    const eq = SAVE.equip.includes(a.id);
    const exp = a.exp === 0 ? 0 : a.exp;
    return `<div class="art ${eq?'equipped':''}">
      <div class="top"><b>${meta.name}${seen[a.id]>1?' ×'+seen[a.id]:''}</b>
        <span class="tagx ${a.exp===0?'perm':''}">${artLabel(a)}</span></div>
      <small>${meta.desc}</small>
      <div class="ops">
        <button data-eq="${i}">${eq?'卸下':'装备'}</button>
        <button data-borrow="${i}">生成借宝码</button>
      </div></div>`;
  }).join('');
  $('artList').querySelectorAll('[data-eq]').forEach(b => {
    b.onclick = () => {
      const i = +b.dataset.eq, id = SAVE.arts[i].id;
      if(SAVE.equip.includes(id)) SAVE.equip = SAVE.equip.filter(x => x !== id);
      else {
        if(SAVE.equip.length >= 2){ toast('最多带 2 件'); return; }
        SAVE.equip.push(id);
      }
      saveNow(); renderStore();
    };
  });
  $('artList').querySelectorAll('[data-borrow]').forEach(b => {
    b.onclick = () => {
      const a = SAVE.arts[+b.dataset.borrow];
      const code = makeBorrowCode(SAVE.name || '无名道友', SAVE.best, a.id);
      $('myCode').value = code;
      navigator.clipboard && navigator.clipboard.writeText(code).catch(()=>{});
      toast('借宝码已生成');
    };
  });
}

/* ---- 借宝码 ---- */
function b64(s){ return btoa(unescape(encodeURIComponent(s))).replace(/=+$/,''); }
function unb64(s){ return decodeURIComponent(escape(atob(s))); }
function makeBorrowCode(name, score, artId){
  return b64(`DJ1|${name}|${score}|${artId}`);
}
function parseBorrowCode(code){
  try{
    const p = unb64(code.trim()).split('|');
    if(p[0] !== 'DJ1') return null;
    return {name:p[1], score:+p[2]||0, artId:p[3]};
  }catch(e){ return null; }
}
function renderBorrow(){
  $('myCode').value = '';
  $('inCode').value = '';
  $('codeMsg').textContent = '';
  if(SAVE.borrowed){
    const a = ARTS[SAVE.borrowedArt];
    $('codeMsg').textContent = `已借到：${a.name}（来自 ${SAVE.borrowedFrom}），本局可用一次。`;
  }
}
function takeCode(){
  const c = parseBorrowCode($('inCode').value);
  if(!c){ $('codeMsg').textContent = '这码不对，可能复制少了。'; return; }
  if(!ARTS[c.artId]){ $('codeMsg').textContent = '码里的宝物不存在。'; return; }
  SAVE.borrowed = true; SAVE.borrowedArt = c.artId; SAVE.borrowedFrom = c.name;
  SAVE.friends = SAVE.friends.filter(f => f.n !== c.name);
  SAVE.friends.push({n:c.name, s:c.score, a:c.artId});
  SAVE.friends.sort((a,b)=>b.s-a.s);
  SAVE.help = (SAVE.help || 0) + 1;
  saveNow();
  $('codeMsg').textContent = `收下 ${c.name} 的 ${ARTS[c.artId].name}，本局可用一次。`;
  renderFriends();
  toast('已借到 ' + ARTS[c.artId].name);
}

/* ---- 好友榜 ---- */
function renderFriends(){
  $('friendBoard').innerHTML = SAVE.friends.length
    ? SAVE.friends.map((f,i)=>`<div class="row"><span>#${i+1} ${f.n} · 借出${ARTS[f.a]?ARTS[f.a].name:'?'}</span><b>${f.s}</b></div>`).join('')
    : '<div class="row"><span>还没有好友上榜</span><b>—</b></div>';
}

/* ---- 世界榜 ---- */
function todayKey(){ return new Date().toISOString().slice(0,10); }
function renderWorld(){
  const uploaded = SAVE.worldDate === todayKey();
  const best = SAVE.best || 0;
  $('worldCard').innerHTML = `
    <div class="wc-name">${SAVE.name || '无名道友'} · ${SAVE.selectedRoot ? (RARITY.find(r=>r.id===SAVE.selectedRoot)||{}).name || '' : ''}</div>
    <div class="wc-score">${best}</div>
    <div class="wc-sub">本地最高分 · ${new Date().toLocaleDateString('zh-CN')}</div>`;
  $('btnUpload').disabled = uploaded;
  $('btnUpload').textContent = uploaded ? '今日已上传' : '上传今日战绩';
  $('uploadMsg').textContent = uploaded
    ? '今日已上传。明天可再传一次。'
    : '每天只能上传一次；上传后生成可分享的战绩卡。';
}
function uploadWorld(){
  if(SAVE.worldDate === todayKey()){ toast('今天已经传过了'); return; }
  SAVE.worldDate = todayKey();
  SAVE.worldScore = SAVE.best;
  saveNow(); renderWorld();
  toast('已记录今日战绩');
  burst(innerWidth/2, innerHeight*0.35, '#d4af37', 40, 6);
  setTimeout(() => { if(S && S.endingId) openCard(); }, 400);
}

/* ---- 洞府事件 ---- */
$('btnCave').onclick = openCave;
$('btnCave2').onclick = openCave;
$('btnCaveBack').onclick = () => { show('s-gacha'); refreshRollUI(); };
$('btnChest').onclick = openChest;
$('btnTakeCode').onclick = takeCode;
$('btnGenCode').onclick = () => {
  const a = equippedArts()[0] || SAVE.arts[0];
  if(!a){ toast('仓库里没有宝物'); return; }
  const code = makeBorrowCode(SAVE.name || '无名道友', SAVE.best, a.id);
  $('myCode').value = code;
  if(navigator.clipboard) navigator.clipboard.writeText(code).catch(()=>{});
  toast('已生成，可复制发给好友');
};
$('btnShareFriend').onclick = () => {
  const txt = `我在渡「${RARITY.find(r=>r.id===SAVE.selectedRoot)?.name||'凡骨'}」，最高 ${SAVE.best} 分。来比比？`;
  if(navigator.clipboard) navigator.clipboard.writeText(txt).catch(()=>{});
  toast('邀请文案已复制');
};
$('btnUpload').onclick = uploadWorld;
document.querySelectorAll('.tab').forEach(t => {
  t.onclick = () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.toggle('on', x === t));
    ['ident','clan','store','array','borrow','friends','world'].forEach(k =>
      $('pane-'+k).classList.toggle('hidden', k !== t.dataset.tab));
  };
});



/* ================= 劫中奇遇 ================= */
function advanceWave(){
  setFoe(S.nextWave);
  if(S.waves[S.wave].talk === 'demon'){ setTimeout(()=>demonSay('start'), 900); }
  else say('雷声还没到，风先到了。');
  render();
}

function showEvent(){
  const pool = EVENTS.filter(e => !(S.usedEvents||[]).includes(e.id));
  const ev = pool[Math.floor(RND()*pool.length)] || EVENTS[0];
  S.usedEvents = S.usedEvents || []; S.usedEvents.push(ev.id);
  S.curEvent = ev;
  $('evTitle').textContent = ev.title;
  $('evText').textContent = ev.text;
  const opts = ev.opts.filter(o => {
    if(!o.req) return true;
    if(o.req.zhou) return o.req.zhou === SAVE.zhou;
    if(o.req.blood) return o.req.blood === SAVE.blood;
    if(o.req.ident) return o.req.ident === SAVE.ident;
    return false;
  });
  S.curOpts = opts;
  // 效果不写出来——奇遇就是要赌
  $('evCards').innerHTML = opts.map((o, i) => `
    <div class="offer-card ${o.special?'rec':''}" data-opt="${i}">
      <b>${o.special?'✦ ':''}${o.label}</b><span>${o.special ? '你比旁人多看一眼' : '不知道会怎样'}</span>
    </div>`).join('');
  $('evCards').querySelectorAll('[data-opt]').forEach(el => {
    el.onclick = () => chooseEvent(+el.dataset.opt);
  });
  show('s-event');
}

const INSIGHTS = [
  '有些门推开才知道后面是什么，但你必须先推。',
  '选择本身没有对错，承担才分高下。',
  '贪与不贪，都是一念之间的事。',
  '你以为的便宜，往往是别人让给你的。',
  '人这一生，赌的次数其实不多。',
  '谨慎不是胆小，是知道自己输不起。',
  '有些东西不要，是因为知道自己拿不住。',
  '运气只照顾先伸手的人。',
  '该走的时候走，是本事。',
  '你选了什么，你就成了什么。'
];

function chooseEvent(i){
  const o = (S.curOpts || S.curEvent.opts)[i];
  applyFx(o.fx || {});
  const shown = o.desc || '什么也没发生';
  log(`<span class="crit">奇遇 · ${S.curEvent.title}</span>：${o.label} —— ${shown}`);
  toast(`${o.label}：${shown}`);
  const ins = INSIGHTS[Math.floor(RND()*INSIGHTS.length)];
  setTimeout(() => { if(!S.over) log(`<span class="inner">${ins}</span>`); }, 600);
  show('s-battle');
  advanceWave();
}

function applyFx(fx){
  if(fx.gamble){
    if(RND() < 0.5){ SAVE.stones += 50; saveNow(); toast('赢了 50 灵石'); }
    else { SAVE.stones = Math.max(0, SAVE.stones - 40); saveNow(); toast('输了 40 灵石'); }
  }
  if(fx.hp){ S.hp = Math.max(1, Math.min(S.hpMax, S.hp + fx.hp)); }
  if(fx.atk) S.atkFlat = (S.atkFlat||0) + fx.atk;
  if(fx.mp){ S.mpMax += fx.mp; S.mp = Math.min(S.mpMax, S.mp + fx.mp); }
  if(fx.spell) S.spellBoost = (S.spellBoost||1) + fx.spell;
  if(fx.pills) S.pills += fx.pills;
  if(fx.talis) S.talis += fx.talis;
  if(fx.dr) S.drBonus = (S.drBonus||0) + fx.dr;
  if(fx.perWaveHeal) S.perWaveHeal = (S.perWaveHeal||0) + fx.perWaveHeal;
  if(fx.killHeal) S.killHeal = (S.killHeal||0) + fx.killHeal;
  if(fx.autoHeal) S.autoHeal = (S.autoHeal||0) + fx.autoHeal;
  if(fx.enemyBuff) S.enemyBuff = (S.enemyBuff||0) + fx.enemyBuff;
  if(fx.stones){
    SAVE.stones = Math.max(0, SAVE.stones + fx.stones);
    if(fx.stones < 0 && SAVE.stones === 0){ /* 付不起就付到 0 */ }
    saveNow();
  }
  // 付不起的灵石，从气血里扣
  if(fx.stones < 0) S.hp = Math.max(1, S.hp + fx.stones);
  render();
}

/* ================= 逆天改命 ================= */

function defyChance(){
  const idx = RARITY.findIndex(r => r.id === S.root.id);
  const DEFY_P = [38,45,52,60,72,80,86,92,96,100,100,100];
  return table[idx] || 25;
}
function showDefy(){
  show('s-defy');
  const p = defyChance();
  $('defyRate').textContent = p + '%';
  $('defyDesc').textContent = '气血到底了。\n天上那道雷正在落下来，你还有最后一句话可以说。';
}
$('btnDefyYes').onclick = () => {
  const p = defyChance();
  if(RND() * 100 < p){
    S.hp = Math.round(S.hpMax * 0.3);
    S.defied = true;
    log('<span class="crit">你抬头看了它一眼，说：不。雷偏了。</span>');
    show('s-battle'); render();
    toast('逆天改命，成了');
  } else {
    S.forceEnding = 'defy_die';
    S.over = true; S.won = false;
    show('s-battle'); finish();
  }
};
$('btnDefyNo').onclick = () => { S.over = true; S.won = false; show('s-battle'); finish(); };

/* ================= 族谱 / 淬体 ================= */
function fmtBonus(b){
  if(!b) return '';
  const M = {hp:'气血', atk:'攻', mp:'灵力', heal:'丹效', talis:'符', pills:'丹', dr:'减伤',
             stones:'灵石', firstShield:'首击减伤', firstStrike:'首击增伤', powang:'多看意图',
             regen:'每层回血', rage:'残血增伤', spellBoost:'法术', killHeal:'击杀回血', autoHeal:'自愈'};
  return Object.entries(b).map(([k,v]) => {
    const name = M[k] || k;
    if(k === 'dr' || k === 'firstShield' || k === 'spellBoost' || k === 'rage') return `${name} +${Math.round(v*100)}%`;
    if(k === 'powang') return name;
    return `${name} ${v > 0 ? '+' : ''}${v}`;
  }).join(' · ');
}
function renderArray(){
  const cur = SAVE.array;
  $('arrayList').innerHTML = Object.entries(ARRAYS).map(([id, a]) => `
    <div class="art ${cur === id ? 'equipped' : ''}">
      <div class="top"><b>${a.name}</b><span class="tagx ${cur===id?'perm':''}">${cur===id?'已布':'未布'}</span></div>
      <small>${a.desc}</small>
      <div class="ops"><button data-arr="${id}">${cur===id?'撤阵':'布阵'}</button></div>
    </div>`).join('');
  $('arrayList').querySelectorAll('[data-arr]').forEach(b => {
    b.onclick = () => {
      SAVE.array = (SAVE.array === b.dataset.arr) ? null : b.dataset.arr;
      saveNow(); renderArray(); toast(SAVE.array ? '已布 ' + ARRAYS[SAVE.array].name : '已撤阵');
    };
  });
}

function renderClan(){
  const z = ZHOU.find(x => x.id === SAVE.zhou);
  const b = BLOOD.find(x => x.id === SAVE.blood);
  const it = IDENT.find(x => x.id === SAVE.ident);
  const lv = SAVE.fanguLv || 0;
  const ev = FANGU_EVOLVE[lv];
  $('clanBox').innerHTML = `
    <div class="art"><div class="top"><b>${z ? z.name + '·' + z.adj : '未定'}</b>
      <span class="tagx">${z ? z.note : ''}</span></div>
      <small>${z ? fmtBonus(z.bonus) : ''}</small></div>
    <div class="art"><div class="top"><b>${b ? b.name + '血脉' : '未定'}</b>
      <span class="tagx perm">血脉</span></div><small>${b ? b.desc : ''}</small></div>
    <div class="art"><div class="top"><b>${it ? it.name : '未定'}</b>
      <span class="tagx">入道身份</span></div><small>${it ? it.desc : ''}</small></div>
    <div class="art"><div class="top"><b>凡骨进度：${ev.name}</b>
      <span class="tagx">${lv}/3</span></div>
      <small>攻 ${ev.atk} · 血 ${ev.hp} · 灵力 ${ev.mp}${ev.spell?' · 术 '+ev.spell:''}</small></div>`;
  $('btnEvolve').disabled = lv >= 3;
  $('btnEvolve').textContent = lv >= 3 ? '已至先天道体' : `淬体 · 80 灵石（第 ${lv+1} 阶）`;
  $('evolveHint').textContent = lv >= 3 ? '凡骨之路走到头了。' : '凡骨也能一步步熬上来——花灵石淬体，下次抽到凡骨就是新的身子。';
}
$('btnEvolve').onclick = () => {
  if((SAVE.fanguLv||0) >= 3) return;
  if(SAVE.stones < 80){ toast('灵石不足，需 80'); return; }
  SAVE.stones -= 80; SAVE.fanguLv = (SAVE.fanguLv||0) + 1; saveNow();
  $('caveStones').textContent = SAVE.stones;
  renderClan();
  toast('淬体成功：' + FANGU_EVOLVE[SAVE.fanguLv].name);
  burst(innerWidth/2, innerHeight*0.4, '#8fe0c0', 30, 6);
};

/* ================= 结局分享卡 ================= */
const CARD_W = 750, CARD_H = 1334;

function wrapText(g, text, x, y, maxW, lh){
  const lines = [];
  let line = '';
  for(const ch of [...text]){
    if(ch === '\n'){ lines.push(line); line = ''; continue; }
    const test = line + ch;
    if(g.measureText(test).width > maxW){ lines.push(line); line = ch; }
    else line = test;
  }
  if(line) lines.push(line);
  lines.forEach((l, i) => g.fillText(l, x, y + i*lh));
  return y + lines.length * lh;
}

function drawCard(){
  const c = $('shareCanvas'), g = c.getContext('2d');
  const W = CARD_W, H = CARD_H;
  const e = ENDINGS[S.endingId] || {name:'未名之劫', text:''};
  const st = starsOf();

  // 底
  const bg = g.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#1b1420'); bg.addColorStop(.55,'#0e0a12'); bg.addColorStop(1,'#08060b');
  g.fillStyle = bg; g.fillRect(0,0,W,H);

  // 顶光
  const halo = g.createRadialGradient(W/2, 210, 20, W/2, 210, 420);
  halo.addColorStop(0,'rgba(212,175,55,.20)');
  halo.addColorStop(1,'rgba(212,175,55,0)');
  g.fillStyle = halo; g.fillRect(0,0,W,600);

  // 星点
  for(let i=0;i<90;i++){
    g.fillStyle = `rgba(255,255,255,${RND()*0.16})`;
    g.beginPath(); g.arc(RND()*W, RND()*H, RND()*1.6, 0, 7); g.fill();
  }

  // 金框
  g.strokeStyle = 'rgba(212,175,55,.35)'; g.lineWidth = 2;
  g.strokeRect(24, 24, W-48, H-48);
  g.strokeStyle = 'rgba(212,175,55,.12)'; g.lineWidth = 1;
  g.strokeRect(36, 36, W-72, H-72);

  g.textAlign = 'center';

  // 头
  g.fillStyle = 'rgba(212,175,55,.75)';
  g.font = '600 26px -apple-system,"PingFang SC","Noto Sans SC",sans-serif';
  g.letterSpacing = '10px';
  g.fillText('每 日 天 劫', W/2, 116);
  g.letterSpacing = '0px';

  // 星级
  g.fillStyle = '#d4af37';
  g.font = '600 40px serif';
  g.fillText('★'.repeat(st) + '☆'.repeat(3-st), W/2, 186);

  // 结局名（自动缩字号）
  let fs = 66;
  g.font = `700 ${fs}px -apple-system,"PingFang SC","Noto Sans SC",sans-serif`;
  while(g.measureText(e.name).width > W-140 && fs > 34){
    fs -= 4; g.font = `700 ${fs}px -apple-system,"PingFang SC","Noto Sans SC",sans-serif`;
  }
  g.fillStyle = '#f0e2b4';
  g.shadowColor = 'rgba(212,175,55,.55)'; g.shadowBlur = 26;
  g.fillText(e.name, W/2, 292);
  g.shadowBlur = 0;

  // 身份行
  g.fillStyle = 'rgba(200,190,210,.72)';
  g.font = '400 26px -apple-system,"PingFang SC","Noto Sans SC",sans-serif';
  const realmName = ENDINGS[S.endingId] && ENDINGS[S.endingId].realm
    ? REALMS.find(r => r.id === ENDINGS[S.endingId].realm).name : '未入品';
  g.fillText(`${realmName} · ${S.root.name}`, W/2, 344);

  // 分隔
  g.strokeStyle = 'rgba(212,175,55,.22)'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(150, 384); g.lineTo(W-150, 384); g.stroke();

  // 结局文
  g.fillStyle = 'rgba(220,212,228,.86)';
  g.font = '400 27px -apple-system,"PingFang SC","Noto Sans SC",sans-serif';
  const body = (e.text || '').trim() + (S.statsLine ? '\n' + S.statsLine : '');
  const endY = wrapText(g, body, W/2, 440, W-190, 46);

  // 金句（分享卡的核心——让人想截图的就是这一句）
  const pool = (typeof INNER_LINES !== 'undefined') ? INNER_LINES : ['心里那口气，还没散。'];
  const qLine = pick(pool);
  g.fillStyle = 'rgba(240,226,180,.95)';
  g.font = 'italic 400 29px -apple-system,"PingFang SC","Noto Sans SC",sans-serif';
  const qEndY = wrapText(g, '「' + qLine + '」', W/2, endY + 34, W-200, 46);

  // 数据三格
  const stats = [
    ['回合', S.turns],
    ['气血', Math.max(0, Math.round(S.hp)) + '/' + S.hpMax],
    ['评分', S.lastScore || 0]
  ];
  const bw = 180, gap = 24, startX = (W - (bw*3 + gap*2)) / 2;
  const by = Math.min(Math.max((typeof qEndY === 'number' ? qEndY : endY) + 70, 640), 980);
  stats.forEach(([k,v],i) => {
    const x = startX + i*(bw+gap);
    g.fillStyle = 'rgba(255,255,255,.035)';
    g.fillRect(x, by, bw, 120);
    g.strokeStyle = 'rgba(212,175,55,.18)'; g.strokeRect(x, by, bw, 120);
    g.fillStyle = 'rgba(180,170,195,.7)'; g.font = '400 20px sans-serif';
    g.fillText(k, x + bw/2, by + 40);
    g.fillStyle = '#f0e2b4'; g.font = '600 34px -apple-system,"PingFang SC",sans-serif';
    g.fillText(String(v), x + bw/2, by + 90);
  });

  // 底
  g.fillStyle = 'rgba(212,175,55,.9)';
  g.font = '600 32px -apple-system,"PingFang SC",sans-serif';
  g.fillText('来 渡 你 自 己 的 劫', W/2, H-162);
  g.fillStyle = 'rgba(180,170,195,.6)';
  g.font = '400 26px ui-monospace,Menlo,monospace';
  g.fillText('cointaboo.github.io/dujie', W/2, H-108);
  g.fillStyle = 'rgba(140,130,155,.5)';
  g.font = '400 19px sans-serif';
  g.fillText(new Date().toLocaleDateString('zh-CN'), W/2, H-72);
}

function openCard(){
  if(!S || !S.endingId) return;
  drawCard();
  show('s-card');
}

$('btnPossess').onclick = () => openPossess();
$('btnPossessBack').onclick = () => show('s-result');

$('btnReborn').onclick = () => {
  SAVE.legacy = Math.min(3, (SAVE.legacy||0) + 1);
  SAVE.stones += 10;
  SAVE.endings['reincarnate'] = (SAVE.endings['reincarnate']||0) + 1;
  saveNow();
  $('btnReborn').disabled = true;
  $('btnReborn').textContent = `残魂已附身（第 ${SAVE.legacy} 世）· 下一局多带 ${SAVE.legacy} 丹`;
  $('resEnding').innerHTML = `<b style="color:var(--gold)">残魂转世</b><br>${ENDINGS.reincarnate.text.replace(/\n/g,'<br>')}`;
  toast('残魂入世 · 灵石 +10');
};

$('btnMakeCard').onclick = openCard;
$('btnCloseCard').onclick = () => show('s-result');
$('btnSaveCard').onclick = () => {
  const c = $('shareCanvas');
  const a = document.createElement('a');
  a.download = `渡劫-${(ENDINGS[S.endingId]||{}).name || 'ending'}.png`;
  a.href = c.toDataURL('image/png');
  a.click();
  toast('已保存到相册/下载');
};
$('btnCopyCard').onclick = () => {
  const e = ENDINGS[S.endingId] || {};
  const txt = `我在「每日天劫」渡出了【${e.name}】\n${S.root.name} · ${S.turns} 回合 · 评分 ${S.lastScore||0}\n${(e.text||'').replace(/\n/g,' ')}\n来渡你自己的劫：cointaboo.github.io/dujie`;
  if(navigator.clipboard) navigator.clipboard.writeText(txt).catch(()=>{});
  toast('文案已复制，可直接发群');
};

/* ================= 防破解：冻结数据表 + 自洽校验 ================= */
[RARITY, ARTS, REALMS, FATE_DEATH, FATE_WIN, EVENTS, ZHOU, BLOOD, IDENT, FANGU_EVOLVE]
  .forEach(t => { try{ Object.freeze(t); }catch(e){} });
ENDINGS.renjian = {id:'renjian', name:'人间清醒', realm:'xian',
  text:'你把十句话都记住了。\n天门没开，你也不想进了。\n你回到人间，把日子过得像日子。\n\n所谓得道，不过是终于肯放过自己。'};
try{ Object.freeze(ENDINGS); }catch(e){}

function selfConsistent(){
  if(!S) return false;
  if(S.hist.length !== S.turns) return false;                 // 回合数必须和操作记录一致
  if(S.hp > S.hpMax + 1) return false;                        // 气血不能超过上限
  if(S.hp < -60) return false;                                // 不能死得太离谱
  if(S.turns < 1 && !S.yielded) return false;
  return true;
}

/* ================= 绑定 ================= */
$('btnRoll').onclick = doRoll;
$('btnUseLast').onclick = () => {
  const r = RARITY.find(x => x.id === SAVE.selectedRoot);
  if(!r) return;
  rolled = r;
  renderPrep(); show('s-prep');
};
$('btnKeep').onclick = () => {
  if(!rolled) return;
  SAVE.selectedRoot = rolled.id; saveNow();
  renderPrep(); show('s-prep');
};
$('btnEnter').onclick = () => {
  const today = new Date().toISOString().slice(0,10);
  if(SAVE.dayKey !== today){ SAVE.dayKey = today; SAVE.dayRuns = 0; }
  const LIMIT = 5;
  if((SAVE.dayRuns || 0) >= LIMIT){
    if((SAVE.stones || 0) < 30){ toast('今日五次已尽。明日再来，或攒够 30 灵石续劫'); return; }
    SAVE.stones -= 30; toast('花 30 灵石续劫');
  }
  SAVE.dayRuns = (SAVE.dayRuns || 0) + 1; saveNow();
  const r = rolled || RARITY.find(x => x.id === SAVE.selectedRoot) || RARITY[0];
  startBattle(r);
};
$('btnBackGacha').onclick = () => show('s-gacha');
$('btnAgain').onclick = () => {
  const r = RARITY.find(x => x.id === SAVE.selectedRoot);
  if(r){ rolled = r; renderPrep(); show('s-prep'); return; }
  rolled = null; $('btnKeep').disabled = true;
  $('rarityCard').classList.remove('show'); show('s-gacha'); refreshRollUI();
};
$('btnDex').onclick = () => { renderDex(); show('s-dex'); };
$('btnDexBack').onclick = () => show('s-result');
document.querySelectorAll('.act').forEach(b => { b.onclick = () => act(b.dataset.act); });
$('btnYield').onclick = () => act('yield');

refreshRollUI();

})();
