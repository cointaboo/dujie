'use strict';

/* ============================================================
   500 种结局 = 12 境界 × 40 终局 (480) + 20 特殊
   境界：练气 → 筑基 → 金丹 → 元婴 → 化神 → 炼虚 → 合体 → 大乘 → 渡劫 → 散仙 → 地仙 → 天仙
   ============================================================ */

const REALMS = [
  {id:'lianqi',   name:'练气', text:'你才刚把第一口气吸进丹田。\n'},
  {id:'zhuji',    name:'筑基', text:'道基成了。虽然薄，但踩得住。\n'},
  {id:'jindan',   name:'金丹', text:'一颗内丹在腹中缓缓旋转，映得你眼底发亮。\n'},
  {id:'yuanying', name:'元婴', text:'元婴出窍那一刻，你第一次看清了自己的脸。\n'},
  {id:'huashen',  name:'化神', text:'神识铺开百里，山下的蚂蚁搬家你都听得见。\n'},
  {id:'lianxu',   name:'炼虚', text:'你开始分不清哪一半是肉身，哪一半是天。\n'},
  {id:'heti',     name:'合体', text:'身与道合。呼吸之间，风向跟着你改。\n'},
  {id:'dacheng',  name:'大乘', text:'万里之内没有能伤你的东西了——除了头顶那片天。\n'},
  {id:'dujie',    name:'渡劫', text:'最后一道雷落下的地方，站着一个不肯跪的人。\n'},
  {id:'sanxian',  name:'散仙', text:'劫没渡成，人却还在。天道拿你没辙，只好把你晾着。\n'},
  {id:'dixian',   name:'地仙', text:'你已不欠这方天地什么，天地也不欠你。\n'},
  {id:'tianxian', name:'天仙', text:'天门开了。你回头看最后一眼人间，然后抬脚。\n'}
];

/* 22 种死法 */
const FATE_DEATH = [
  {id:'daoxiao',  name:'道消',      text:'你的道，在第三道雷前散了。'},
  {id:'bingjie',  name:'兵解',      text:'剑先断，人后倒。'},
  {id:'leiji',    name:'雷殛',      text:'雷把你钉在地上，还烧穿了身后的石头。'},
  {id:'duoshe',   name:'心魔夺舍',  text:'它没有杀你。它住进来，把你挤了出去。'},
  {id:'zouhuo',   name:'走火入魔',  text:'火从经脉里烧出来，比劫雷还急。'},
  {id:'dengku',   name:'油尽灯枯',  text:'不是被打死的，是烧完了。'},
  {id:'zibao',    name:'金丹自爆',  text:'你炸开自己，只换它退了半步。'},
  {id:'hunfei',   name:'魂飞魄散',  text:'连投胎的机会都没剩下。'},
  {id:'shouyuan', name:'寿元耗尽',  text:'你差一点就到了。差的那点，是一年。'},
  {id:'daoji',    name:'道基崩碎',  text:'道基裂开的声音很轻，像瓷器。'},
  {id:'shigu',    name:'尸骨无存',  text:'只剩一片焦土。'},
  {id:'jingmai',  name:'经脉尽断',  text:'灵力倒灌回丹田，身体先一步炸了。'},
  {id:'wugan',    name:'五感尽失',  text:'你还在，但已经摸不到这个世界了。'},
  {id:'kuilei',   name:'沦为傀儡',  text:'它留了你的躯壳，让别的什么住进去。'},
  {id:'jiyi',     name:'记忆被夺',  text:'你还活着，只是忘了自己为什么站在这里。'},
  {id:'xuejin',   name:'血尽而亡',  text:'血流干的时候，雷还没停。'},
  {id:'xinsi',    name:'心死',      text:'人没死。是那口气先散了。'},
  {id:'banshen',  name:'半身不遂',  text:'你活着回去了，但再也结不起印。'},
  {id:'fanshi',   name:'反噬而死',  text:'你借来的力量，最后回头吃了你。'},
  {id:'weishou',  name:'夺舍未遂',  text:'它试了三次，没挤进去。但你也快撑不住了。'},
  {id:'bingjie2', name:'兵解未成',  text:'剑碎了，人还站着，可元神已经散了。'},
  {id:'canyuan',  name:'残魂夺舍',  text:'肉身没了。一缕残魂钻进最近的一具凡人躯壳。\n修为清零，但你还在。'}
];

