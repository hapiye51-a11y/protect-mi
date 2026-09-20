const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    catId: '',
    catName: '',
    records: [],
    allRecords: [],
    activeFilter: 'all',
    vaccineCount: 0,
    dewormCount: 0,
    treatmentCount: 0,
    showAddMenu: false
  },

  onLoad(options) {
    this.setData({ catId: options.id })
    this.loadCatInfo()
    this.loadHealthRecords()
  },

  // 加载猫咪信息
  loadCatInfo() {
    db.collection('cats').doc(this.data.catId).get({
      success: (res) => {
        this.setData({ catName: res.data.name })
      }
    })
  },

  // 加载健康记录
  loadHealthRecords() {
    db.collection('cat_health')
      .where({ catId: this.data.catId })
      .orderBy('date', 'desc')
      .limit(100)
      .get({
        success: (res) => {
          const records = res.data.map(r => {
            r.displayDate = this.formatDate(r.date)
            r.typeIcon = this.getTypeIcon(r.type)
            return r
          })

          const vaccineCount = records.filter(r => r.type === 'vaccine').length
          const dewormCount = records.filter(r => r.type === 'deworm').length
          const treatmentCount = records.filter(r => r.type === 'treatment').length

          this.setData({
            records,
            allRecords: records,
            vaccineCount,
            dewormCount,
            treatmentCount
          })
        }
      })
  },

  // 切换筛选
  switchFilter(e) {
    const type = e.currentTarget.dataset.type
    let filtered = this.data.allRecords
    
    if (type !== 'all') {
      filtered = this.data.allRecords.filter(r => r.type === type)
    }

    this.setData({
      activeFilter: type,
      records: filtered
    })
  },

  // 获取类型图标
  getTypeIcon(type) {
    const icons = {
      'vaccine': '💉',
      'deworm': '🐛',
      'treatment': '🏥'
    }
    return icons[type] || '📋'
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url
    const urls = e.currentTarget.dataset.urls
    wx.previewImage({
      current: url,
      urls: urls
    })
  },

  // 显示添加菜单
  showAddMenu() {
    this.setData({ showAddMenu: true })
  },

  // 隐藏添加菜单
  hideAddMenu() {
    this.setData({ showAddMenu: false })
  },

  // 添加记录
  addRecord(e) {
    const type = e.currentTarget.dataset.type
    this.hideAddMenu()
    
    wx.navigateTo({
      url: `/pages/user/health-add/health-add?catId=${this.data.catId}&type=${type}`
    })
  },

  // 格式化日期
  formatDate(date) {
    if (!date) return ''
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  onShareAppMessage() {
    return {
      title: `${this.data.catName}的健康档案 🏥`,
      path: `/pages/core/cat-health/cat-health?id=${this.data.catId}`
    }
  }
})
