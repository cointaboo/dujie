'use strict';

/* ============================================================
   劫中奇遇：每局两次，清完第一层、第二层后各一次，三选一
   ============================================================ */

const EVENTS = [
  {
    id:'sanxiu', title:'路遇散修',
    text:'一个背着破剑的老头蹲在路边啃干粮。他抬头看你一眼："过劫的？"',
    opts:[
      {label:'换一部功法', desc:'攻 +2，气血 −10', fx:{atk:2, hp:-10}},
      {label:'讨教两句',   desc:'灵力 +2',        fx:{mp:2}},
      {label:'陪他坐一会', desc:'气血 +12',       fx:{hp:12}}
    ]
  },
  {
    id:'gumu', title:'一座古墓',
    text:'土坡裂开一道缝，里面有铜器的味道，也有一股说不清的腥。',
    opts:[
      {label:'探进去',   desc:'灵石 +30，气血 −8', fx:{stones:30, hp:-8}},
      {label:'封上土',   desc:'气血 +15',          fx:{hp:15}},
      {label:'只挖门口', desc:'灵石 +12',          fx:{stones:12}}
    ]
  },
  {
    id:'yaoshou', title:'拦路妖兽',
    text:'一头三尺高的黑狼挡在路中间，喉咙里滚着低音。',
    opts:[
      {label:'杀了取丹', desc:'灵石 +25，气血 −12', fx:{stones:25, hp:-12}},
      {label:'绕过去',   desc:'无事发生',            fx:{}},
      {label:'与它对峙', desc:'攻 +2',               fx:{atk:2}}
    ]
  },
  {
    id:'pomiao', title:'破庙躲雨',
    text:'雨大得像有人在天上倒水。庙里供的神像没了头。',
    opts:[
      {label:'烧火烤干',   desc:'气血 +20',            fx:{hp:20}},
      {label:'拆神像取暖', desc:'灵石 +40，引雷上身（敌人 +10%）', fx:{stones:40, enemyBuff:0.10}},
      {label:'打坐听雨',   desc:'灵力 +3',              fx:{mp:3}}
    ]
  },
  {
    id:'laoren', title:'卖药的老人',
    text:'他推着一车瓶瓶罐罐："小哥，保命的要不要？"',
    opts:[
      {label:'买两颗丹', desc:'花 25 灵石，丹 +2', fx:{stones:-25, pills:2}},
      {label:'买两张符', desc:'花 30 灵石，符 +2', fx:{stones:-30, talis:2}},
      {label:'不买',     desc:'无事发生',          fx:{}}
    ]
  },
  {
    id:'hebian', title:'一条河',
    text:'水很清，能看见底下的石头。你在这里站了很久。',
    opts:[
      {label:'喝一口',   desc:'气血 +25',       fx:{hp:25}},
      {label:'洗剑',     desc:'攻 +3',          fx:{atk:3}},
      {label:'洗心',     desc:'减伤 +6%',       fx:{dr:0.06}}
    ]
  },
  {
    id:'luonan', title:'路边有人昏倒',
    text:'一个穿灰衣的人倒在草丛里，气息很弱，身上有伤。',
    opts:[
      {label:'救人',       desc:'气血 −10，得符 +1', fx:{hp:-10, talis:1}},
      {label:'放一包药就走', desc:'灵石 −15，气血 +10', fx:{stones:-15, hp:10}},
      {label:'不惹事',     desc:'无事发生',          fx:{}}
    ]
  },
  {
    id:'duju', title:'山道旁的赌局',
    text:'几个人围着一只碗，押大小。看见你，他们让了个位置。',
    opts:[
      {label:'押一把', desc:'五五开，赢 50 输 40', fx:{gamble:true}},
      {label:'看着不下注', desc:'灵力 +1',        fx:{mp:1}},
      {label:'掀了摊子',   desc:'灵石 +20，气血 −15', fx:{stones:20, hp:-15}}
    ]
  },
  {
    id:'laoshu', title:'一棵老树',
    text:'树皮裂开的口子里，像是有什么在看你。它比这山还老。',
    opts:[
      {label:'刻下名字', desc:'灵石 +20',    fx:{stones:20}},
      {label:'树下打坐', desc:'灵力 +3',     fx:{mp:3}},
      {label:'砍一斧',   desc:'攻 +2，气血 −8', fx:{atk:2, hp:-8}}
    ]
  },
  {
    id:'huoyu', title:'天降火雨',
    text:'前方的山坳在烧，火星子落到手背上烫出一个点。',
    opts:[
      {label:'冲过去',   desc:'气血 −20，灵石 +40', fx:{hp:-20, stones:40}},
      {label:'等它烧完', desc:'气血 +8',            fx:{hp:8}},
      {label:'借火炼体', desc:'法术 +20%，气血 −10', fx:{spell:0.20, hp:-10}}
    ]
  },
  {
    id:'canjuan', title:'一页残卷',
    text:'纸已经烂了一半，上面画着几个看不懂的印。',
    opts:[
      {label:'照着学', desc:'法术 +25%',      fx:{spell:0.25}},
      {label:'烧了取暖', desc:'气血 +18',      fx:{hp:18}},
      {label:'卖了',   desc:'灵石 +35',        fx:{stones:35}}
    ]
  },
  {
    id:'tongmen', title:'遇上同门',
    text:'一个和你穿同样衣服的人，站在岔路口等你。他说他先到。',
    opts:[
      {label:'结伴同行', desc:'每层回血 +6',  fx:{perWaveHeal:6}},
      {label:'各走各的', desc:'攻 +2',        fx:{atk:2}},
      {label:'抢他的东西', desc:'灵石 +50，敌人 +8%', fx:{stones:50, enemyBuff:0.08}}
    ]
  }
];
