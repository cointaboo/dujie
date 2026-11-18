'use strict';

/* ============================================================
   出身：九州古称 × 血脉 × 身份
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
  {id:'yong',  name:'雍州', adj:'关中之固', note:'古都所在，家学深厚',   bonus:{spell:2}},
  {id:'you',   name:'幽州', adj:'北陲苦寒', note:'冷地方长大的人不怕疼', bonus:{dr:0.03}},
  {id:'bing',  name:'并州', adj:'塞上风沙', note:'马背上长大的',         bonus:{atk:2, hp:-4}},
  {id:'ying',  name:'营州', adj:'辽东之外', note:'离天最近的地方',       bonus:{mp:1, hp:2}}
];

const BLOOD = [
  {id:'jianzhong', name:'剑冢',  desc:'家传一剑，代代不改',     bonus:{atk:2}},
  {id:'dange',     name:'丹阁',  desc:'祖上开炉炼丹三百年',     bonus:{heal:8}},
  {id:'fumen',     name:'符门',  desc:'一屋子黄纸朱砂',         bonus:{talis:1}},
  {id:'xuanniao',  name:'玄鸟',  desc:'血脉里有鸟的影子',       bonus:{firstShield:0.20}},
  {id:'qilin',     name:'麒麟',  desc:'生下来就比人结实',       bonus:{hp:8}},
  {id:'taixu',     name:'太虚',  desc:'祖上出过一位散人',       bonus:{mp:2}},
  {id:'chiyou',    name:'蚩尤',  desc:'血里有股不肯服的东西',   bonus:{rage:0.25}},
  {id:'wenqu',     name:'文曲',  desc:'读书人家的孩子',         bonus:{stones:20}}
];

const IDENT = [
  {id:'sanxiu',  name:'散修',     desc:'没人管你，也没人教你',       bonus:{}},
  {id:'qitu',    name:'宗门弃徒', desc:'被逐出山门，功法只学了一半', bonus:{atk:1, hp:-5}},
  {id:'huangzi', name:'皇子',     desc:'不缺钱，缺的是命',           bonus:{stones:30}},
  {id:'yaotong', name:'药童',     desc:'从小在药炉边长大',           bonus:{pills:1}},
  {id:'liehu',   name:'猎户',     desc:'第一箭从不落空',             bonus:{firstStrike:1.3}},
  {id:'shuoshu', name:'说书人',   desc:'听过的劫，比走过的路多',     bonus:{powang:true}},
  {id:'tiejiang',name:'铁匠',     desc:'打了一辈子铁，也打自己',     bonus:{dr:0.03}},
  {id:'youyi',   name:'游医',     desc:'走到哪治到哪',               bonus:{regen:3}}
];

/* 凡骨进化线 */
const FANGU_EVOLVE = [
  {name:'凡骨·无灵根', atk:9,  spell:0,  hp:100, mp:0,  dr:0.50},
  {name:'淬体·凡躯',   atk:11, spell:0,  hp:108, mp:2,  dr:0.47},
  {name:'后天圣体',    atk:13, spell:18, hp:114, mp:6,  dr:0.44},
  {name:'先天道体',    atk:16, spell:26, hp:120, mp:10, dr:0.40}
];

function rollZhou(){ return ZHOU[Math.floor(Math.random()*ZHOU.length)]; }
function rollBlood(){ return BLOOD[Math.floor(Math.random()*BLOOD.length)]; }
function rollIdent(){ return IDENT[Math.floor(Math.random()*IDENT.length)]; }
