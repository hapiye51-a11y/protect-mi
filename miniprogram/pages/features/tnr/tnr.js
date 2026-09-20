const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({
  data: {
    tnrCount: 0,
    inProgress: 0,
    pendingCount: 0,
    records: [],
    loading: false
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    this.setData({ loading: true })

    Promise.all([
      this.loadStats(),
      this.loadRecords()
    ]).finally(() => {
      this.setData({ loading: false })
    })
  },

  loadStats() {
    return new Promise((resolve) => {
      // 统计各类数量
      Promise.all([
        db.collection('tnr_records').where({ status: 'done' }).count(),
        db.collection('tnr_records').where({ status: 'progress' }).count(),
        db.collection('tnr_records').where({ status: 'pending' }).count()
      ]).then(([done, progress, pending]) => {
        this.setData({
          tnrCount: done.total,
          inProgress: progress.total,
          pendingCount: pending.total
        })
        resolve()
      }).catch(() => resolve())
    })
  },

  loadRecords() {
    return new Promise((resolve) => {
      db.collection('tnr_records')
        .orderBy('createTime', 'desc')
        .limit(50)
        .get({
          success: (res) => {
            const records = res.data.map(item => ({
              id: item._id,
              catName: item.catName,
              status: item.status,
              statusText: item.statusText,
              location: item.captureLocation?.name || item.releaseLocation?.name || '未知',
              updateTime: this.formatTime(item.updateTime),
              image: item.photos?.[0] || '',
              // 详情
              genderText: item.genderText,
              ageText: item.ageText,
              hospital: item.hospital,
              surgeryDate: item.surgeryDate,
              releaseDate: item.releaseDate
            }))
            this.setData({ records })
            resolve()
          },
          fail: (err) => {
            console.error('加载记录失败:', err)
            resolve()
          }
        })
    })
  },

  formatTime(time) {
    if (!time) return ''
    const date = new Date(time)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
    if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
    return date.toLocaleDateString()
  },

  addTNR() {
    wx.navigateTo({
      url: '/pages/features/tnr-record/tnr-record'
    })
  },

  viewGuide() {
    wx.navigateTo({
      url: '/pages/features/science/science?tab=0'
    })
  },

  viewDetail(e) {
    const item = e.currentTarget.dataset.item
    if (!item) return

    let content = `🐱 名称：${item.catName}\n`
    content += `⚤ 性别：${item.genderText || '未知'}\n`
    content += `📅 年龄：${item.ageText || '未知'}\n`
    content += `🏥 医院：${item.hospital}\n`
    content += `📆 手术：${item.surgeryDate}\n`

    if (item.releaseDate) {
      content += `🏡 放归：${item.releaseDate}\n`
    }

    wx.showModal({
      title: 'TNR详情',
      content,
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#4CAF50'
    })
  },

  onPullDownRefresh() {
    this.loadData()
    setTimeout(() => wx.stopPullDownRefresh(), 1000)
  },

  onShareAppMessage() {
    return {
      title: 'TNR记录 - 科学救助流浪猫',
      path: '/pages/features/tnr/tnr'
    }
  }
})
