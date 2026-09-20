const app = getApp()

Page({
  data: {
    // 状态栏高度
    statusBarHeight: 0,
    // 登录中状态
    isLogging: false,
    // 是否同意协议
    agreed: false,
    // 版本号
    version: '1.0.0',
    // 默认使用emoji模式（更稳定）
    useEmoji: true,
    randomCatEmoji: '🐱',
    // 猫咪emoji库
    catEmojis: ['🐈', '😺', '😸', '🐈‍⬛']
  },

  onLoad() {
    // 隐藏返回按钮
    wx.hideHomeButton && wx.hideHomeButton()
    
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync()
    
    // 获取版本号
    try {
      const accountInfo = wx.getAccountInfoSync()
      const version = accountInfo.miniProgram.version || '1.0.0'
      this.setData({ version: version })
    } catch (e) {
      console.log('获取版本号失败，使用默认版本')
    }
    
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    })

    // 随机选择一只猫咪
    this.selectRandomCat()

    // 检查是否已登录
    this.checkLoginStatus()
  },

  // 随机选择猫咪
  selectRandomCat() {
    const randomEmoji = this.data.catEmojis[Math.floor(Math.random() * this.data.catEmojis.length)]
    this.setData({
      randomCatEmoji: randomEmoji
    })
    console.log('随机猫咪:', randomEmoji)
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo')

    if (userInfo && userInfo.nickName && userInfo.avatarUrl) {
      // 已有完整用户信息，直接跳转首页
      wx.switchTab({
        url: '/pages/core/index/index'
      })
    }
  },

  // 微信一键登录
  onWeChatLogin() {
    if (this.data.isLogging) return
    
    if (!this.data.agreed) {
      wx.showToast({
        title: '请先同意用户协议',
        icon: 'none'
      })
      return
    }

    this.setData({ isLogging: true })

    // 使用新版头像昵称获取能力
    wx.showModal({
      title: '授权登录',
      content: '将获取您的头像和昵称用于展示',
      confirmText: '同意授权',
      confirmColor: '#4CAF50',
      success: (res) => {
        if (res.confirm) {
          // 用户同意，跳转到编辑页面获取头像昵称
          wx.redirectTo({
            url: '/pages/user/profile-edit/profile-edit?from=login'
          })
        } else {
          this.setData({ isLogging: false })
        }
      },
      fail: () => {
        this.setData({ isLogging: false })
      }
    })
  },

  // 跳过登录（游客模式）
  onSkipLogin() {
    wx.showModal({
      title: '游客模式',
      content: '跳过登录可浏览内容，但无法发布救助信息、评论互动。您可以随时在"我的"页面登录。',
      confirmText: '继续浏览',
      cancelText: '去登录',
      confirmColor: '#FF9800',
      success: (res) => {
        if (res.confirm) {
          // 标记为游客模式
          wx.setStorageSync('isGuest', true)
          wx.switchTab({
            url: '/pages/core/index/index'
          })
        }
      }
    })
  },

  // 切换协议同意状态
  toggleAgreement() {
    this.setData({
      agreed: !this.data.agreed
    })
  },

  // 跳转协议页面
  goToAgreement(e) {
    const type = e.currentTarget.dataset.type
    if (type === 'user') {
      wx.navigateTo({
        url: '/pages/legal/user-agreement/user-agreement'
      })
    } else if (type === 'privacy') {
      wx.navigateTo({
        url: '/pages/legal/privacy/privacy'
      })
    }
  }
})
