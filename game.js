'use strict';

/* ================= 灵根 ================= */
const RARITY = [
  {id:'fangu',  name:'凡骨·无灵根', p:0.6200, color:'#8b8197', odds:'六成的人，终生无灵根',
   atk:9,  spell:0,  hp:100, mp:0,  dr:0.50, selfDrain:1, desperate:true, extraPills:2,
   desc:'没有灵力，用不了法术，肉身每回合自行损耗。\n但凡人有一种东西修士没有——气血见底时，反而更狠。'},
  {id:'xia',    name:'下品灵根', p:0.2600, color:'#7f8f7a', odds:'四个人里有一个',
   atk:10, spell:20, hp:100, mp:8,  dr:0.48,
   desc:'勉强能引气入体。法术粗浅，但总归比凡人多一条路。'},
  {id:'zhong',  name:'中品灵根', p:0.0820, color:'#6f9fb8', odds:'十二个人里有一个',
   atk:12, spell:24, hp:105, mp:10, dr:0.46,
   desc:'资质中上。放在寻常宗门，算个内门弟子。'},
  {id:'shang',  name:'上品灵根', p:0.0310, color:'#8f7fc4', odds:'三十二个人里有一个',
   atk:14, spell:27, hp:110, mp:12, dr:0.44,
   desc:'万里挑一的资质，宗门会抢。'},
  {id:'jipin',  name:'极品灵根', p:0.0062, color:'#c9a227', odds:'一百六十人里有一个（百里挑一）',
   atk:16, spell:30, hp:115, mp:14, dr:0.42, respect:true,
   desc:'天生道种。你出生那天，山门的老钟自己响了。'},
  {id:'tian',   name:'天灵根', p:0.0007, color:'#e0b34a', odds:'一千四百人里有一个',
   atk:18, spell:34, hp:120, mp:16, dr:0.40, respect:true,
   desc:'天道偏心。你呼吸就是修行。'},
  {id:'hundun', name:'混沌道体', p:0.00008, color:'#d4544a', odds:'一万二千五百人里有一个（万里挑一）',
   atk:21, spell:40, hp:126, mp:20, dr:0.36, respect:true,
   desc:'五行不入你身，天劫在你眼里只是天气。'},
  {id:'daotai', name:'先天道胎', p:0.00001, color:'#f0e6ff', odds:'十万人里有一个（十万里挑一）',
   atk:25, spell:48, hp:132, mp:24, dr:0.30, respect:true,
   desc:'你不曾出生，你是被天地"显化"出来的。\n这一世，是来收账的。'}
];

/* ================= 结局 ================= */
const ENDINGS = {
  ascend_fly:  {name:'白日飞升', text:'衣不沾尘，雷不落身。一次丹药都没用，你就是这样走上去了。\n山下的人只看见一道光。'},
  ascend_hard: {name:'破劫而出', text:'雷停了，你还站着。\n身上焦黑，手在抖，但你还站着。'},
  ascend_bare: {name:'残躯渡劫', text:'气血将尽，你靠最后一口气撑过第三道雷。\n活下来了。下次不一定。'},
  mortal_win:  {name:'凡骨渡劫', text:'没有灵力，用不了法术，肉身每回合都在烂。\n你就是这样一寸一寸爬过了天劫。\n史书上没有你的名字，但雷知道。'},
  chaos_win:   {name:'混沌归一', text:'天劫劈在你身上，像雨落进海里。\n它甚至不知道自己失败了。'},
  demon_pact:  {name:'心魔共生', text:'你答应了它。它借你力，你借它眼。\n你渡过了劫，但从今往后，镜子里的人偶尔会先动。'},
  dao_heart:   {name:'道心不灭', text:'它在耳边许了你一生的顺遂，你说不必。\n你带着残躯走下山，道心比来时更硬。'},
  die_first:   {name:'道消', text:'第一道雷就把你打散了。\n石碑上还没有你的位置。'},
  die_second:  {name:'心魔夺舍', text:'它没有杀你。\n它住进来，然后把你赶了出去。\n现在用这副身子说话的，不是你。'},
  die_third:   {name:'兵解', text:'只差最后一道。\n你的剑断在第九个回合。'},
  fire_death:  {name:'走火入魔', text:'你烧得太旺了。\n火给了你力量，也提前烧完了你的经脉。'},
  yield:       {name:'苟活', text:'你退了。\n活着，但每次闭眼都听见雷声。'}
};

