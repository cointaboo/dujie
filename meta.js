'use strict';

/* ============================================================
   出身：九州古称(16) × 血脉(20) × 身份(20)
   ============================================================ */

const ZHOU = [
  {id:'ji',    name:'冀州', adj:'燕赵之地', note:'自古多慷慨悲歌之士', bonus:{hp:4}},
  {id:'yan',   name:'兖州', adj:'河济之间', note:'土厚水深，人多耐苦',   bonus:{dr:0.02}},
  {id:'qing',  name:'青州', adj:'海岱之滨', note:'近海多商，家底殷实',   bonus:{stones:15}},
  {id:'xu',    name:'徐州', adj:'泗水之阳', note:'民风悍勇，习武成风',   bonus:{atk:1}},
  {id:'yang',  name:'扬州', adj:'江淮之间', note:'富庶之地，多金多药',   bonus:{heal:6}},
  {id:'jing',  name:'荆州', adj:'云梦之泽', note:'水汽重，灵气足',       bonus:{mp:2}},
  {id:'yu',    name:'豫州', adj:'中原腹地', note:'天下之中，人脉广',     bonus:{stones:10}},
  {id:'liang', name:'梁州', adj:'巴蜀之险', note:'山高路远，身体结实',   bonus:{hp:6}},
  {id:'yong',  name:'雍州', adj:'关中之固', note:'古都所在，家学深厚',   bonus:{heal:4}},
  {id:'you',   name:'幽州', adj:'北陲苦寒', note:'冷地方长大的人不怕疼', bonus:{dr:0.03}},
  {id:'bing',  name:'并州', adj:'塞上风沙', note:'马背上长大的',         bonus:{atk:2, hp:-4}},
  {id:'ying',  name:'营州', adj:'辽东之外', note:'离天最近的地方',       bonus:{mp:1, hp:2}},
  {id:'jiao',  name:'交州', adj:'岭南瘴地', note:'毒虫多，命也硬',       bonus:{hp:3, dr:0.01}},
  {id:'yi',    name:'益州', adj:'天府之国', note:'沃野千里，不缺粮',     bonus:{hp:5, heal:3}},
  {id:'shuo',  name:'朔州', adj:'大漠之北', note:'风里长大的',           bonus:{atk:1, mp:1}},
  {id:'ning',  name:'宁州', adj:'西南夷地', note:'山里人会点巫术',       bonus:{mp:3}}
];

const BLOOD = [
  {id:'jianzhong', name:'剑冢',  desc:'家传一剑，代代不改',       bonus:{atk:2}},
  {id:'dange',     name:'丹阁',  desc:'祖上开炉炼丹三百年',       bonus:{heal:8}},
  {id:'fumen',     name:'符门',  desc:'一屋子黄纸朱砂',           bonus:{talis:1}},
  {id:'xuanniao',  name:'玄鸟',  desc:'血脉里有鸟的影子',         bonus:{firstShield:0.20}},
  {id:'qilin',     name:'麒麟',  desc:'生下来就比人结实',         bonus:{hp:8}},
  {id:'taixu',     name:'太虚',  desc:'祖上出过一位散人',         bonus:{mp:2}},
  {id:'chiyou',    name:'蚩尤',  desc:'血里有股不肯服的东西',     bonus:{rage:0.25}},
  {id:'wenqu',     name:'文曲',  desc:'读书人家的孩子',           bonus:{stones:20}},
  {id:'qinglong',  name:'青龙',  desc:'东方七宿护着的族',         bonus:{atk:1, hp:4}},
  {id:'baihu',     name:'白虎',  desc:'杀伐之气，代代相传',       bonus:{atk:3, hp:-5}},
  {id:'zhuque',    name:'朱雀',  desc:'火里飞出来的',             bonus:{spellBoost:0.15}},
  {id:'xuanwu',    name:'玄武',  desc:'活得久，看得多',           bonus:{dr:0.04}},
  {id:'taotie',    name:'饕餮',  desc:'吃过的东西都变成力气',     bonus:{killHeal:6}},
  {id:'jiuwei',    name:'九尾',  desc:'幻术世家的血脉',           bonus:{firstShield:0.35}},
  {id:'leize',     name:'雷泽',  desc:'生在有雷的泽边',           bonus:{spellBoost:0.25}},
  {id:'zhulong',   name:'烛龙',  desc:'睁眼为昼，闭眼为夜',       bonus:{mp:3, hp:3}},
  {id:'baize',     name:'白泽',  desc:'知道万物的名字',           bonus:{powang:true}},
  {id:'qiongqi',   name:'穷奇',  desc:'专吃好人',                 bonus:{rage:0.35, hp:-3}},
  {id:'kunpeng',   name:'鲲鹏',  desc:'一振翅九万里',             bonus:{firstStrike:1.25}},
  {id:'fenghuang', name:'凤凰',  desc:'烧过一次，又活过来',       bonus:{autoHeal:12}}
];

