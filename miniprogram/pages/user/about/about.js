// 关于我们页面
Page({
  data: {
    version: '1.0.0',
    contactEmail: 'a229941302@163.com',
    contactWechat: 'shouhumi2024'
  },

  onLoad: function() {},

  // 复制邮箱
  copyEmail: function() {
    wx.setClipboardData({
      data: this.data.contactEmail,
      success: function() {
        wx.showToast({ title: '已复制邮箱', icon: 'success' })
      }
    })
  },

  // 复制微信
  copyWechat: function() {
    wx.setClipboardData({
      data: this.data.contactWechat,
      success: function() {
        wx.showToast({ title: '已复制微信号', icon: 'success' })
      }
    })
  },

  // 查看隐私政策
  viewPrivacy: function() {
    wx.navigateTo({ url: '/pages/legal/privacy/privacy' })
  },

  // 查看用户协议
  viewAgreement: function() {
    wx.navigateTo({ url: '/pages/legal/user-agreement/user-agreement' })
  },

  // 检查更新
  checkUpdate: function() {
    wx.showLoading({ title: '检查中...' })
    setTimeout(function() {
      wx.hideLoading()
      wx.showModal({
        title: '检查更新',
        content: '当前已是最新版本',
        showCancel: false
      })
    }, 1000)
  }
})
