Page({
  data: {
    currentTab: 0,
    loading: false,
    searchKeyword: '',

    // 品种图鉴数据 - 使用真实图片
    allBreeds: [
      {
        id: 1,
        name: '布偶猫',
        nameEn: 'Ragdoll',
        image: 'https://loremflickr.com/400/400/ragdoll,cat',
        tag: '仙女猫',
        personality: '温顺粘人、性格温和、像布娃娃一样软萌',
        care: '长毛需每周梳理2-3次，定期修剪指甲，注意眼部清洁，避免高处跳跃',
        features: ['大型猫', '长毛', '蓝眼睛', '适合家养', '不耐热'],
        weight: '4.5-9kg',
        lifespan: '12-17年',
        origin: '美国',
        price: '8000-20000元'
      },
      {
        id: 2,
        name: '英国短毛猫',
        nameEn: 'British Shorthair',
        image: 'https://loremflickr.com/400/400/british,shorthair,cat',
        tag: '圆脸萌猫',
        personality: '独立稳重、适应力强、不爱叫、憨厚可爱',
        care: '容易发胖需控制饮食，每周梳毛1-2次，定期体检关注心脏健康',
        features: ['中型猫', '短毛', '圆脸', '易胖', '安静'],
        weight: '3.5-7kg',
        lifespan: '12-17年',
        origin: '英国',
        price: '3000-8000元'
      },
      {
        id: 3,
        name: '暹罗猫',
        nameEn: 'Siamese',
        image: 'https://loremflickr.com/400/400/siamese,cat',
        tag: '猫中贵族',
        personality: '活泼好动、聪明伶俐、喜欢交流、话痨属性',
        care: '需要大量互动和陪伴，注意保暖，定期清洁耳朵',
        features: ['中型猫', '短毛', '重点色', '蓝眼睛', '话痨'],
        weight: '2.5-5kg',
        lifespan: '15-20年',
        origin: '泰国',
        price: '2000-5000元'
      },
      {
        id: 4,
        name: '中华田园猫·狸花',
        nameEn: 'Chinese Tabby',
        image: 'https://loremflickr.com/400/400/tabby,cat',
        tag: '本土之光',
        personality: '聪明机警、独立性强、适应力超强、忠诚',
        care: '身体强壮易养活，基本护理即可，注意疫苗和驱虫',
        features: ['中型猫', '短毛', '条纹', '本土猫', '健康'],
        weight: '3-6kg',
        lifespan: '15-18年',
        origin: '中国',
        price: '领养为主'
      },
      {
        id: 5,
        name: '三花猫',
        nameEn: 'Calico',
        image: 'https://loremflickr.com/400/400/calico,cat',
        tag: '幸运之猫',
        personality: '个性鲜明、独立自主、性格多变、聪明敏感',
        care: '基本护理，注意绝育，99.9%为母猫',
        features: ['中型猫', '短毛', '三色', '多为母猫', '独特'],
        weight: '3-5kg',
        lifespan: '15-18年',
        origin: '各地均有',
        price: '领养为主'
      },
      {
        id: 6,
        name: '橘猫',
        nameEn: 'Ginger Cat',
        image: 'https://loremflickr.com/400/400/ginger,cat',
        tag: '橘座胖橘',
        personality: '亲人友善、贪吃好动、性格温和、社交达人',
        care: '极易发胖需严格控制饮食，避免过度喂食，多运动',
        features: ['中型猫', '短毛', '橘色', '易胖', '亲人'],
        weight: '4-8kg',
        lifespan: '12-16年',
        origin: '各地均有',
        price: '领养为主'
      },
      {
        id: 7,
        name: '缅因猫',
        nameEn: 'Maine Coon',
        image: 'https://loremflickr.com/400/400/maine,coon,cat',
        tag: '温柔巨猫',
        personality: '温柔友善、聪明活泼、像狗一样忠诚',
        care: '长毛需每天梳理，注意关节健康，需要大空间活动',
        features: ['超大型猫', '长毛', '簇状耳尖', '体型巨大'],
        weight: '6-11kg',
        lifespan: '12-15年',
        origin: '美国',
        price: '8000-15000元'
      },
      {
        id: 8,
        name: '苏格兰折耳猫',
        nameEn: 'Scottish Fold',
        image: 'https://loremflickr.com/400/400/scottish,fold,cat',
        tag: '折耳天使',
        personality: '温柔安静、粘人撒娇、性格甜美',
        care: '⚠️遗传病高发，需定期检查关节和骨骼，不建议繁殖',
        features: ['中型猫', '折耳', '圆脸', '遗传病', '需谨慎'],
        weight: '2.5-6kg',
        lifespan: '10-15年',
        origin: '苏格兰',
        price: '不建议购买'
      }
    ],

    breeds: [], // 当前显示的品种列表

    // 行为语译数据
    behaviors: [
      {
        id: 1,
        icon: '🐱',
        behavior: '尾巴竖直',
        meaning: '心情愉悦，对你表示友好和信任',
        note: '这是猫咪最友善的问候方式，可以摸摸它'
      },
      {
        id: 2,
        icon: '✈️',
        behavior: '飞机耳',
        meaning: '紧张、害怕或准备战斗',
        note: '此时不要强行接近，给它一些空间'
      },
      {
        id: 3,
        icon: '😻',
        behavior: '呼噜呼噜',
        meaning: '满足、放松或寻求安慰',
        note: '大部分时候表示开心，但生病时也会呼噜'
      },
      {
        id: 4,
        icon: '😽',
        behavior: '慢速眨眼',
        meaning: '信任和爱意的表达',
        note: '你也可以对它慢慢眨眼回应'
      },
      {
        id: 5,
        icon: '👅',
        behavior: '舔毛/舔你',
        meaning: '清洁行为，或对你表示亲昵',
        note: '被猫咪舔是高度信任的表现'
      },
      {
        id: 6,
        icon: '🐾',
        behavior: '踩奶',
        meaning: '极度放松和满足的状态',
        note: '这是幼猫时期的本能行为'
      },
      {
        id: 7,
        icon: '💥',
        behavior: '炸毛',
        meaning: '极度恐惧或愤怒',
        note: '立即停止刺激，让它冷静下来'
      },
      {
        id: 8,
        icon: '🎁',
        behavior: '送你礼物',
        meaning: '把你当家人，分享猎物',
        note: '虽然可能是死老鼠，但这是爱的表达'
      },
      {
        id: 9,
        icon: '🤝',
        behavior: '用头蹭你',
        meaning: '标记气味，表示你是它的',
        note: '这是猫咪的最高级别亲密表达'
      },
      {
        id: 10,
        icon: '😾',
        behavior: '嘶嘶声',
        meaning: '警告、不爽、准备攻击',
        note: '不要继续靠近，给它空间'
      }
    ],

    // 禁忌清单
    tabooCategories: [
      {
        category: '🍖 危险食物',
        items: [
          {
            name: '葡萄/葡萄干',
            danger: 'high',
            reason: '可导致急性肾衰竭',
            symptoms: '呕吐、腹泻、精神萎靡'
          },
          {
            name: '巧克力',
            danger: 'high',
            reason: '含可可碱，猫咪无法代谢',
            symptoms: '呕吐、腹泻、心律不齐、抽搐'
          },
          {
            name: '洋葱/大蒜',
            danger: 'high',
            reason: '破坏红细胞，导致贫血',
            symptoms: '呕吐、腹泻、尿血、贫血'
          },
          {
            name: '生鱼生肉',
            danger: 'medium',
            reason: '可能含寄生虫和细菌',
            symptoms: '腹泻、呕吐、寄生虫感染'
          },
          {
            name: '牛奶',
            danger: 'medium',
            reason: '成年猫乳糖不耐受',
            symptoms: '腹泻、呕吐、肠胃不适'
          },
          {
            name: '咖啡/茶',
            danger: 'high',
            reason: '含咖啡因，损害神经系统',
            symptoms: '心跳加速、呼吸急促、抽搐'
          }
        ]
      },
      {
        category: '🌿 有毒植物',
        items: [
          {
            name: '百合花',
            danger: 'high',
            reason: '全株剧毒，可致命',
            symptoms: '呕吐、肾衰竭、死亡'
          },
          {
            name: '绿萝',
            danger: 'medium',
            reason: '含草酸钙结晶',
            symptoms: '口腔肿胀、流口水、呕吐'
          },
          {
            name: '滴水观音',
            danger: 'high',
            reason: '全株有毒',
            symptoms: '口腔麻痹、呕吐、呼吸困难'
          },
          {
            name: '风信子',
            danger: 'medium',
            reason: '球茎有毒',
            symptoms: '呕吐、腹泻、过敏'
          }
        ]
      },
      {
        category: '🧴 家居用品',
        items: [
          {
            name: '精油/香薰',
            danger: 'high',
            reason: '猫咪无法代谢精油成分',
            symptoms: '呕吐、流涎、呼吸困难、肝损伤'
          },
          {
            name: '杀虫剂',
            danger: 'high',
            reason: '含除虫菊酯，猫咪剧毒',
            symptoms: '流涎、抽搐、呼吸困难'
          },
          {
            name: '漂白水/清洁剂',
            danger: 'high',
            reason: '腐蚀性强',
            symptoms: '口腔灼伤、呕吐、呼吸困难'
          }
        ]
      },
      {
        category: '💊 人类药物',
        items: [
          {
            name: '阿司匹林',
            danger: 'high',
            reason: '猫咪无法代谢',
            symptoms: '呕吐、食欲不振、肝肾损伤'
          },
          {
            name: '感冒药',
            danger: 'high',
            reason: '含对乙酰氨基酚等成分',
            symptoms: '贫血、肝损伤、呼吸困难'
          },
          {
            name: '维生素D',
            danger: 'medium',
            reason: '过量导致中毒',
            symptoms: '呕吐、肾衰竭'
          }
        ]
      }
    ]
  },

  onLoad() {
    this.setData({
      breeds: this.data.allBreeds
    })
  },

  switchTab(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    this.setData({
      currentTab: index
    })
  },

  // 搜索功能
  onSearchInput(e) {
    const keyword = e.detail.value.toLowerCase()
    this.setData({ searchKeyword: keyword })

    if (!keyword) {
      this.setData({ breeds: this.data.allBreeds })
      return
    }

    const filtered = this.data.allBreeds.filter(breed =>
      breed.name.toLowerCase().includes(keyword) ||
      breed.nameEn.toLowerCase().includes(keyword) ||
      breed.personality.includes(keyword) ||
      breed.tag.includes(keyword)
    )

    this.setData({ breeds: filtered })
  },

  // 清空搜索
  clearSearch() {
    this.setData({
      searchKeyword: '',
      breeds: this.data.allBreeds
    })
  },

  // 查看品种详情
  showBreedDetail(e) {
    const breed = e.currentTarget.dataset.breed

    const content = `${breed.tag}\n\n🌍 原产地：${breed.origin}\n⚖️ 体重：${breed.weight}\n⏰ 寿命：${breed.lifespan}\n💰 价格：${breed.price}\n\n💝 性格特点：\n${breed.personality}\n\n🏥 养护要点：\n${breed.care}\n\n✨ 特征：${breed.features.join('、')}`

    wx.showModal({
      title: `${breed.icon || '🐱'} ${breed.name}`,
      content: content,
      confirmText: '知道了',
      confirmColor: '#FF9654',
      showCancel: false
    })
  },

  // 查看行为详情
  showBehaviorDetail(e) {
    const behavior = e.currentTarget.dataset.behavior

    wx.showModal({
      title: `${behavior.icon} ${behavior.behavior}`,
      content: `含义：${behavior.meaning}\n\n💡 提示：${behavior.note}`,
      confirmText: '知道了',
      confirmColor: '#FF9654',
      showCancel: false
    })
  },

  // 查看禁忌详情
  showTabooDetail(e) {
    const item = e.currentTarget.dataset.item

    const dangerText = {
      high: '⚠️ 高危',
      medium: '⚡ 中危',
      low: 'ℹ️ 低危'
    }

    wx.showModal({
      title: `${dangerText[item.danger]} ${item.name}`,
      content: `危害原因：\n${item.reason}\n\n中毒症状：\n${item.symptoms}\n\n请立即远离猫咪，如误食请紧急就医！`,
      confirmText: '我知道了',
      confirmColor: '#EF4444',
      showCancel: false
    })
  },

  onShareAppMessage() {
    return {
      title: '守护咪 - 猫咪百科全书',
      path: '/pages/features/encyclopedia/encyclopedia',
      imageUrl: 'https://loremflickr.com/600/400/cute,cat'
    }
  },

  goBack() {
    wx.navigateBack()
  }
})
