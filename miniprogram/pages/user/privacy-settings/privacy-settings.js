// 隐私设置页面
Page({
  data: {
    settings: {
      showLocation: true,      // 显示位置信息
      showOnlineStatus: true,  // 显示在线状态
      allowStrangerMsg: true,  // 允许陌生人私信
      showMyCats: true,        // 公开我的猫咪
      showMyMoments: true      // 公开我的动态
    }
  },

  onLoad: function() {
    this.loadSettings()
  },

  // 加载设置
  loadSettings: function() {
    var saved = wx.getStorageSync('privacySettings')
    if (saved) {
      this.setData({ settings: saved })
    }
  },

  // 保存设置
  saveSettings: function() {
    wx.setStorageSync('privacySettings', this.data.settings)
  },

  // 切换开关
  toggleSwitch: function(e) {
    var key = e.currentTarget.dataset.key
    var value = e.detail.value
    var settings = this.data.settings
    settings[key] = value
    this.setData({ settings: settings })
    this.saveSettings()
    
    var tips = {
      showLocation: value ? '已开启位置显示' : '已隐藏位置信息',
      showOnlineStatus: value ? '已显示在线状态' : '已隐藏在线状态',
      allowStrangerMsg: value ? '已允许陌生人私信' : '已禁止陌生人私信',
      showMyCats: value ? '已公开我的猫咪' : '已隐藏我的猫咪',
      showMyMoments: value ? '已公开我的动态' : '已隐藏我的动态'
    }
    
    wx.showToast({ title: tips[key], icon: 'none' })
  },

  // 查看隐私政策
  viewPrivacy: function() {
    wx.navigateTo({ url: '/pages/legal/privacy/privacy' })
  },

  // 查看用户协议
  viewAgreement: function() {
    wx.navigateTo({ url: '/pages/legal/user-agreement/user-agreement' })
  },

  // 清除缓存
  clearCache: function() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有本地缓存数据吗？这不会影响你的账号信息。',
      confirmColor: '#FF5252',
      success: function(res) {
        if (res.confirm) {
          var userInfo = wx.getStorageSync('userInfo')
          var privacySettings = wx.getStorageSync('privacySettings')
          wx.clearStorageSync()
          if (userInfo) wx.setStorageSync('userInfo', userInfo)
          if (privacySettings) wx.setStorageSync('privacySettings', privacySettings)
          wx.showToast({ title: '已清除', icon: 'success' })
        }
      }
    })
  }
})