/* ================= 敌人 ================= */
const WAVES = [
  {name:'劫云', hp:46, seq:[['atk',8],['atk',8],['charge',0],['atk',15],['atk',7]], talk:'cloud'},
  {name:'心魔', hp:62, seq:[['atk',7],['guard',8],['atk',12],['charge',0],['atk',17],['atk',6]], talk:'demon'},
  {name:'天雷', hp:84, seq:[['atk',9],['charge',0],['atk',18],['atk',8],['guard',10],['atk',13],['charge',0],['atk',20]], talk:'thunder'}
];
const ENRAGE_FROM = 8, ENRAGE_STEP = 0.08, ENRAGE_CAP = 2.0, ATK_MULT = 1.7;
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
const DEFAULT_SAVE = {stones:0, pills:0, talis:0, endings:{}, roots:{}, runs:0, best:0, board:[], rolls:0, rollDay:''};
let SAVE = loadSave();
function loadSave(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if(!raw) return {...DEFAULT_SAVE};
    const s = JSON.parse(raw);
    Object.keys(DEFAULT_SAVE).forEach(k => { if(s[k] === undefined) s[k] = DEFAULT_SAVE[k]; });
    const today = new Date().toISOString().slice(0,10);
    if(s.rollDay !== today){ s.rollDay = today; s.rolls = 0; }
    return s;
  }catch(e){ return {...DEFAULT_SAVE}; }
}
function saveNow(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); }catch(e){} }