const IDENT = [
  {id:'sanxiu',   name:'散修',    desc:'没人管你，也没人教你',       bonus:{}},
  {id:'qitu',     name:'宗门弃徒',desc:'被逐出山门，功法只学了一半', bonus:{atk:1, hp:-5}},
  {id:'huangzi',  name:'皇子',    desc:'不缺钱，缺的是命',           bonus:{stones:30}},
  {id:'yaotong',  name:'药童',    desc:'从小在药炉边长大',           bonus:{pills:1}},
  {id:'liehu',    name:'猎户',    desc:'第一箭从不落空',             bonus:{firstStrike:1.3}},
  {id:'shuoshu',  name:'说书人',  desc:'听过的劫，比走过的路多',     bonus:{powang:true}},
  {id:'tiejiang', name:'铁匠',    desc:'打了一辈子铁，也打自己',     bonus:{dr:0.03}},
  {id:'youyi',    name:'游医',    desc:'走到哪治到哪',               bonus:{regen:3}},
  {id:'zhangfang',name:'账房',    desc:'算得比谁都清',               bonus:{stones:25}},
  {id:'biaoshi',  name:'镖师',    desc:'护了一辈子别人的货',         bonus:{dr:0.02, hp:4}},
  {id:'shushi',   name:'术士',    desc:'画符比吃饭熟',               bonus:{spellBoost:0.2}},
  {id:'qiaofu',   name:'樵夫',    desc:'一天砍八担柴',               bonus:{atk:1}},
  {id:'yuweng',   name:'渔翁',    desc:'在江上等了四十年',           bonus:{mp:1, heal:4}},
  {id:'shusheng', name:'书生',    desc:'读过三千卷，没动过手',       bonus:{mp:3, atk:-1}},
  {id:'junhu',    name:'军户',    desc:'世代当兵，死过好几回',       bonus:{hp:7, stones:-10}},
  {id:'zhiniang', name:'织娘',    desc:'一根线能绕三里',             bonus:{heal:5, dr:0.02}},
  {id:'zhuyou',   name:'祝由',    desc:'会念些没人听懂的话',         bonus:{heal:10, atk:-1}},
  {id:'shouling', name:'守陵人',  desc:'守着别人的坟，见惯了死',     bonus:{dr:0.05}},
  {id:'yaogong',  name:'窑工',    desc:'烧过整座山',                 bonus:{spellBoost:0.15, hp:3}},
  {id:'qier',     name:'乞儿',    desc:'什么都没有，也就不怕失去',   bonus:{pills:1, stones:-20}}
];

const FANGU_EVOLVE = [
  {name:'凡骨·无灵根', atk:9,  spell:0,  hp:100, mp:0,  dr:0.50},
  {name:'淬体·凡躯',   atk:11, spell:0,  hp:108, mp:2,  dr:0.47},
  {name:'后天圣体',    atk:13, spell:18, hp:114, mp:6,  dr:0.44},
  {name:'先天道体',    atk:16, spell:26, hp:120, mp:10, dr:0.40}
];

function rollZhou(){ return ZHOU[Math.floor(Math.random()*ZHOU.length)]; }
function rollBlood(){ return BLOOD[Math.floor(Math.random()*BLOOD.length)]; }
function rollIdent(){ return IDENT[Math.floor(Math.random()*IDENT.length)]; }
