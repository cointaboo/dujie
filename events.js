'use strict';

/* ============================================================
   劫中奇遇：20 个事件，每局两次（清完第一层、第二层）
   带 req 的选项只有对应出身/血脉/身份才能选
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
      {label:'只挖门口', desc:'灵石 +12',          fx:{stones:12}},
      {label:'守陵人的眼', desc:'一眼看出是衣冠冢，取 50 灵石无伤', fx:{stones:50}, req:{ident:'shouling'}, special:true}
    ]
  },
  {
    id:'yaoshou', title:'拦路妖兽',
    text:'一头三尺高的黑狼挡在路中间，喉咙里滚着低音。',
    opts:[
      {label:'杀了取丹', desc:'灵石 +25，气血 −12', fx:{stones:25, hp:-12}},
      {label:'绕过去',   desc:'无事发生',            fx:{}},
      {label:'与它对峙', desc:'攻 +2',               fx:{atk:2}},
      {label:'猎户的眼', desc:'知道它怕什么，取丹不受伤', fx:{stones:25, atk:1}, req:{ident:'liehu'}, special:true}
    ]
  },
  {
    id:'pomiao', title:'破庙躲雨',
    text:'雨大得像有人在天上倒水。庙里供的神像没了头。',
    opts:[
      {label:'烧火烤干',   desc:'气血 +20',   fx:{hp:20}},
      {label:'拆神像取暖', desc:'灵石 +40，引雷上身（敌人 +10%）', fx:{stones:40, enemyBuff:0.10}},
      {label:'打坐听雨',   desc:'灵力 +3',    fx:{mp:3}}
    ]
  },
  {
    id:'laoren', title:'卖药的老人',
    text:'他推着一车瓶瓶罐罐："小哥，保命的要不要？"',
    opts:[
      {label:'买两颗丹', desc:'花 25 灵石，丹 +2', fx:{stones:-25, pills:2}},
      {label:'买两张符', desc:'花 30 灵石，符 +2', fx:{stones:-30, talis:2}},
      {label:'不买',     desc:'无事发生',          fx:{}},
      {label:'药童的鼻子', desc:'一闻就知道哪瓶是真的，白拿 2 丹', fx:{pills:2}, req:{ident:'yaotong'}, special:true}
    ]
  },
  {
    id:'hebian', title:'一条河',
    text:'水很清，能看见底下的石头。你在这里站了很久。',
    opts:[
      {label:'喝一口',   desc:'气血 +25', fx:{hp:25}},
      {label:'洗剑',     desc:'攻 +3',    fx:{atk:3}},
      {label:'洗心',     desc:'减伤 +6%', fx:{dr:0.06}},
      {label:'鲲鹏血脉', desc:'水认你，气血 +40', fx:{hp:40}, req:{blood:'kunpeng'}, special:true}
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
      {label:'掀了摊子',   desc:'灵石 +20，气血 −15', fx:{stones:20, hp:-15}},
      {label:'账房的眼睛', desc:'你算过这只碗，稳赢 50', fx:{stones:50}, req:{ident:'zhangfang'}, special:true}
    ]
  },
  {
    id:'laoshu', title:'一棵老树',
    text:'树皮裂开的口子里，像是有什么在看你。它比这山还老。',
    opts:[
      {label:'刻下名字', desc:'灵石 +20',   fx:{stones:20}},
      {label:'树下打坐', desc:'灵力 +3',    fx:{mp:3}},
      {label:'砍一斧',   desc:'攻 +2，气血 −8', fx:{atk:2, hp:-8}}
    ]
  },
  {
    id:'huoyu', title:'天降火雨',
    text:'前方的山坳在烧，火星子落到手背上烫出一个点。',
    opts:[
      {label:'冲过去',   desc:'气血 −20，灵石 +40', fx:{hp:-20, stones:40}},
      {label:'等它烧完', desc:'气血 +8',            fx:{hp:8}},
      {label:'借火炼体', desc:'法术 +20%，气血 −10', fx:{spell:0.20, hp:-10}},
      {label:'幽州的身子', desc:'北陲苦寒，火不近身，取 40 灵石', fx:{stones:40, hp:5}, req:{zhou:'you'}, special:true}
    ]
  },
  {
    id:'canjuan', title:'一页残卷',
    text:'纸已经烂了一半，上面画着几个看不懂的印。',
    opts:[
      {label:'照着学', desc:'法术 +25%', fx:{spell:0.25}},
      {label:'烧了取暖', desc:'气血 +18', fx:{hp:18}},
      {label:'卖了',   desc:'灵石 +35',   fx:{stones:35}},
      {label:'白泽血脉', desc:'天生认得这字，法术 +40%', fx:{spell:0.40}, req:{blood:'baize'}, special:true}
    ]
  },
  {
    id:'tongmen', title:'遇上同门',
    text:'一个和你穿同样衣服的人，站在岔路口等你。他说他先到。',
    opts:[
      {label:'结伴同行', desc:'每层回血 +6', fx:{perWaveHeal:6}},
      {label:'各走各的', desc:'攻 +2',       fx:{atk:2}},
      {label:'抢他的东西', desc:'灵石 +50，敌人 +8%', fx:{stones:50, enemyBuff:0.08}}
    ]
  },
  {
    id:'shandong', title:'一处山洞',
    text:'洞口结了蛛网，里面有风。风是暖的，说明通着别处。',
    opts:[
      {label:'钻进去', desc:'气血 −8，灵石 +25', fx:{hp:-8, stones:25}},
      {label:'在洞口歇脚', desc:'气血 +12',      fx:{hp:12}},
      {label:'堵上它', desc:'减伤 +4%',          fx:{dr:0.04}}
    ]
  },
  {
    id:'gujing', title:'一口古井',
    text:'井绳早就烂了，水面黑得发亮，映出来的人比你瘦。',
    opts:[
      {label:'照一照', desc:'灵力 +2，气血 −5', fx:{mp:2, hp:-5}},
      {label:'丢块石头', desc:'无事发生',        fx:{}},
      {label:'下去看看', desc:'灵石 +35，气血 −15', fx:{stones:35, hp:-15}}
    ]
  },
  {
    id:'qiju', title:'石上残局',
    text:'两块石头之间摆着一副棋，黑白子都落了灰，但只差一步。',
    opts:[
      {label:'接着下', desc:'法术 +15%', fx:{spell:0.15}},
      {label:'推了它', desc:'攻 +2',      fx:{atk:2}},
      {label:'看不懂，走了', desc:'气血 +6', fx:{hp:6}},
      {label:'书生的脑子', desc:'一步就解开了，法术 +30%', fx:{spell:0.30}, req:{ident:'shusheng'}, special:true}
    ]
  },
  {
    id:'wujian', title:'月下舞剑的人',
    text:'一个看不清脸的人在练一套剑法，招式很慢，但每一下都像在切什么。',
    opts:[
      {label:'看完再走', desc:'攻 +3',    fx:{atk:3}},
      {label:'跟着比划', desc:'气血 −10，攻 +4', fx:{hp:-10, atk:4}},
      {label:'不打扰',   desc:'灵力 +1',  fx:{mp:1}},
      {label:'剑冢血脉', desc:'这套剑你家里有，攻 +6', fx:{atk:6}, req:{blood:'jianzhong'}, special:true}
    ]
  },
  {
    id:'koumen', title:'夜半叩门',
    text:'客栈的木门响了四下，开门没有人，地上放着一个包。',
    opts:[
      {label:'打开', desc:'灵石 +30，敌人 +5%', fx:{stones:30, enemyBuff:0.05}},
      {label:'不碰', desc:'气血 +10',           fx:{hp:10}},
      {label:'追出去', desc:'气血 −10，攻 +2',   fx:{hp:-10, atk:2}}
    ]
  },
  {
    id:'wenyi', title:'瘟疫村',
    text:'村口挂着白布，活着的人都在等死。一个小孩在哭。',
    opts:[
      {label:'留下来治', desc:'气血 −15，丹 +2', fx:{hp:-15, pills:2}},
      {label:'绕开',     desc:'无事发生',        fx:{}},
      {label:'烧了村子', desc:'灵石 +45，敌人 +10%', fx:{stones:45, enemyBuff:0.10}},
      {label:'游医的手法', desc:'治得住，气血 +10，丹 +2', fx:{hp:10, pills:2}, req:{ident:'youyi'}, special:true}
    ]
  },
  {
    id:'leichi', title:'一片雷池',
    text:'地上有焦黑的坑，一坑挨着一坑，像有人在这里练了很多年。',
    opts:[
      {label:'进去站一会', desc:'气血 −18，法术 +25%', fx:{hp:-18, spell:0.25}},
      {label:'绕着走',     desc:'无事发生',            fx:{}},
      {label:'挖出焦骨',   desc:'灵石 +20',            fx:{stones:20}},
      {label:'雷泽血脉', desc:'这雷是家里的，法术 +35%', fx:{spell:0.35}, req:{blood:'leize'}, special:true}
    ]
  },
  {
    id:'yuexia', title:'月下独坐',
    text:'月亮很白。你坐下来，忽然想不起来自己为什么要渡这个劫。',
    opts:[
      {label:'想清楚', desc:'气血 +20，灵力 +2', fx:{hp:20, mp:2}},
      {label:'不想了', desc:'攻 +2',             fx:{atk:2}},
      {label:'对着月亮骂', desc:'减伤 +5%',       fx:{dr:0.05}}
    ]
  }
];
