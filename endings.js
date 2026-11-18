'use strict';

/* ============================================================
   境界 × 终局 = 199 种结局
   10 境界 × 19 终局 = 190，另加 9 个特殊结局
   ============================================================ */

const REALMS = [
  {id:'lianqi',   name:'练气',  text:'你才刚把第一口气吸进丹田。\n'},
  {id:'zhuji',    name:'筑基',  text:'道基成了。虽然薄，但踩得住。\n'},
  {id:'jindan',   name:'金丹',  text:'一颗内丹在腹中缓缓旋转，映得你眼底发亮。\n'},
  {id:'yuanying', name:'元婴',  text:'元婴出窍的那一刻，你第一次看清了自己的脸。\n'},
  {id:'huashen',  name:'化神',  text:'神识铺开百里，山下的蚂蚁在搬家你都听得见。\n'},
  {id:'lianxu',   name:'炼虚',  text:'你开始分不清哪一半是肉身，哪一半是天地。\n'},
  {id:'heti',     name:'合体',  text:'身与道合。呼吸之间，风向跟着你改。\n'},
  {id:'dacheng',  name:'大乘',  text:'万里之内，已经没有能伤你的东西了——除了头顶那片天。\n'},
  {id:'dujie',    name:'渡劫',  text:'最后一道雷落下的地方，站着一个不肯跪的人。\n'},
  {id:'chengxian',name:'成仙',  text:'天门开了。你回头看最后一眼人间，然后抬脚。\n'}
];

const FATE_DEATH = [
  {id:'daoxiao',   name:'道消',      text:'你的道，在第三道雷前散了。'},
  {id:'bingjie',   name:'兵解',      text:'剑先断，人后倒。'},
  {id:'leiji',     name:'雷殛',      text:'雷把你钉在地上，还烧穿了你身后的石头。'},
  {id:'duoshe',    name:'心魔夺舍',  text:'它没有杀你。它住进来，把你挤了出去。'},
  {id:'zouhuo',    name:'走火入魔',  text:'火从经脉里烧出来，比劫雷还急。'},
  {id:'dengku',    name:'油尽灯枯',  text:'不是被打死的。是烧完了。'},
  {id:'zibao',     name:'金丹自爆',  text:'你选择炸开自己，只换它退了半步。'},
  {id:'hunfei',    name:'魂飞魄散',  text:'连投胎的机会都没剩下。'},
  {id:'shouyuan',  name:'寿元耗尽',  text:'你差一点就到了。差的那一点，是一年。'},
  {id:'daoji',     name:'道基崩碎',  text:'道基裂开的声音很轻，像瓷器。'},
  {id:'shigu',     name:'尸骨无存',  text:'连骨头都没留下，只有一片焦土。'}
];

const FATE_WIN = [
  {id:'feisheng',  name:'白日飞升',  text:'你没有回头。'},
  {id:'pojie',     name:'破劫而出',  text:'雷停了，你还站着。'},
  {id:'cangqu',    name:'残躯渡劫',  text:'靠着最后一口气，你爬了过去。'},
  {id:'rousheng',  name:'肉身成圣',  text:'别人成仙靠元神，你靠这具不肯烂的肉身。'},
  {id:'gongde',    name:'功德圆满',  text:'你没杀它。你只是让它自己散了。'},
  {id:'bingjiex',  name:'兵解成仙',  text:'肉身留在原地，剑先上了天。'},
  {id:'shijie',    name:'尸解仙',    text:'你死过一次。所以这次不算数。'},
  {id:'nitian',    name:'逆天成道',  text:'天道不认你，你也就不认它。'}
];

const FATE = {};
FATE_DEATH.concat(FATE_WIN).forEach(f => FATE[f.id] = f);

/* 9 个特殊结局：条件优先于普通组合 */
const SPECIAL = {
  mortal_win: {name:'凡骨渡劫', text:'没有灵力，用不了法术，肉身每回合都在烂。\n你就是这样一寸一寸爬过了天劫。\n史书上没有你的名字，但雷知道。', special:true},
  demon_pact: {name:'心魔共生', text:'你答应了它。它借你力，你借它眼。\n你渡过了劫，但从今往后，镜子里的人偶尔会先动。', special:true},
  dao_heart:  {name:'道心不灭', text:'它在耳边许了你一生的顺遂，你说不必。\n你带着残躯走下山，道心比来时更硬。', special:true},
  chaos_win:  {name:'混沌归一', text:'天劫劈在你身上，像雨落进海里。\n它甚至不知道自己失败了。', special:true},
  ironhead:   {name:'铁头渡劫', text:'整场你一次没护体，全靠脑门接雷。\n你居然活下来了。这不合道理，但你活着。', special:true},
  naked_win:  {name:'两袖清风', text:'没用一颗丹，没画一张符，没带一件宝。\n你和天劫之间什么都没隔着。', special:true},
  turtle_win: {name:'龟息千年', text:'你护体护到了最后。雷都累了，你还没累。', special:true},
  greedy_die: {name:'贪死的',   text:'三次在它蓄力时抢输出，三次被回敬。\n你不是输给天劫，是输给自己的手。', special:true},
  rich_die:   {name:'宝物救不了你', text:'你带了满身法宝进来，最后一件都没用对。\n东西是好东西。人是错的人。', special:true}
};

/* ---- 生成 190 个组合 + 9 特殊 = 199 ---- */
const ENDINGS = {};
REALMS.forEach(r => {
  FATE_DEATH.concat(FATE_WIN).forEach(f => {
    ENDINGS[r.id + '__' + f.id] = {
      name: r.name + '·' + f.name,
      text: r.text + f.text,
      realm: r.id, fate: f.id,
      win: FATE_WIN.some(x => x.id === f.id)
    };
  });
});
Object.assign(ENDINGS, SPECIAL);
const ENDING_KEYS = Object.keys(ENDINGS);
