const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    totalTimes: 0,
    totalCats: 0,
    totalDays: 0,
    canCheckin: true,
    records: []
  },

  onLoad() {
    // 检查登录状态
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.nickName) {
      wx.showModal({
        title: '请先登录',
        content: '投喂打卡需要登录，是否前往登录？',
        confirmText: '去登录',
        confirmColor: '#4CAF50',
        success: (res) => {
          if (res.confirm) {
            wx.redirectTo({ url: '/pages/user/login/login' })
          } else {
            wx.navigateBack()
          }
        }
      })
      return
    }
    
    this.loadStats()
    this.loadRecords()
    this.checkTodayCheckin()
  },

  // 加载统计数据
  loadStats() {
    const stats = wx.getStorageSync('feedingStats') || {
      totalTimes: 0,
      totalCats: 0,
      totalDays: 0
    }
    this.setData({ ...stats })
  },

  // 加载打卡记录
  loadRecords() {
    try {
      db.collection('checkins')
        .where({
          type: 'feeding',
          userId: app.globalData.userInfo?.openid || ''
        })
        .orderBy('createTime', 'desc')
        .limit(10)
        .get({
          success: (res) => {
            const records = res.data.map(item => ({
              id: item._id,
              cats: item.catsCount || 1,
              time: this.formatTime(item.createTime),
              location: item.address || '未知位置'
            }))
            this.setData({ records })
          }
        })
    } catch (e) {
      console.log('加载打卡记录失败:', e)
    }
  },

  // 检查今日是否已打卡
  checkTodayCheckin() {
    const today = new Date().toDateString()
    const lastCheckin = wx.getStorageSync('lastFeedingCheckin')
    this.setData({
      canCheckin: lastCheckin !== today
    })
  },

  // 执行打卡
  doCheckin() {
    if (!this.data.canCheckin) {
      wx.showToast({
        title: '今日已打卡',
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: '打卡中...', mask: true })

    // 获取位置
    wx.getLocation({
      type: 'gcj02',
      success: (locationRes) => {
        // 保存打卡记录
        const checkinData = {
          type: 'feeding',
          location: {
            latitude: locationRes.latitude,
            longitude: locationRes.longitude
          },
          catsCount: Math.floor(Math.random() * 3) + 1,
          createTime: db.serverDate(),
          userId: app.globalData.userInfo?.openid || ''
        }

        db.collection('checkins').add({
          data: checkinData,
          success: () => {
            // 更新本地统计
            const stats = {
              totalTimes: this.data.totalTimes + 1,
              totalCats: this.data.totalCats + checkinData.catsCount,
              totalDays: this.data.totalDays + (this.data.canCheckin ? 1 : 0)
            }

            wx.setStorageSync('feedingStats', stats)
            wx.setStorageSync('lastFeedingCheckin', new Date().toDateString())

            wx.hideLoading()
            wx.showModal({
              title: '✅ 打卡成功',
              content: `感谢您的爱心投喂！\n\n本次投喂了 ${checkinData.catsCount} 只猫咪\n\n您的每一份爱心都在温暖这些小生命`,
              confirmText: '太棒了',
              confirmColor: '#4CAF50',
              showCancel: false
            })

            this.setData({
              ...stats,
              canCheckin: false
            })
            this.loadRecords()
          },
          fail: () => {
            wx.hideLoading()
            wx.showToast({
              title: '打卡失败',
              icon: 'none'
            })
          }
        })
      },
      fail: () => {
        wx.hideLoading()
        wx.showModal({
          title: '无法获取位置',
          content: '打卡需要获取您的位置信息',
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

  // 格式化时间
  formatTime(time) {
    const date = new Date(time)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
    return date.toLocaleDateString()
  }
})
