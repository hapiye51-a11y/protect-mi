// 个人中心页面
Page({
  data: {
    isLogin: false,
    userInfo: {},
    userLevel: 1,
    isAdmin: false
  },

  onLoad: function() {
    this.initData()
    this.checkAdmin()
  },

  onShow: function() {
    this.initData()
  },

  initData: function() {
    var info = wx.getStorageSync('userInfo') || {}
    var login = info && info.nickName
    this.setData({
      isLogin: login,
      userInfo: info
    })
  },
  
  // 检查是否是管理员
  checkAdmin: function() {
    wx.cloud.callFunction({
      name: 'checkAdmin',
      success: (res) => {
        console.log('管理员检查结果:', res.result)
        wx.showToast({
          title: 'isAdmin: ' + (res.result && res.result.isAdmin),
          icon: 'none',
          duration: 3000
        })
        this.setData({
          isAdmin: res.result && res.result.isAdmin
        })
      },
      fail: (err) => {
        console.error('检查管理员失败:', err)
        wx.showToast({
          title: '云函数调用失败',
          icon: 'none'
        })
        this.setData({ isAdmin: false })
      }
    })
  },

  goLogin: function() {
    wx.navigateTo({ url: '/pages/user/profile-edit/profile-edit' })
  },

  goPage: function(e) {
    var url = e.currentTarget.dataset.url
    if (!this.data.isLogin) {
      this.showTip()
      return
    }
    wx.navigateTo({ url: url })
  },

  showTip: function() {
    wx.showModal({
      title: '提示',
      content: '请先登录',
      confirmText: '去登录',
      success: function(res) {
        if (res.confirm) {
          wx.navigateTo({ url: '/pages/user/profile-edit/profile-edit' })
        }
      }
    })
  },

  logout: function() {
    var that = this
    wx.showModal({
      title: '退出登录',
      content: '确定要退出吗？',
      confirmColor: '#FF5252',
      success: function(res) {
        if (res.confirm) {
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync('userStats')
          wx.showToast({ 
            title: '已退出', 
            icon: 'success',
            success: function() {
              setTimeout(function() {
                wx.redirectTo({ url: '/pages/user/login/login' })
              }, 1500)
            }
          })
        }
      }
    })
  }
})
