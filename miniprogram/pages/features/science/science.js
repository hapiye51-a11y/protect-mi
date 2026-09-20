Page({
  data: {
    currentTab: 0,
    loading: false,

    // 疫苗接种时间表（参考ISFM和国内宠物医院标准）
    vaccines: [
      {
        age: '6-8周龄',
        vaccine: '第一针疫苗',
        note: '猫三联（预防猫瘟、猫鼻支、猫杯状病毒）'
      },
      {
        age: '10-12周龄',
        vaccine: '第二针疫苗',
        note: '加强猫三联免疫'
      },
      {
        age: '14-16周龄',
        vaccine: '第三针疫苗',
        note: '完成猫三联基础免疫'
      },
      {
        age: '满3个月',
        vaccine: '狂犬疫苗',
        note: '法律强制要求，保护人和猫'
      },
      {
        age: '每年一次',
        vaccine: '加强免疫',
        note: '每年接种一次猫三联和狂犬疫苗'
      }
    ],

    // 驱虫计划
    dewormSchedule: [
      {
        type: '体内驱虫',
        frequency: '6个月以下：每月一次 | 6个月以上：每3个月一次',
        note: '预防蛔虫、绦虫、钩虫等寄生虫'
      },
      {
        type: '体外驱虫',
        frequency: '全年：每月一次',
        note: '预防跳蚤、虱子、耳螨等体外寄生虫'
      },
      {
        type: '心丝虫预防',
        frequency: '蚊虫季节：每月一次',
        note: '在蚊虫活跃地区建议全年预防'
      }
    ],

    // TNR的重要性
    tnrBenefits: [
      {
        id: 1,
        icon: '🛡️',
        text: '有效控制流浪猫数量，避免无序繁殖'
      },
      {
        id: 2,
        icon: '💚',
        text: '减少发情期的痛苦和领地争夺行为'
      },
      {
        id: 3,
        icon: '🏥',
        text: '降低生殖系统疾病风险（子宫蓄脓、乳腺肿瘤等）'
      },
      {
        id: 4,
        icon: '🏡',
        text: '减少乱尿、嚎叫等发情行为，改善人猫关系'
      },
      {
        id: 5,
        icon: '⏰',
        text: '延长猫咪寿命，绝育猫平均寿命提高2-3年'
      },
      {
        id: 6,
        icon: '🌍',
        text: '保护生态环境，避免流浪猫对野生动物的影响'
      }
    ],

    // 应急指南
    emergencies: [
      {
        id: 1,
        icon: '👶',
        title: '捡到奶猫怎么办？',
        urgency: 'high',
        urgencyText: '紧急',
        summary: '先观察母猫是否在附近，确认真的被遗弃再介入',
        steps: [
          '1. 观察30分钟-1小时，母猫可能只是暂时离开觅食',
          '2. 确认是孤儿猫后，用毛巾包裹保暖（奶猫无法自主调节体温）',
          '3. 不要立即喂食！先测量体温（正常37.5-39°C），低体温需先保暖',
          '4. 使用宠物专用羊奶粉（禁止喂牛奶！），2-3小时喂一次',
          '5. 每次喂奶后需刺激排便（用温湿毛巾轻擦肛门和尿道口）',
          '6. 尽快联系救助组织或宠物医院，寻求专业指导',
          '7. 建议寻找有哺乳能力的代乳猫妈妈'
        ],
        warning: '⚠️ 2周龄以下的奶猫极其脆弱，存活率较低，需要24小时照护'
      },
      {
        id: 2,
        icon: '🤮',
        title: '猫咪呕吐怎么办？',
        urgency: 'medium',
        urgencyText: '需关注',
        summary: '区分正常吐毛球和疾病性呕吐，及时就医',
        steps: [
          '1. 判断呕吐类型：',
          '   - 偶尔吐毛球（毛发团）：正常现象，可喂化毛膏',
          '   - 未消化的食物：可能进食过快，改善喂食方式',
          '   - 黄绿色液体（胆汁）：空腹时间过长或肠胃问题',
          '   - 带血丝/咖啡色：立即就医！可能是胃出血',
          '2. 短期处理（24小时内）：',
          '   - 禁食4-6小时，观察是否继续呕吐',
          '   - 少量多次喂水，防止脱水',
          '   - 记录呕吐频率、呕吐物性状和颜色',
          '3. 需立即就医的情况：',
          '   - 24小时内呕吐超过3次',
          '   - 呕吐物带血或呈深褐色',
          '   - 伴随腹泻、精神萎靡、不吃不喝',
          '   - 怀疑误食异物或中毒'
        ],
        warning: '⚠️ 持续呕吐会导致脱水和电解质紊乱，危及生命'
      },
      {
        id: 3,
        icon: '🩸',
        title: '外伤出血怎么办？',
        urgency: 'high',
        urgencyText: '紧急',
        summary: '正确止血和包扎，避免感染和失血过多',
        steps: [
          '1. 保持冷静，安抚猫咪情绪（受伤的猫可能攻击性很强）',
          '2. 止血方法：',
          '   - 小伤口：用干净纱布按压3-5分钟',
          '   - 持续出血：加厚纱布继续按压，不要频繁查看',
          '   - 动脉出血（喷射状）：指压近心端动脉，立即送医',
          '3. 清洁伤口：',
          '   - 用生理盐水冲洗（不要用酒精或碘伏直接冲洗深层伤口）',
          '   - 剪去伤口周围的毛发，防止感染',
          '4. 临时包扎：',
          '   - 使用无菌纱布覆盖伤口',
          '   - 用绷带固定，松紧度以能伸进一根手指为宜',
          '5. 尽快送医，由专业医生评估是否需要缝合和抗生素'
        ],
        warning: '⚠️ 猫咪的咬伤和抓伤容易形成脓肿，必须清创处理'
      },
      {
        id: 4,
        icon: '🥵',
        title: '中暑怎么办？',
        urgency: 'high',
        urgencyText: '紧急',
        summary: '猫咪不耐热，中暑可能致命，需紧急降温',
        steps: [
          '1. 识别中暑症状：',
          '   - 大口喘气、流涎',
          '   - 体温超过40°C',
          '   - 牙龈发红或发紫',
          '   - 呕吐、腹泻、虚弱',
          '   - 严重时出现抽搐、昏迷',
          '2. 紧急降温措施：',
          '   - 立即转移到阴凉通风处',
          '   - 用凉水（不是冰水！）浸湿毛巾擦拭身体',
          '   - 重点降温部位：颈部、腋下、腹股沟',
          '   - 用风扇加速散热（不要对着头部直吹）',
          '   - 每隔5分钟测量体温，降至39.5°C后停止',
          '3. 补充水分：',
          '   - 如果猫咪清醒，给予小口喝水',
          '   - 不要强制灌水，防止呛咳',
          '4. 尽快送医，即使症状缓解也需检查内脏损伤'
        ],
        warning: '⚠️ 中暑的黄金救援时间只有30分钟，延误可能导致器官衰竭'
      },
      {
        id: 5,
        icon: '☠️',
        title: '疑似中毒怎么办？',
        urgency: 'high',
        urgencyText: '极紧急',
        summary: '立即送医，带上可疑毒物或呕吐物样本',
        steps: [
          '1. 常见中毒症状：',
          '   - 突然呕吐、腹泻',
          '   - 流涎、抽搐、肌肉震颤',
          '   - 呼吸困难、口吐白沫',
          '   - 瞳孔异常（过度放大或缩小）',
          '   - 牙龈苍白或发紫',
          '2. 紧急处理（在送医途中）：',
          '   - ⚠️ 不要自行催吐！（腐蚀性毒物会二次伤害食道）',
          '   - 保持呼吸道通畅，侧卧防止误吸',
          '   - 保留呕吐物和可疑毒物样本',
          '   - 记录可能的中毒时间和接触物品',
          '3. 带猫咪立即就医，途中保暖',
          '4. 告知医生可能的毒物种类和接触时间'
        ],
        warning: '⚠️ 时间就是生命！中毒后的最佳救治时间是2小时内'
      },
      {
        id: 6,
        icon: '🚫',
        title: '误食异物怎么办？',
        urgency: 'high',
        urgencyText: '紧急',
        summary: '不要等待观察，立即就医，可能需要手术取出',
        steps: [
          '1. 常见误食异物：线绳、塑料袋、橡皮筋、小玩具、骨头等',
          '2. 识别症状：',
          '   - 突然不吃不喝',
          '   - 反复呕吐',
          '   - 腹部疼痛（弓背、不让碰肚子）',
          '   - 精神萎靡',
          '   - ⚠️ 如果看到线绳从嘴或肛门露出，不要拉扯！',
          '3. 紧急措施：',
          '   - 不要尝试自行取出或催吐',
          '   - 禁食禁水，防止异物进一步移动',
          '   - 立即送医，可能需要X光或超声波检查',
          '4. 医生可能采取的措施：',
          '   - 内窥镜取出（适用于胃内异物）',
          '   - 手术取出（肠道异物）',
          '   - 观察等待自然排出（小型光滑异物）'
        ],
        warning: '⚠️ 线状异物（毛线、缝纫线）最危险，会导致肠道褶皱和坏死'
      }
    ],

    // 高空坠猫数据
    windowStats: [
      {
        value: '91%',
        label: '坠楼后的受伤率'
      },
      {
        value: '46%',
        label: '坠楼后的死亡率'
      },
      {
        value: '1-6楼',
        label: '最危险楼层'
      },
      {
        value: '100%',
        label: '科学封窗的预防率'
      }
    ],

    // 科学封窗标准
    windowStandards: [
      {
        id: 1,
        title: '选择专业材料',
        description: '使用304不锈钢防护网或尼龙网，间隙不超过3厘米。禁用塑料网、纱窗（猫咪可以抓破）'
      },
      {
        id: 2,
        title: '全面无死角',
        description: '所有窗户、阳台、飘窗都要封，包括卫生间和厨房。不要有任何侥幸心理'
      },
      {
        id: 3,
        title: '固定要牢固',
        description: '使用膨胀螺丝固定，不能只用胶水或魔术贴。猫咪力量很大，可以轻易推开不牢固的防护网'
      },
      {
        id: 4,
        title: '定期检查',
        description: '每3-6个月检查一次防护网是否松动、破损或生锈，及时维修更换'
      },
      {
        id: 5,
        title: '预留逃生口',
        description: '在防护网上预留可开启的逃生门，火灾时人可以逃生'
      }
    ],

    // 常见误区
    windowMyths: [
      {
        id: 1,
        wrong: '我家猫从来不上窗台，不用封窗',
        right: '猫咪的行为会变化，追逐飞虫、发情、受惊都可能冲上窗台'
      },
      {
        id: 2,
        wrong: '我家只有一楼/二楼，不会摔死',
        right: '低楼层反而更危险，猫咪来不及调整姿势，且一楼通常有尖锐物'
      },
      {
        id: 3,
        wrong: '猫咪有九条命，摔不死',
        right: '这是迷信！猫咪坠楼后91%受伤，46%死亡'
      },
      {
        id: 4,
        wrong: '只封阳台就够了，窗户开一点没事',
        right: '猫咪能挤过的缝隙远比你想象的小，必须全部封闭'
      },
      {
        id: 5,
        wrong: '用纱窗就可以了',
        right: '纱窗根本挡不住猫咪，几秒钟就能抓破'
      }
    ]
  },

  onLoad(options) {
    console.log('科学养宠页面加载')
    if (options.tab !== undefined) {
      this.setData({
        currentTab: parseInt(options.tab)
      })
    }
  },

  switchTab(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    this.setData({
      currentTab: index
    })
  },

  showEmergencyDetail(e) {
    const item = e.currentTarget.dataset.item
    
    wx.showModal({
      title: item.title,
      content: item.summary,
      showCancel: true,
      cancelText: '查看详情',
      cancelColor: '#4CAF50',
      confirmText: '附近医院',
      confirmColor: '#4CAF50',
      success: (res) => {
        if (res.cancel) {
          // 查看详情
          wx.setStorageSync('currentEmergency', item)
          wx.navigateTo({
            url: '/pages/features/emergency-detail/emergency-detail'
          })
        } else if (res.confirm) {
          // 附近医院
          this.searchNearbyHospitals()
        }
      }
    })
  },

  searchNearbyHospitals() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        wx.openLocation({
          latitude: res.latitude,
          longitude: res.longitude,
          name: '我的位置',
          address: '当前位置',
          scale: 15
        })
        
        // 提示用户搜索
        setTimeout(() => {
          wx.showModal({
            title: '查看附近宠物医院',
            content: '请在地图中搜索"宠物医院"或"宠物诊所"，查看附近的动物医院',
            showCancel: false,
            confirmText: '知道了',
            confirmColor: '#4CAF50'
          })
        }, 500)
      },
      fail: () => {
        wx.showModal({
          title: '需要位置权限',
          content: '请在设置中开启位置权限，以便查找附近的宠物医院',
          confirmText: '去设置',
          confirmColor: '#4CAF50',
          success: (res) => {
            if (res.confirm) {
              wx.openSetting()
            }
          }
        })
      }
    })
  },

  onShareAppMessage() {
    return {
      title: '守护咪 - 科学养宠：用专业知识守护喵星人',
      path: '/pages/features/science/science',
      imageUrl: ''
    }
  },

  goBack() {
    wx.navigateBack()
  }
})
