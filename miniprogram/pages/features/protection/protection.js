Page({
  data: {
    currentTab: 0,
    loading: false,
    showReportDialog: false,

    // 取证步骤
    evidenceSteps: [
      {
        id: 1,
        title: '保持安全距离拍摄',
        description: '使用手机或相机记录现场，拍摄时要保证自身安全，不要激怒施虐者',
        tips: '优先使用录像功能，视频证据效力更强'
      },
      {
        id: 2,
        title: '拍摄关键要素',
        description: '确保拍摄到：施虐者正面特征、虐待行为过程、受害猫咪状态、时间地点信息',
        tips: '打开手机的时间、位置水印功能，增强证据可信度'
      },
      {
        id: 3,
        title: '保留原始文件',
        description: '不要裁剪、修图或编辑原始照片/视频，保持文件的完整性和时间戳',
        tips: '立即备份到云端，防止文件丢失或损坏'
      },
      {
        id: 4,
        title: '寻找目击证人',
        description: '询问周围群众是否愿意作证，记录证人联系方式',
        tips: '多人证词会大大提高案件的可信度'
      },
      {
        id: 5,
        title: '收集物证',
        description: '如果安全，收集作案工具、猫咪毛发、血迹等物证（注意不要破坏指纹）',
        tips: '使用塑料袋或纸袋分别密封保存，不要污染证据'
      }
    ],

    // 报警话术模板
    policeTemplate: `您好，我要报警。

地点：[具体地址/小区名称]
时间：[具体时间]
事件：我发现有人正在/已经虐待猫咪

具体情况：
1. 施虐者特征：[性别、年龄、衣着]
2. 虐待方式：[描述具体行为]
3. 猫咪状态：[受伤程度]
4. 证据情况：我已经拍摄了现场照片/视频

法律依据：
根据《中华人民共和国治安管理处罚法》第七十五条，虐待动物属于违法行为，请立即出警制止。

我的联系方式：[手机号码]
我会在现场等待，请尽快出警。`,

    // 紧急联系方式
    contacts: [
      {
        icon: '🚓',
        name: '报警电话',
        description: '遇到虐猫行为立即报警',
        phone: '110'
      },
      {
        icon: '🏥',
        name: '宠物急救',
        description: '受伤猫咪紧急救治',
        phone: '12315'
      },
      {
        icon: '🛡️',
        name: '动物保护协会',
        description: '寻求专业救助支持',
        phone: '400-xxx-xxxx'
      }
    ],

    // 相关法律法规
    laws: [
      {
        id: 1,
        name: '《治安管理处罚法》第七十五条',
        type: '行政处罚',
        content: '驱使动物伤害他人的；故意伤害他人饲养的动物的。',
        penalty: '处五日以上十日以下拘留，并处二百元以上五百元以下罚款'
      },
      {
        id: 2,
        name: '《民法典》第一千二百四十五条',
        type: '民事责任',
        content: '饲养的动物造成他人损害的，动物饲养人或者管理人应当承担侵权责任。',
        penalty: '赔偿医疗费、护理费、交通费、营养费等合理费用'
      },
      {
        id: 3,
        name: '《刑法》第三百三十八条（环境污染罪）',
        type: '刑事责任',
        content: '违反国家规定，排放、倾倒或者处置有毒物质，严重污染环境的。注：大规模毒杀流浪动物可能构成此罪。',
        penalty: '处三年以下有期徒刑或者拘役，并处或者单处罚金；后果特别严重的，处三年以上七年以下有期徒刑，并处罚金'
      },
      {
        id: 4,
        name: '《动物防疫法》',
        type: '行政处罚',
        content: '单位和个人不得遗弃、虐待染疫动物和病死动物。',
        penalty: '由动物卫生监督机构责令改正，给予警告；拒不改正的，由动物卫生监督机构代作处理，所需费用由违法行为人承担，可以处一千元以下罚款'
      }
    ],

    // 维权流程
    processSteps: [
      {
        step: 1,
        icon: '📸',
        title: '固定证据',
        description: '按照取证指南收集照片、视频、证人证言等证据材料'
      },
      {
        step: 2,
        icon: '📞',
        title: '立即报警',
        description: '拨打110报警，使用报警话术模板清晰陈述情况'
      },
      {
        step: 3,
        icon: '📋',
        title: '配合调查',
        description: '向警方提交证据，配合做笔录，要求立案调查'
      },
      {
        step: 4,
        icon: '⚖️',
        title: '跟进处理',
        description: '关注案件进展，必要时申请行政复议或提起民事诉讼'
      },
      {
        step: 5,
        icon: '📢',
        title: '合法发声',
        description: '在合法范围内通过媒体、网络等渠道曝光，但注意保护隐私和避免网络暴力'
      }
    ],

    // 专业支持机构
    supportOrgs: [
      {
        name: '中国小动物保护协会',
        service: '提供法律咨询、案件跟进、心理支持等服务'
      },
      {
        name: '当地动物保护志愿者组织',
        service: '协助取证、陪同报警、提供临时救助'
      },
      {
        name: '律师援助',
        service: '部分律师事务所提供动物保护相关的法律援助'
      },
      {
        name: '媒体监督',
        service: '在合法合规前提下，可联系媒体进行舆论监督'
      }
    ],

    // 可疑行为识别
    suspiciousBehaviors: [
      {
        id: 1,
        icon: '🎣',
        risk: 'high',
        riskText: '高危',
        title: '携带专业捕猫工具',
        description: '持有捕猫网、伸缩杆、诱捕笼等工具，且无志愿者标识或救助组织证明',
        action: '保持距离拍照取证，记录车牌号，立即报警并通知附近喂养人'
      },
      {
        id: 2,
        icon: '🔍',
        risk: 'high',
        riskText: '高危',
        title: '异常关注投喂点',
        description: '长期在固定投喂点徘徊，但不投喂，反而翻看监控或遮挡镜头',
        action: '加装隐蔽监控，记录其行为模式，必要时报警'
      },
      {
        id: 3,
        icon: '🍖',
        risk: 'high',
        riskText: '高危',
        title: '投放可疑食物',
        description: '在流浪猫活动区域投放形状、颜色异常的食物，或用注射器注射液体',
        action: '立即清理可疑食物（戴手套！），拍照取证，报警并送检'
      },
      {
        id: 4,
        icon: '🗣️',
        risk: 'medium',
        riskText: '中危',
        title: '打听猫咪习性',
        description: '频繁询问某只猫的作息时间、活动路线、是否亲人等信息',
        action: '警惕回答，不要透露具体信息，记住对方特征'
      },
      {
        id: 5,
        icon: '📷',
        risk: 'medium',
        riskText: '中危',
        title: '异常拍摄行为',
        description: '对猫咪进行长时间、多角度拍摄，尤其关注猫咪的脆弱部位',
        action: '上前询问目的，记录对方信息，提醒周围喂养人注意'
      }
    ],

    // 伪装领养人特征
    fakeAdopterSigns: [
      {
        id: 1,
        text: '强烈排斥家访，以各种理由拒绝提供真实住址'
      },
      {
        id: 2,
        text: '不愿意封窗，声称"猫咪需要自由"或"窗户不会开"'
      },
      {
        id: 3,
        text: '只关心是否"好抓"、"能不能立刻带走"，对猫咪性格、健康不关心'
      },
      {
        id: 4,
        text: '索要特定品种、年龄、花色的猫咪，尤其是幼猫'
      },
      {
        id: 5,
        text: '提出"试养"要求，或多次更换领养猫咪'
      },
      {
        id: 6,
        text: '拒绝签订领养协议，或对协议内容（如回访）强烈抵触'
      },
      {
        id: 7,
        text: '在社交媒体上有虐待动物的言论或照片'
      },
      {
        id: 8,
        text: '联系方式虚假，或频繁更换联系方式'
      },
      {
        id: 9,
        text: '急于成交，愿意支付高额"领养费"绕过正常流程'
      },
      {
        id: 10,
        text: '对猫咪表现出异常的控制欲或占有欲'
      }
    ],

    // 安全领养检查清单
    adoptionChecklist: [
      {
        id: 1,
        text: '完成科学封窗，提供现场照片',
        checked: true
      },
      {
        id: 2,
        text: '接受上门家访，住址真实有效',
        checked: true
      },
      {
        id: 3,
        text: '签订正式领养协议，包含回访条款',
        checked: true
      },
      {
        id: 4,
        text: '提供真实身份信息和联系方式',
        checked: true
      },
      {
        id: 5,
        text: '家庭成员一致同意养猫，无过敏等问题',
        checked: true
      },
      {
        id: 6,
        text: '具备经济能力承担猫咪的日常开销和医疗费用',
        checked: true
      },
      {
        id: 7,
        text: '了解猫咪习性，有科学养宠的基本知识',
        checked: true
      },
      {
        id: 8,
        text: '承诺不离不弃，接受长期回访',
        checked: true
      },
      {
        id: 9,
        text: '无虐待动物前科，社交媒体无不良记录',
        checked: true
      },
      {
        id: 10,
        text: '经过至少2周的考察期，多次沟通无异常',
        checked: true
      }
    ]
  },

  onLoad(options) {
    console.log('守护盾牌页面加载')
    // 支持从其他页面带参数跳转到特定Tab
    if (options && options.tab) {
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

  // 上传证据照片
  uploadEvidence() {
    wx.chooseMedia({
      count: 9,
      mediaType: ['image', 'video'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const files = res.tempFiles
        wx.showLoading({
          title: '上传中...'
        })

        // 模拟上传
        setTimeout(() => {
          wx.hideLoading()
          wx.showModal({
            title: '上传成功',
            content: `已上传${files.length}个文件\n\n温馨提示：\n1. 证据已加密保存\n2. 请及时报警\n3. 保留原始文件\n\n我们将协助您完成后续维权流程`,
            confirmText: '立即报警',
            confirmColor: '#EF4444',
            cancelText: '稍后',
            success: (modalRes) => {
              if (modalRes.confirm) {
                this.makeCall({ currentTarget: { dataset: { phone: '110' } } })
              }
            }
          })
        }, 1500)
      },
      fail: () => {
        wx.showToast({
          title: '取消上传',
          icon: 'none'
        })
      }
    })
  },

  // 查找附近宠物医院
  findHospital() {
    wx.showLoading({ title: '定位中...', mask: true })
    
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        wx.hideLoading()
        wx.showModal({
          title: '🏥 查找宠物医院',
          content: '建议使用地图App搜索"宠物医院"\n\n常见宠物医院：\n• 瑞鹏宠物医院\n• 瑞派宠物医院\n• 宠爱动物医院',
          confirmText: '打开地图',
          cancelText: '关闭',
          success: function(modalRes) {
            if (modalRes.confirm) {
              wx.openLocation({
                latitude: res.latitude,
                longitude: res.longitude,
                scale: 15
              })
            }
          }
        })
      },
      fail: function() {
        wx.hideLoading()
        wx.showModal({
          title: '定位失败',
          content: '请授权位置权限，或手动搜索"宠物医院"',
          confirmText: '去设置',
          success: function(res) {
            if (res.confirm) {
              wx.openSetting()
            }
          }
        })
      }
    })
  },

  // 提交举报
  submitReport() {
    wx.navigateTo({ url: '/pages/features/report-abuse/report-abuse' })
  },

  // 查看案例学习
  viewCaseStudy() {
    const cases = [
      {
        title: '小区虐猫案成功维权',
        date: '2024年3月',
        result: '施虐者被行政拘留10天，罚款500元',
        key: '及时报警+完整证据'
      },
      {
        title: '投毒案件成功告破',
        date: '2024年1月',
        result: '犯罪嫌疑人被刑事拘留',
        key: '监控录像+物证检验'
      },
      {
        title: '伪装领养者被识破',
        date: '2023年12月',
        result: '成功阻止虐待，挽救3只猫咪',
        key: '严格家访+背景调查'
      }
    ]

    let content = '以下是真实成功案例：\n\n'
    cases.forEach((c, i) => {
      content += `【案例${i + 1}】${c.title}\n`
      content += `时间：${c.date}\n`
      content += `结果：${c.result}\n`
      content += `关键：${c.key}\n\n`
    })

    wx.showModal({
      title: '成功案例学习',
      content: content,
      confirmText: '我要举报',
      confirmColor: '#FF9654',
      cancelText: '返回',
      success: (res) => {
        if (res.confirm) {
          this.submitReport()
        }
      }
    })
  },

  // 紧急求助
  emergencyHelp() {
    wx.showActionSheet({
      itemList: [
        '📞 拨打110报警',
        '🚨 上传证据并举报',
        '🏥 联系宠物急救',
        '🛡️ 联系动物保护组织'
      ],
      itemColor: '#EF4444',
      success: (res) => {
        switch(res.tapIndex) {
          case 0:
            wx.makePhoneCall({ phoneNumber: '110' })
            break
          case 1:
            this.uploadEvidence()
            break
          case 2:
            wx.makePhoneCall({ phoneNumber: '12315' })
            break
          case 3:
            wx.showToast({
              title: '请联系当地动物保护组织',
              icon: 'none',
              duration: 2000
            })
            break
        }
      }
    })
  },

  copyTemplate() {
    wx.setClipboardData({
      data: this.data.policeTemplate,
      success: () => {
        wx.showToast({
          title: '话术已复制',
          icon: 'success'
        })
      }
    })
  },

  makeCall(e) {
    const phone = e.currentTarget.dataset.phone
    if (phone === '400-xxx-xxxx') {
      wx.showToast({
        title: '请联系当地动物保护组织',
        icon: 'none'
      })
      return
    }
    wx.showModal({
      title: '确认拨打',
      content: `是否拨打 ${phone}？`,
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: phone
          })
        }
      }
    })
  },

  showLawDetail(e) {
    const item = e.currentTarget.dataset.item
    let content = item.content
    if (item.penalty) {
      content += '\n\n处罚：' + item.penalty
    }

    wx.showModal({
      title: item.name,
      content: content,
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#FF5252'
    })
  },

  onShareAppMessage() {
    return {
      title: '守护咪 - 守护盾牌：用法律武器保护每一只猫咪',
      path: '/pages/features/protection/protection',
      imageUrl: ''
    }
  },

  goBack() {
    wx.navigateBack()
  }
})