/* ================= 工具 ================= */
const $ = id => document.getElementById(id);
const rnd = (a,b) => a + Math.random()*(b-a);
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const pick = a => a[Math.floor(Math.random()*a.length)];
function enrageOf(t){ return Math.min(ENRAGE_CAP, 1 + Math.max(0, t - ENRAGE_FROM) * ENRAGE_STEP); }
function show(id){ ['s-gacha','s-prep','s-battle','s-offer','s-result','s-dex'].forEach(s =>
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
    const a = Math.random()*Math.PI*2, sp = rnd(1, spread);
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

/* ================= 敌人渲染（Canvas 手绘） ================= */
const cv = $('foeCanvas'), cx = cv.getContext('2d');
const F = {wave:0, hit:0, atk:0, boom:0, speak:0, hpPct:1, t:0};

function bolt(x1,y1,x2,y2,depth,alpha){
  const seg = 5, pts=[[x1,y1]];
  for(let i=1;i<seg;i++){
    const k=i/seg;
    pts.push([x1+(x2-x1)*k + rnd(-14,14), y1+(y2-y1)*k + rnd(-10,10)]);
  }
  pts.push([x2,y2]);
  cx.save();
  cx.globalAlpha = alpha;
  cx.strokeStyle = '#dfe6ff'; cx.lineWidth = 2.2; cx.shadowColor = '#9fb6ff'; cx.shadowBlur = 16;
  cx.beginPath(); cx.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++) cx.lineTo(pts[i][0],pts[i][1]);
  cx.stroke();
  if(depth>0) bolt(x2,y2, x2+rnd(-40,40), y2+rnd(10,40), depth-1, alpha*0.6);
  cx.restore();
}

function drawCloud(W,H){
  const t=F.t;
  const blobs=[[.50,.44,54],[.32,.52,40],[.68,.52,42],[.44,.33,36],[.60,.36,32],[.5,.58,30]];
  blobs.forEach(([x,y,r],i)=>{
    const px=W*x+Math.sin(t*.8+i*1.4)*9, py=H*y+Math.cos(t*.62+i)*7;
    const g=cx.createRadialGradient(px,py,2,px,py,r);
    g.addColorStop(0,'rgba(126,114,158,.60)');
    g.addColorStop(.55,'rgba(58,44,80,.55)');
    g.addColorStop(1,'rgba(18,12,26,0)');
    cx.fillStyle=g; cx.beginPath(); cx.arc(px,py,r,0,7); cx.fill();
  });
  // 双眼
  const ex=W/2, ey=H*.46;
  [-16,16].forEach((dx,i)=>{
    const g=cx.createRadialGradient(ex+dx,ey,1,ex+dx,ey,13);
    g.addColorStop(0,'rgba(255,220,180,.95)');
    g.addColorStop(.4,'rgba(232,98,79,.75)');
    g.addColorStop(1,'rgba(232,98,79,0)');
    cx.fillStyle=g; cx.beginPath(); cx.arc(ex+dx,ey,13,0,7); cx.fill();
  });
  // 雨丝
  cx.save();
  cx.strokeStyle = 'rgba(150,160,200,.25)';
  cx.lineWidth = 1;
  for(let i=0;i<14;i++){
    const rx = ((i*53 + t*160) % (W+40)) - 20;
    const ry = ((i*37 + t*300) % (H+40)) - 20;
    cx.beginPath(); cx.moveTo(rx, ry); cx.lineTo(rx-4, ry+16); cx.stroke();
  }
  cx.restore();

  // 闪电
  if(F.charged || F.atk>0 || Math.random()<0.015){
    bolt(W*.30,H*.34, W*.52,H*.62, 2, .9);
  }
  if(Math.random()<0.008) bolt(W*.70,H*.30, W*.60,H*.60, 1, .7);
}

function drawDemon(W,H){
  const t=F.t;
  const sway = Math.sin(t*1.1)*4 + (F.atk>0? F.atk*26:0);
  const cy0 = H*.52 + Math.cos(t*.9)*3;
  // 背景红雾
  const bg=cx.createRadialGradient(W/2,H*.55,10,W/2,H*.55,120);
  bg.addColorStop(0,'rgba(150,40,40,.20)'); bg.addColorStop(1,'rgba(150,40,40,0)');
  cx.fillStyle=bg; cx.fillRect(0,0,W,H);
  // 身
  cx.save(); cx.translate(sway, 0);
  cx.fillStyle='rgba(14,8,14,.95)';
  cx.beginPath();
  cx.moveTo(W*.5-46, H*.95);
  cx.bezierCurveTo(W*.5-44, H*.62, W*.5-28, H*.55, W*.5-16, H*.52);
  cx.lineTo(W*.5+16, H*.52);
  cx.bezierCurveTo(W*.5+28, H*.55, W*.5+44, H*.62, W*.5+46, H*.95);
  cx.closePath(); cx.fill();
  // 头
  cx.beginPath(); cx.ellipse(W*.5, cy0-H*.10, 26, 30, 0, 0, 7); cx.fill();
  // 眼
  const glow = 0.65 + Math.sin(t*2.2)*0.2 + (F.speak>0?0.2:0);
  [-11,11].forEach(dx=>{
    const g=cx.createRadialGradient(W*.5+dx, cy0-H*.10, 1, W*.5+dx, cy0-H*.10, 11);
    g.addColorStop(0,`rgba(255,190,170,${glow})`);
    g.addColorStop(.45,`rgba(226,70,60,${glow*0.8})`);
    g.addColorStop(1,'rgba(226,70,60,0)');
    cx.fillStyle=g; cx.beginPath(); cx.arc(W*.5+dx, cy0-H*.10, 11, 0, 7); cx.fill();
  });
  // 裂纹
  cx.strokeStyle='rgba(210,70,60,.5)'; cx.lineWidth=1;
  for(let i=0;i<3;i++){
    cx.beginPath();
    const sx=W*.5+rnd(-26,26), sy=cy0-H*.06;
    cx.moveTo(sx, sy);
    cx.lineTo(sx+rnd(-12,12), sy+18);
    cx.lineTo(sx+rnd(-14,14), sy+34);
    cx.stroke();
  }
  cx.restore();
  // 脚下影
  const sh=cx.createRadialGradient(W/2,H*.94,2,W/2,H*.94,70);
  sh.addColorStop(0,'rgba(180,40,30,.28)'); sh.addColorStop(1,'rgba(180,40,30,0)');
  cx.fillStyle=sh; cx.beginPath(); cx.ellipse(W/2,H*.94,70,12,0,0,7); cx.fill();
}

function drawThunder(W,H){
  const t=F.t;
  const pulse = .55 + Math.sin(t*3.4)*.2 + (F.charged?.25:0);
  // 天穹裂口
  const g=cx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,`rgba(150,180,255,${.18*pulse})`);
  g.addColorStop(.5,`rgba(120,150,255,${.10*pulse})`);
  g.addColorStop(1,'rgba(120,150,255,0)');
  cx.fillStyle=g; cx.fillRect(W*.30,0,W*.40,H*.8);
  // 雷柱
  cx.save();
  cx.globalAlpha=.9;
  bolt(W*.5, 6, W*.5, H*.72, 3, .95);
  if(Math.random()<.10) bolt(W*.44,H*.2, W*.56,H*.5, 2, .7);
  if(Math.random()<.06) bolt(W*.56,H*.15, W*.44,H*.55, 2, .6);
  cx.restore();
  // 地面雷斑
  const sh=cx.createRadialGradient(W/2,H*.86,4,W/2,H*.86,90);
  sh.addColorStop(0,`rgba(160,190,255,${.35*pulse})`);
  sh.addColorStop(1,'rgba(160,190,255,0)');
  cx.fillStyle=sh; cx.beginPath(); cx.ellipse(W/2,H*.86,90,16,0,0,7); cx.fill();
}