/* 18 种成道 */
const FATE_WIN = [
  {id:'feisheng', name:'白日飞升',   text:'你没有回头。'},
  {id:'pojie',    name:'破劫而出',   text:'雷停了，你还站着。'},
  {id:'cangqu',   name:'残躯渡劫',   text:'靠最后一口气，你爬了过去。'},
  {id:'rousheng', name:'肉身成圣',   text:'别人成仙靠元神，你靠这具不肯烂的肉身。'},
  {id:'gongde',   name:'功德圆满',   text:'你没杀它。你只是让它自己散了。'},
  {id:'bingjiex', name:'兵解成仙',   text:'肉身留在原地，剑先上了天。'},
  {id:'shijie',   name:'尸解仙',     text:'你死过一次。所以这次不算数。'},
  {id:'nitian',   name:'逆天成道',   text:'天道不认你，你也就不认它。'},
  {id:'yijian',   name:'一剑破万法', text:'它摆出千般手段，你只用了一剑。'},
  {id:'wanfa',    name:'万法归一',   text:'劫是法，你也是法。最后只剩一个。'},
  {id:'jietian',  name:'借天一线',   text:'你没赢。是天上有人替你让了一线。'},
  {id:'leichu',   name:'雷池踏歌',   text:'你在雷里走着，还哼了半句不知名的调子。'},
  {id:'fanzhen',  name:'以凡躯证道', text:'没有灵根，没有师承。你就用这具肉身证了道。'},
  {id:'xuetian',  name:'血染天门',   text:'天门是被你撞开的，不是它开的。'},
  {id:'ditou',    name:'天劫低头',   text:'它先退了。史书上只记了这一句。'},
  {id:'wusheng',  name:'无声飞升',   text:'没有雷，没有光。你就消失了，像从没来过。'},
  {id:'jiejie',   name:'借劫成道',   text:'它劈下来的雷，全被你收进了自己的道里。'},
  {id:'dameng',   name:'大梦一场',   text:'你醒过来，发现还在山门口跪着。但你已经不是原来那个人了。'}
];

const FATE = {};
FATE_DEATH.concat(FATE_WIN).forEach(f => FATE[f.id] = f);

/* 20 个特殊结局：条件优先于普通组合 */
const SPECIAL = {
  mortal_win:  {name:'凡骨渡劫',   text:'没有灵力，用不了法术，肉身每回合都在烂。\n你就是这样一寸一寸爬过了天劫。\n史书上没有你的名字，但雷知道。', special:true},
  demon_pact:  {name:'心魔共生',   text:'你答应了它。它借你力，你借它眼。\n你渡过了劫，但从今往后，镜子里的人偶尔会先动。', special:true},
  dao_heart:   {name:'道心不灭',   text:'它在耳边许了你一生的顺遂，你说不必。\n你带着残躯走下山，道心比来时更硬。', special:true},
  chaos_win:   {name:'混沌归一',   text:'天劫劈在你身上，像雨落进海里。\n它甚至不知道自己失败了。', special:true},
  ironhead:    {name:'铁头渡劫',   text:'整场你一次没护体，全靠脑门接雷。\n你居然活下来了。这不合道理，但你活着。', special:true},
  naked_win:   {name:'两袖清风',   text:'没用一颗丹，没画一张符，没带一件宝。\n你和天劫之间什么都没隔着。', special:true},
  turtle_win:  {name:'龟息千年',   text:'你护体护到了最后。雷都累了，你还没累。', special:true},
  greedy_die:  {name:'贪死的',     text:'三次在它蓄力时抢输出，三次被回敬。\n你不是输给天劫，是输给自己的手。', special:true},
  rich_die:    {name:'宝物救不了你', text:'你带了满身法宝进来，最后一件都没用对。\n东西是好东西。人是错的人。', special:true},
  no_guard_die:{name:'硬接之殁',   text:'从头到尾你都在硬接。\n最后那一下，你连抬手都省了。', special:true},
  pill_die:    {name:'药石无医',   text:'你把所有丹都吃了，气血还是没回来。\n药治伤，不治命。', special:true},
  one_hp:      {name:'一口气',     text:'气血 1 点。你就靠这 1 点站到了最后。\n天道大概也在想：这人怎么还不倒。', special:true},
  speed_win:   {name:'一气呵成',   text:'七回合。它还没热身，你已经渡完了。', special:true},
  slow_win:    {name:'熬死天劫',   text:'三十回合。雷劈累了，你还站着。', special:true},
  reincarnate: {name:'残魂转世',   text:'肉身碎在你脚下，一缕残魂钻进了山下砍柴人的身体。\n他明天一早醒来，会突然结印。', special:true},
  thousand:    {name:'千劫不倒',   text:'这是你第 100 次站在这里。\n雷还是那道雷，你已经不是那个你。', special:true},
  rich_win:    {name:'法宝护道',   text:'两件法宝替你把最狠的两下挡了。\n你说这是运气，它们说这是投资。', special:true},
  luck_win:    {name:'天不绝你',   text:'最后那一击偏了半寸。\n你活下来了。别问为什么，问就是命。', special:true},
  demon_help:  {name:'借魔成道',   text:'你答应了心魔，然后在它最得意的时候，把它一起带上了天。', special:true},
  mortal_die:  {name:'凡人不该来', text:'你连灵力都没有，就站到了这里。\n雷没有手下留情。但它记住了你。', special:true}
};

/* ---- 480 组合 + 20 特殊 = 500 ---- */
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
