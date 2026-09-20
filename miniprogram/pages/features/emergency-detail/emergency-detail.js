const app = getApp()

Page({
  data: {
    emergency: {
      id: 0,
      icon: '',
      title: '',
      urgency: '',
      urgencyText: '',
      summary: '',
      steps: [],
      warning: ''
    }
  },

  onLoad(options) {
    // 从全局数据或缓存中获取
    const emergencyData = wx.getStorageSync('currentEmergency')
    if (emergencyData) {
      this.setData({ emergency: emergencyData })
      wx.removeStorageSync('currentEmergency')
    }
  },

  goBack() {
    wx.navigateBack()
  },

  searchHospital() {
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
      title: `守护咪 - ${this.data.emergency.title}`,
      path: '/pages/features/science/science?tab=1'
    }
  }
})