(function drawLoop(){
  F.t = performance.now()/1000;
  const W = cv.width, H = cv.height;
  cx.clearRect(0,0,W,H);
  if(F.wave === 0) drawCloud(W,H);
  else if(F.wave === 1) drawDemon(W,H);
  else drawThunder(W,H);

  if(F.hit > 0){
    cx.globalAlpha = F.hit*0.55;
    cx.fillStyle = '#fff'; cx.fillRect(0,0,W,H);
    cx.globalAlpha = 1;
    F.hit -= 0.06;
  }
  if(F.atk > 0) F.atk -= 0.02;
  if(F.speak > 0) F.speak -= 0.01;
  requestAnimationFrame(drawLoop);
})();

/* ================= 抽灵根 ================= */
let rolled = null;
function rollCost(){ return SAVE.rolls === 0 ? 0 : 30; }

function rollRarity(){
  let r = Math.random(), acc = 0;
  for(const x of RARITY){ acc += x.p; if(r <= acc) return x; }
  return RARITY[0];
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
    $('rarityCard').classList.add('show');
    $('btnKeep').disabled = false;
    burst(innerWidth/2, 190, r.color, r.p < 0.01 ? 70 : 26, r.p < 0.01 ? 8 : 4.5);
    if(r.p < 0.01) toast('稀有 · ' + r.odds);
  }, 780);
}

function refreshRollUI(){
  const cost = rollCost();
  $('btnRoll').textContent = cost === 0 ? '落 胎' : '重投胎 · ' + cost + ' 灵石';
  $('rollCount').textContent = cost === 0
    ? '今日首次投胎 · 免费'
    : `今日已测 ${SAVE.rolls} 次 · 现有灵石 ${SAVE.stones}`;
}

/* ================= 战斗 ================= */
let S = null;

