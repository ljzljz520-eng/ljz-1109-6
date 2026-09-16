/* 徽墨制作专题站 · 数据层
 * 站点所有章节、工序、墨锭案例均由本文件驱动：
 *  - 顶部章节导航（导航为数据渲染，旧浏览器自动回退到页内文本导航）
 *  - 首页工艺流程
 *  - 各工序页的章节目录与图片灯箱
 *  - 案例列表与案例详情
 * 纯 ES5 语法，兼容旧浏览器。
 */
(function (global) {
  'use strict';

  var VERSION = '1.0.0';

  /* 六大工序章节，slug 对应 pages/ 下页面文件名 */
  var chapters = [
    {
      id: 'yuanliao',
      slug: 'yuanliao',
      name: '原料',
      subtitle: '烟、胶、药、料',
      page: 'pages/yuanliao.html',
      lead: '徽墨以松烟、油烟为骨，以皮胶、骨胶为筋，再佐以数十味天然药材与香料。原料的取舍，决定一锭墨的风骨。',
      sections: [
        {
          id: 'songyan-youyan',
          title: '松烟与油烟',
          paragraphs: [
            '徽墨的黑色精魂来自两类烟炱。松烟取古松枝干，在密不通气的卧窑中缓慢熏烧，松木不完全燃烧析出的烟尘附着于窑壁，扫下后即成松烟。松烟色蓝而无光，墨色沉郁，宜作浓墨。',
            '油烟则以桐油、猪油、生漆等油脂点灯，灯上覆以瓷碗，烟炱凝于碗底，轻轻扫落而成。油烟颗粒极细，色泽紫黑发亮，研磨后泛有微微紫光，历来是制上等墨的主材。'
          ]
        },
        {
          id: 'jiao',
          title: '胶与辅料',
          paragraphs: [
            '胶是墨锭成形的筋骨。传统徽墨多用牛皮胶、鱼鳔胶或骨胶，胶质须陈、须净，新胶火气未退，直接入墨易裂易散。',
            '和胶时依古法投入珍珠、麝香、冰片、鸡血藤、猪胆汁、金箔等数十味辅料。药材助墨色乌黑持久，香料使墨气清雅，金箔则添光泽、防胶腐。'
          ]
        },
        {
          id: 'shui-huo',
          title: '水与火候',
          paragraphs: [
            '制墨用水讲究清、甘、轻，黄山脚下的泉水历来为墨工所重。水性温和，烟胶相融才不生颗粒。',
            '火候贯穿始终：烧烟看火色，蒸胶看水温，杵捣看蒸气。老墨工常说“墨是火里求财”，一丝急躁都会在数月之后的墨面上显现出来。'
          ]
        }
      ],
      images: [
        { src: 'assets/img/raw.svg', alt: '松烟、油烟与胶料的意象图', caption: '烟、胶、药、料：一锭徽墨的四重根基' },
        { src: 'assets/img/raw-collect.svg', alt: '窑壁扫烟与灯碗取炱的意象图', caption: '左取松烟于窑壁，右扫油烟于灯碗' }
      ]
    },
    {
      id: 'zhiyan',
      slug: 'zhiyan',
      name: '制烟',
      subtitle: '烧烟取炱',
      page: 'pages/zhiyan.html',
      lead: '烟是墨中最细的尘，也是最难守的火。制烟一法，全在“闷”与“候”二字。',
      sections: [
        {
          id: 'woyao',
          title: '卧窑烧松',
          paragraphs: [
            '松烟窑依山势而建，长卧于土坡之上，窑道曲曲折折，烟火由窑头缓缓推向窑尾。松枝入窑后封死火门，只留极小的进气孔，令松木在缺氧中缓慢炭化。',
            '窑温须由有经验的墨工昼夜看守：火太旺，松枝成灰，烟便粗劣；火太弱，烟炱稀薄，收成寥寥。一窑松烟，往往要熏烧十余日。'
          ]
        },
        {
          id: 'dengyan',
          title: '灯盏点烟',
          paragraphs: [
            '油烟在烟房中烧取。数十乃至上百只油灯排列于木架，灯芯捻得极细，每盏灯上覆一只洁净瓷碗，灯火舔着碗底，烟炱便一丝一丝积在碗心。',
            '油中常掺以生漆、猪油与少量苏合香，烧出的烟细而黑、润而亮。每隔半个时辰，墨工以鹅毛轻扫碗底，将油烟收入瓷瓮，手重不得，气粗不得。'
          ]
        },
        {
          id: 'luo-yan',
          title: '筛烟与藏烟',
          paragraphs: [
            '新扫下的烟炱粗杂相混，要经过绢筛、水漂多道工序：细绢筛去粗粒，清水漂去浮杂，沉降后取最细的中层烟粉阴干。',
            '精烟收入密闭的瓷缸或纸篓中陈放，陈放越久，火气越退。陈年之烟入墨，墨色沉静不躁，是新烟难以企及的品格。'
          ]
        }
      ],
      images: [
        { src: 'assets/img/soot.svg', alt: '卧窑烧松取烟的意象图', caption: '卧窑闷烧，烟行十余日而不绝' },
        { src: 'assets/img/lamp.svg', alt: '油灯覆碗取油烟的意象图', caption: '灯盏覆碗，以鹅毛扫取油烟' }
      ]
    },
    {
      id: 'hejiao',
      slug: 'hejiao',
      name: '和胶',
      subtitle: '烟胶相和',
      page: 'pages/hejiao.html',
      lead: '烟与胶的相遇，是墨由散粉变成坯的关键。和胶一道，最见墨工分寸。',
      sections: [
        {
          id: 'zheng-jiao',
          title: '蒸胶化料',
          paragraphs: [
            '干胶先以温水浸软，再隔水慢蒸，蒸至胶汁稠如饴糖，用麻布滤去残渣。胶液老嫩全凭经验：过老则墨坯干硬易裂，过嫩则墨体绵软难成形。',
            '珍珠、金箔等贵重辅料须另行研细，麝香、冰片等香料则在胶汁晾至温热时下入，香气遇烈火则散，这是老法里极看重的细节。'
          ]
        },
        {
          id: 'he-liao',
          title: '拌烟成团',
          paragraphs: [
            '精烟摊在洁净的石面或木案上，中间拨开一窝，将温热的胶汁缓缓注入，墨工以手快速翻拌，使烟粒均匀裹上胶衣。',
            '烟胶比例因墨品而异：松烟墨胶轻，取其黑；油烟墨胶稍重，取其亮。拌好的墨料初成泥状，颜色由灰转黑，捏之成团、掷地不散，方可进入下一道工序。'
          ]
        },
        {
          id: 'chu-zheng',
          title: '初蒸醒料',
          paragraphs: [
            '拌成的墨团并不立刻上杵，还要入甑短时蒸过，称为“醒料”。蒸汽让烟胶进一步渗透，墨泥内外匀熟。',
            '蒸好的墨团以湿布盖住保温，趁热送入捶打作坊——墨料一冷便硬，此后的千锤万杵，都要赶在这一口热气之上。'
          ]
        }
      ],
      images: [
        { src: 'assets/img/glue.svg', alt: '蒸胶滤胶的意象图', caption: '干胶慢蒸，滤净如饴' },
        { src: 'assets/img/knead.svg', alt: '烟胶拌和成泥的意象图', caption: '注胶拌烟，捏之成团' }
      ]
    },
    {
      id: 'chuida',
      slug: 'chuida',
      name: '捶打',
      subtitle: '千锤万杵',
      page: 'pages/chuida.html',
      lead: '古法“轻胶重捶”，一锭徽墨要经受铁锤万余下的反复捶击，捶去气泡，捶出筋骨。',
      sections: [
        {
          id: 'wan-chui',
          title: '铁锤万杵',
          paragraphs: [
            '温热的墨团置于青石砧上，两名墨工对站，各执数十斤重的铁锤，轮流起落，一锤紧接一锤。墨团被反复对折、压扁、再对折。',
            '捶打使烟粒与胶充分结合，也把墨泥中残存的空气一点点逼出。捶得不足，墨锭磨开便有砂眼气孔；捶到极熟，断面乌黑致密、不见一丝纹理。'
          ]
        },
        {
          id: 'cheng-xing',
          title: '入模压坯',
          paragraphs: [
            '捶熟的墨泥按分量揪成墨剂，在青石上搓成条状，趁热填入铜模或木模。模具多由名家雕刻，山水、人物、书法、瓦当，一模一样。',
            '墨剂入模后以夹板夹紧，放上压床重压，使墨泥充满模腔的每一处纹路。压好的墨坯连模静置片刻，再轻敲脱模，纹样便清晰地落在墨身上。'
          ]
        },
        {
          id: 'xiu-pi',
          title: '修坯晾边',
          paragraphs: [
            '脱模后的墨坯边缘有细小飞边，墨工以薄刀细细修去，再用软布拭净。此时的墨坯软润如膏，须平放于平整木板上，不可堆叠。',
            '修好的墨坯在阴凉处静置半日，待表面收干、初步定型，才被送往晾墨坊，开始漫长的阴干等待。'
          ]
        }
      ],
      images: [
        { src: 'assets/img/hammer.svg', alt: '双锤对砧捶打墨泥的意象图', caption: '两人对杵，一锭墨万余下锤' },
        { src: 'assets/img/mold.svg', alt: '墨剂入模压坯的意象图', caption: '入模重压，纹样落于墨身' }
      ]
    },
    {
      id: 'liangmo',
      slug: 'liangmo',
      name: '晾墨',
      subtitle: '阴干养性',
      page: 'pages/liangmo.html',
      lead: '墨坯成形只在数日，成墨却要熬过数月。晾墨一工，考验的不是力气，是耐心。',
      sections: [
        {
          id: 'yin-gan',
          title: '阴凉缓干',
          paragraphs: [
            '晾墨坊常年门窗紧闭，避光、避风、避日晒。墨坯平铺在木板或竹匾上，在均匀的阴凉中让水分极其缓慢地从内部向外透出。',
            '若急于求成，放在风口或日头下，墨体表面先干、内里仍软，收缩不匀便会弯曲开裂，前几道工序的功夫尽付东流。'
          ]
        },
        {
          id: 'fan-mo',
          title: '定时翻转',
          paragraphs: [
            '晾墨工人每日定时入坊，将墨锭逐枚翻转，使其上下两面受力均匀、失水均匀。墨坯随失水而收缩，坊中常备多档尺寸的托板随时更换。',
            '翻转时还要逐枚检视：有细微翘曲的，以平整木板夹压校正；发现隐裂的，即刻拣出。一坊墨锭，要这样照看数月。'
          ]
        },
        {
          id: 'chenfang',
          title: '陈墨如药',
          paragraphs: [
            '徽墨自脱模到干透，往往需半年乃至一年；制墨人家常将新墨再陈放数年方始出售。墨越陈，胶性越和，磨出的墨色越沉静。',
            '陈年佳墨叩之清越，研之无声，墨香暗起。故老相传“陈墨如陈药”，时间本身，就是徽墨的最后一道工序。'
          ]
        }
      ],
      images: [
        { src: 'assets/img/dry.svg', alt: '墨锭平铺阴干的意象图', caption: '避光避风，阴干经数月' },
        { src: 'assets/img/aging.svg', alt: '架上陈墨与包纸的意象图', caption: '陈墨如药，岁月是最后一道工序' }
      ]
    },
    {
      id: 'tikuan',
      slug: 'tikuan',
      name: '题款',
      subtitle: '描金敷彩',
      page: 'pages/tikuan.html',
      lead: '干透的墨锭要经最后一番装点：填色、描金、检验包装，一锭墨才算功德圆满。',
      sections: [
        {
          id: 'tian-se',
          title: '填色描金',
          paragraphs: [
            '脱模时压出的文字与图案原是凹纹。工匠以细笔蘸取金粉、银粉或矿彩，将凹痕逐一填实，再拭去平面多余的颜色，纹样便在乌黑的墨身上凸现金碧。',
            '好的描金匀净饱满，线条首尾如一；名家题款的墨，还要另请匠人核对笔意，使金彩不失原书神韵。'
          ]
        },
        {
          id: 'jianyan',
          title: '检验分级',
          paragraphs: [
            '题款之后逐枚检验：看墨身有无裂纹砂眼，看纹样是否清晰，看金彩是否饱满，称重、量寸，比对形制。',
            '检验合格的墨锭按烟料、工艺与重量分级，极品贡墨往往还要编号存档，记录油烟配比与成墨年月。'
          ]
        },
        {
          id: 'bao-zhuang',
          title: '包装封藏',
          paragraphs: [
            '成品墨以细软的棉纸逐枚包好，盛入漆盒或锦匣，盒中再置防潮之剂。包装既要护墨，也是徽墨礼俗的一部分——古往今来，佳墨常与砚台同赠文人。',
            '封藏后的墨锭在匣中继续陈化。待日后开匣研墨，墨香随水气缓缓升起，一段始于黄山松火的旅程，便落到了纸墨之间。'
          ]
        }
      ],
      images: [        { src: 'assets/img/inscribe.svg', alt: '细笔描金题款的意象图', caption: '凹纹填金，乌墨生金碧' },
        { src: 'assets/img/finish.svg', alt: '锦匣包墨封藏的意象图', caption: '棉纸锦匣，封藏以待开匣' }
      ]
    }
  ];

  /* 墨锭案例 */
  var cases = [
    {
      id: 'luowen',
      name: '罗纹松烟墨',
      tagline: '松烟为骨 · 罗纹入墨',
      dynasty: '承宋制',
      weight: '约 60 克',
      shape: '长条形·云纹边',
      color: 'color-ro',
      summary: '以黄山古松松烟为主料，轻胶重捶，墨身泛着松烟特有的亚光蓝气。',
      description: '罗纹松烟墨承宋代歙墨旧制，取黄山古松卧窑熏烧之烟，三筛三漂，陈烟半年再行和制。胶用陈年牛皮轻胶，捶打逾万杵，模面隐起罗纹细线，如古砚罗纹，研开后墨色蓝郁沉静，宜书小楷与工笔。墨侧模刻“松烟”二篆，填以石青，朴拙耐看。',
      highlights: ['古松松烟，陈藏半年', '轻胶万杵，断面无纹', '罗纹浅模，石青填篆'],
      image: 'assets/img/case-luowen.svg',
      thumb: 'assets/img/inkstick.svg',
      gallery: [
        { src: 'assets/img/case-luowen.svg', alt: '罗纹松烟墨墨锭正面', caption: '墨身罗纹细浅，色蓝而不耀' },
        { src: 'assets/img/raw-collect.svg', alt: '松烟扫取示意', caption: '松烟取于窑壁，色蓝无光' },
        { src: 'assets/img/mold.svg', alt: '罗纹墨模示意', caption: '浅罗纹模，压出细丝' }
      ]
    },
    {
      id: 'zijin',
      name: '超漆烟紫金墨',
      tagline: '油烟极品 · 紫光内蕴',
      dynasty: '承清贡墨',
      weight: '约 75 克',
      shape: '碑形·螭首',
      color: 'color-zi',
      summary: '油烟中调入生漆同烧，烟细如尘，墨色乌黑中透出隐隐紫光。',
      description: '超漆烟为徽墨油烟中的上品：桐油中掺入生漆点灯取炱，烟粒之细冠于诸烟。和胶时佐以麝香、冰片与金箔，蒸胶、醒料、重捶一丝不苟。墨作古碑之形，碑额雕双螭，正面阴刻填真金。研开如漆，紫光内蕴，落纸历久不洴，清代曾作贡墨进呈。',
      highlights: ['生漆和油烧烟，细冠诸品', '麝香金箔入料，墨香幽微', '碑形螭首，阴刻填真金'],
      image: 'assets/img/case-zijin.svg',
      thumb: 'assets/img/inkstick.svg',
      gallery: [
        { src: 'assets/img/case-zijin.svg', alt: '超漆烟紫金墨墨锭', caption: '碑形螭首，乌中透紫' },
        { src: 'assets/img/lamp.svg', alt: '生漆油烟烧取示意', caption: '桐油掺生漆，灯碗取炱' },
        { src: 'assets/img/inscribe.svg', alt: '阴刻填金示意', caption: '碑面阴刻，填以真金' }
      ]
    },
    {
      id: 'wuse',
      name: '五彩墨礼盒',
      tagline: '矿物调色 · 丹青同匣',
      dynasty: '当代文创',
      weight: '五枚各约 30 克',
      shape: '小圭形·五枚',
      color: 'color-wu',
      summary: '以徽墨古法胶法为底，调入石青、石绿、朱砂、雌黄、白垩五矿。',
      description: '五彩墨沿用徽墨和胶、捶打、阴干的全套古法，仅以天然矿物颜料替代烟炱：石青之蓝、石绿之青、朱砂之赤、雌黄之黄、白垩之白，各成一锭，作小圭形，同盛一匣。矿彩经胶捶百遍，研开浓淡随心，久藏不裂，可供国画点彩与笺谱用色，是古法新用的文房清玩。',
      highlights: ['五矿入墨，古法胶捶不废', '小圭五枚，同匣而色不争', '研开随水浓淡，久藏不裂'],
      image: 'assets/img/case-wuse.svg',
      thumb: 'assets/img/inkstick.svg',
      gallery: [
        { src: 'assets/img/case-wuse.svg', alt: '五彩墨五枚一匣', caption: '五圭同匣，青赤黄白各得其所' },
        { src: 'assets/img/knead.svg', alt: '矿彩和胶捶打示意', caption: '矿彩代烟，胶捶之法一如黑墨' },
        { src: 'assets/img/finish.svg', alt: '锦匣包装示意', caption: '锦匣分格，五墨安卧' }
      ]
    }
  ];

  var DATA = {
    version: VERSION,
    site: {
      name: '徽墨',
      title: '徽墨制作技艺',
      root: '/index.html',
      casesPage: 'pages/cases.html'
    },
    chapters: chapters,
    cases: cases
  };

  global.HUIMO_DATA = DATA;
})(typeof window !== 'undefined' ? window : this);