function startBattle(root){
  const bonusPill = SAVE.pills, bonusTalis = SAVE.talis;
  SAVE.pills = 0; SAVE.talis = 0; saveNow();

  S = {
    root,
    hp: root.hp, hpMax: root.hp,
    mp: root.mp, mpMax: root.mp || 1,
    pills: 2 + bonusPill + (root.extraPills||0),
    talis: 1 + bonusTalis,
    wave: 0, waveTurn: 0, turns: 0,
    ehp: WAVES[0].hp, ehpMax: WAVES[0].hp,
    shield: 0, charged: false, idx: 0,
    over: false, won: false, yielded: false,
    usedItems: 0, atkBuff: 1, selfDrainExtra: 0, demonPact: false, demonRefused: false,
    offerShown: false,
    hist: [], log: []
  };
  // 还原敌人序列（拒绝心魔会临时改它）
  WAVES.forEach((w,i) => { w.seq = BASE_SEQ[i].map(x => x.slice()); });

  show('s-battle');
  F.wave = 0; F.hpPct = 1;
  setFoe(0);
  render();
  say('云层压下来了。你听见风里有东西在呼吸。');
}

function setFoe(i){
  S.wave = i; S.waveTurn = 0;
  S.ehp = WAVES[i].hp; S.ehpMax = WAVES[i].hp;
  S.shield = 0; S.charged = false; S.idx = 0;
  F.wave = i; F.hit = 0;
  $('foeName').textContent = WAVES[i].name;
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
  }, 34);
  sayTimer = setTimeout(() => el.classList.add('hidden'), 2800);
}
function demonSay(kind){
  if(WAVES[S.wave].talk !== 'demon') return;
  let pool;
  if(kind === 'start') pool = S.root.respect ? LINES.demon_respect : (S.root.id === 'fangu' ? LINES.demon_sneer : LINES.demon_start);
  else if(kind === 'real') pool = LINES.demon_real;
  else pool = LINES['demon_' + kind] || LINES.demon_start;
  say(pick(pool));
}

/* ---- 渲染 ---- */
function intentInfo(step){
  const seq = WAVES[S.wave].seq;
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
  $('waveTag').textContent = ['第一层','第二层','第三层'][S.wave] + (enr>0 ? ` · 狂暴 ${enr}%` : '');
  $('turnTag').textContent = '回合 ' + S.turns;

  $('foeName').textContent = WAVES[S.wave].name +
    (S.shield>0 ? `（护盾 ${S.shield}）` : '') + (S.charged ? '（蓄力中）' : '');
  $('foeHp').style.width = clamp(S.ehp/S.ehpMax*100,0,100) + '%';
  $('foeHpNum').textContent = Math.max(0,Math.round(S.ehp)) + ' / ' + S.ehpMax;
  F.hpPct = clamp(S.ehp/S.ehpMax,0,1);

  const first = intentInfo(0);
  const lethal = first.dmg >= S.hp;
  let html = '';
  for(let i=0;i<3;i++){
    const inf = intentInfo(i);
    const isLethal = i === 0 && lethal;
    html += `<div class="intent ${i===0?'now':''} ${inf.cls} ${isLethal?'lethal':''}">${i===0?'本回合':'+'+i}
      <b>${inf.label}${inf.value!=='—'?' '+inf.value:''}</b></div>`;
  }
  $('intents').innerHTML = html;

  $('hpBar').style.width = clamp(S.hp/S.hpMax*100,0,100) + '%';
  $('hpNum').textContent = Math.max(0,Math.round(S.hp)) + ' / ' + S.hpMax;
  if(S.root.mp === 0){
    $('mpBar').style.width = '0%';
    $('mpNum').textContent = '无灵根 · 无法术';
  } else {
    $('mpBar').style.width = clamp(S.mp/S.mpMax*100,0,100) + '%';
    $('mpNum').textContent = Math.round(S.mp) + ' / ' + S.mpMax;
  }

  $('tagRoot').textContent = S.root.name;
  $('tagPill').textContent = '丹 ×' + S.pills;
  $('tagTalis').textContent = '符 ×' + S.talis;

  $('sAtk').textContent = '伤 ' + Math.round(S.root.atk * S.atkBuff);
  $('sSpell').textContent = S.root.spell ? `灵4 伤${S.root.spell}` : '无法术';
  $('sGuard').textContent = '减伤' + Math.round((1-S.root.dr)*100) + '%';
  $('sPill').textContent = '回24';
  $('sTalis').textContent = S.talis > 0 ? '断一击' : '已用完';

  const dis = S.over;
  document.querySelectorAll('.act').forEach(b => b.disabled = dis);
  document.querySelector('[data-act=spell]').disabled = dis || !S.root.spell || S.mp < 4;
  document.querySelector('[data-act=pill]').disabled = dis || S.pills <= 0 || S.hp >= S.hpMax;
  document.querySelector('[data-act=talis]').disabled = dis || S.talis <= 0;

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
  F.atk = 1;
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
    S.hp = Math.min(S.hpMax, S.hp + 24);
    log(`服下回春丹，气血 +${Math.round(S.hp-before)}`);
    demonSay('pill');
    taken = enemyTurn(false);
  } else if(kind === 'talis'){
    S.talis--; S.usedItems++;
    dealt = Math.round(rnd(5,7));
    S.ehp -= dealt;
    hitFx('#b79cff', dealt);
    log(`<span class="crit">镇魂符</span>镇住${WAVES[S.wave].name}，其本回合无法行动`);
    demonSay('talis');
    S.idx = (S.idx+1) % WAVES[S.wave].seq.length;
    S.charged = false;
    S.hist.push({t:S.turns, act:kind, dealt, taken:0, hp:Math.round(S.hp), chargedBefore});
    return after();
  } else if(kind === 'guard'){
    guarded = true;
    S.mp = Math.min(S.mpMax, S.mp+2);
    dealt = Math.round(rnd(1.5,2.5));
    S.ehp -= dealt;
    log(`护体：灵力 +2，本回合减伤 ${Math.round((1-S.root.dr)*100)}%`);
    demonSay('guard');
    taken = enemyTurn(true);
  } else if(kind === 'spell'){
    S.mp -= 4;
    const charged = WAVES[S.wave].seq[S.idx][0] === 'charge';
    dealt = Math.round(S.root.spell * rnd(0.88,1.12) * (charged?1.5:1));
    S.ehp -= dealt;
    hitFx(S.root.color, dealt);
    log(`法术轰出，<b>${dealt}</b> 伤害` + (charged?'（趁蓄力，1.5 倍）':''));
    taken = enemyTurn(false);
  } else {
    const charged = WAVES[S.wave].seq[S.idx][0] === 'charge';
    const desp = (S.root.desperate && S.hp < S.hpMax*0.3) ? 1.6 : 1;
    dealt = Math.round(S.root.atk * S.atkBuff * desp * rnd(0.88,1.12) * (charged?1.5:1));
    S.ehp -= dealt;
    hitFx('#ffd9a0', dealt);
    log(`剑诀斩落，<b>${dealt}</b> 伤害` + (charged?'（趁蓄力，1.5 倍）':'') +
        (desp>1?' <span class="crit">不屈</span>':''));
    taken = enemyTurn(false);
  }

  S.hist.push({t:S.turns, act:kind, dealt, taken, hp:Math.round(S.hp), chargedBefore});
  after();
}

function enemyTurn(guarded){
  if(S.ehp <= 0) return 0;
  const seq = WAVES[S.wave].seq;
  const [k, v] = seq[S.idx];

  if(k === 'charge'){
    S.charged = true;
    log(`${WAVES[S.wave].name} 正在蓄力……`);
    demonSay('charge');
    S.idx = (S.idx+1) % seq.length;
    return 0;
  }
  if(k === 'guard'){
    S.shield += v;
    log(`${WAVES[S.wave].name} 凝聚护盾 +${v}`);
    S.idx = (S.idx+1) % seq.length;
    return 0;
  }

  const enrage = enrageOf(S.waveTurn);
  let dmg = Math.round(v * (S.charged?2:1) * enrage * ATK_MULT * rnd(0.9,1.1));
  S.charged = false;
  if(guarded) dmg = Math.round(dmg * S.root.dr);
  if(S.shield > 0){
    const absorb = Math.min(S.shield, dmg);
    S.shield -= absorb; dmg -= absorb;
    if(absorb > 0) log(`护盾吸收 ${absorb}`);
  }
  if(dmg > 0){
    S.hp -= dmg;
    enemyAttackFx(dmg);
    log(`<span class="bad">${WAVES[S.wave].name} 反击，气血 -${dmg}</span>`);
    if(dmg >= 25) demonSay('hit');
  }
  S.idx = (S.idx+1) % seq.length;
  return dmg;
}

function after(){
  if(S.root.selfDrain && S.hp > 0){
    S.hp -= S.root.selfDrain;
    log(`<span class="bad">凡骨肉身损耗 -${S.root.selfDrain}</span>`);
  }
  if(S.selfDrainExtra && S.hp > 0){
    S.hp -= S.selfDrainExtra;
    log(`<span class="bad">心魔反噬 -${S.selfDrainExtra}</span>`);
  }
  if(S.hp > 0 && S.hp < S.hpMax*0.3 && Math.random() < 0.55) demonSay('low');

  if(S.hp <= 0){ S.over = true; S.won = false; render(); return finish(); }

  if(S.ehp <= 0){
    log(`<span class="good">${WAVES[S.wave].name} 溃散</span>`);
    if(S.wave === 2){ S.over = true; S.won = true; render(); return finish(); }
    demonSay('kill');
    setFoe(S.wave+1);
    if(WAVES[S.wave].talk === 'demon'){ setTimeout(()=>demonSay('start'), 900); }
    else say('雷声还没到，风先到了。');
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
    S.atkBuff = 1.3; S.selfDrainExtra = 3; S.demonPact = true;
    log('<span class="crit">你接过了它的力量。攻击 +30%，每回合自损 3。</span>');
    say('很好。现在，我们是一伙的了。');
  } else if(id === 'refuse'){
    const before = S.hp;
    S.hp = Math.min(S.hpMax, S.hp + 25);
    S.demonRefused = true;
    log(`<span class="good">你说不必。气血 +${Math.round(S.hp-before)}。它恼了。</span>`);
    say('你会后悔的。我保证。');
    WAVES[1].seq = WAVES[1].seq.map(([k,v]) => [k, k==='atk' ? Math.round(v*1.15) : v]);
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
function computeEnding(){
  if(S.yielded) return {id:'yield', stars:0};
  if(S.won){
    const hpPct = S.hp/S.hpMax;
    if(S.demonPact) return {id:'demon_pact', stars:2};
    if(S.demonRefused && hpPct < .4) return {id:'dao_heart', stars:2};
    if(S.root.id === 'fangu') return {id:'mortal_win', stars: hpPct>.5?3:2};
    if(S.root.id === 'hundun' || S.root.id === 'daotai') return {id:'chaos_win', stars:3};
    if(hpPct >= .7 && S.usedItems === 0) return {id:'ascend_fly', stars:3};
    if(hpPct < .2) return {id:'ascend_bare', stars:1};
    return {id:'ascend_hard', stars: hpPct>.45?2:1};
  }
  if(S.turns >= 14 && S.root.id === 'huo') return {id:'fire_death', stars:0};
  if(S.wave === 0) return {id:'die_first', stars:0};
  if(S.wave === 1) return {id:'die_second', stars:0};
  return {id:'die_third', stars:0};
}

function finish(){
  const e = computeEnding();
  const stars = e.stars;
  const score = Math.round(stars*1000 + Math.max(0,S.hp)*3 + (S.won ? Math.max(0,40-S.turns)*10 : S.wave*120));
  const gain = S.won ? 26 + stars*8 : 8 + S.wave*4;

  SAVE.stones += gain; SAVE.runs++;
  SAVE.best = Math.max(SAVE.best, score);
  SAVE.endings[e.id] = (SAVE.endings[e.id]||0) + 1;
  SAVE.roots[S.root.id] = (SAVE.roots[S.root.id]||0) + 1;
  SAVE.board.push({score, ending:e.id, root:S.root.name});
  SAVE.board.sort((a,b)=>b.score-a.score);
  SAVE.board = SAVE.board.slice(0,8);
  saveNow();

  show('s-result');
  $('resTitle').textContent = S.won ? '渡 劫 成 功' : (S.yielded ? '你 退 了' : '劫 未 渡');
  $('resStars').textContent = '★'.repeat(stars) + '☆'.repeat(3-stars);
  $('resEnding').innerHTML = `<b style="color:var(--gold)">${ENDINGS[e.id].name}</b><br>${ENDINGS[e.id].text.replace(/\n/g,'<br>')}`;

  const rc = buildRecap();
  document.querySelector('.recap').style.display = rc ? 'block' : 'none';
  $('recapBody').innerHTML = rc;

  $('resStats').innerHTML = `
    <div class="row"><span>灵根</span><b>${S.root.name}</b></div>
    <div class="row"><span>回合</span><b>${S.turns}</b></div>
    <div class="row"><span>剩余气血</span><b>${Math.max(0,Math.round(S.hp))} / ${S.hpMax}</b></div>
    <div class="row"><span>评分</span><b>${score}</b></div>
    <div class="row"><span>灵石</span><b>+${gain}</b></div>`;

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
  const endKeys = Object.keys(ENDINGS);
  const got = endKeys.filter(k => SAVE.endings[k]);
  $('dexSum').textContent = `结局 ${got.length}/${endKeys.length} · 灵根 ${Object.keys(SAVE.roots).length}/${RARITY.length} · 累计 ${SAVE.runs} 次 · 最高分 ${SAVE.best}`;
  $('dexEndings').innerHTML = endKeys.map(k => {
    const n = SAVE.endings[k]||0;
    return `<div class="dex ${n?'got':''}"><b>${n?ENDINGS[k].name:'？？？'}</b>${n?'已见 '+n+' 次':'未解锁'}</div>`;
  }).join('');
  $('dexRoots').innerHTML = RARITY.map(r => {
    const n = SAVE.roots[r.id]||0;
    return `<div class="dex ${n?'got':''}"><b>${n?r.name:'？？？'}</b>${n?'用过 '+n+' 次':r.odds}</div>`;
  }).join('');
  $('board').innerHTML = SAVE.board.length
    ? SAVE.board.map((b,i)=>`<div class="row"><span>#${i+1} ${b.root} · ${ENDINGS[b.ending]?ENDINGS[b.ending].name:''}</span><b>${b.score}</b></div>`).join('')
    : '<div class="row"><span>还没有记录</span><b>—</b></div>';
}

/* ================= 绑定 ================= */
$('btnRoll').onclick = doRoll;
$('btnKeep').onclick = () => { if(!rolled) return; renderPrep(); show('s-prep'); };
$('btnEnter').onclick = () => startBattle(rolled);
$('btnBackGacha').onclick = () => show('s-gacha');
$('btnAgain').onclick = () => { rolled = null; $('btnKeep').disabled = true;
  $('rarityCard').classList.remove('show'); show('s-gacha'); refreshRollUI(); };
$('btnDex').onclick = () => { renderDex(); show('s-dex'); };
$('btnDexBack').onclick = () => show('s-result');
document.querySelectorAll('.act').forEach(b => { b.onclick = () => act(b.dataset.act); });

refreshRollUI();
