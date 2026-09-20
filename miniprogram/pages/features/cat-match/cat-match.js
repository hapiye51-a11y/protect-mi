const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({
  data: {
    currentTab: 0,
    loading: false,
    lostList: [],
    foundList: [],
    hasMore: true,
    pageSize: 20
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    // 每次显示时刷新数据
    this.refreshData()
  },

  // 切换标签
  switchTab(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    this.setData({ currentTab: index })
  },

  // 刷新数据
  refreshData() {
    this.setData({
      lostList: [],
      foundList: [],
      hasMore: true
    })
    this.loadData()
  },

  // 加载数据
  loadData() {
    this.setData({ loading: true })

    // 同时加载走失和捡到数据
    Promise.all([
      this.loadLostList(),
      this.loadFoundList()
    ]).finally(() => {
      this.setData({ loading: false })
    })
  },

  // 加载走失列表
  loadLostList() {
    return new Promise((resolve) => {
      db.collection('matches')
        .where({
          type: 'lost',
          status: _.in(['active', 'found'])
        })
        .orderBy('createTime', 'desc')
        .limit(this.data.pageSize)
        .get({
          success: (res) => {
            const lostList = res.data.map(item => this.formatItem(item))
            this.setData({ lostList })
            resolve()
          },
          fail: (err) => {
            console.error('加载走失列表失败:', err)
            resolve()
          }
        })
    })
  },

  // 加载捡到列表
  loadFoundList() {
    return new Promise((resolve) => {
      db.collection('matches')
        .where({
          type: 'found',
          status: _.in(['active', 'found'])
        })
        .orderBy('createTime', 'desc')
        .limit(this.data.pageSize)
        .get({
          success: (res) => {
            const foundList = res.data.map(item => this.formatItem(item))
            this.setData({ foundList })
            resolve()
          },
          fail: (err) => {
            console.error('加载捡到列表失败:', err)
            resolve()
          }
        })
    })
  },

  // 格式化列表项
  formatItem(item) {
    return {
      id: item._id,
      catName: item.catName,
      image: item.photos && item.photos[0] || '/images/placeholder-cat.jpg',
      features: item.features,
      location: item.location?.name || '未知位置',
      eventDate: item.eventDate,
      time: this.formatTime(item.createTime),
      status: item.status,
      reward: item.reward || 0,
      contact: item.contact,
      photos: item.photos || [],
      notes: item.notes || ''
    }
  },

  // 格式化时间
  formatTime(time) {
    const date = new Date(time)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
    if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
    return date.toLocaleDateString()
  },

  // 发布走失信息
  postLost() {
    wx.navigateTo({
      url: '/pages/features/post-match/post-match?type=lost'
    })
  },

  // 发布捡到信息
  postFound() {
    wx.navigateTo({
      url: '/pages/features/post-match/post-match?type=found'
    })
  },

  // 查看详情
  viewDetail(e) {
    const item = e.currentTarget.dataset.item
    if (!item) return

    const rewardText = item.reward > 0 ? `\n💰 悬赏：${item.reward}元` : ''
    const statusText = item.status === 'found' ? '✅ 已找到' : '🔍 寻找中'

    let content = `${statusText}\n\n`
    content += `🐱 名称：${item.catName}\n`
    content += `📅 时间：${item.eventDate}\n`
    content += `📍 地点：${item.location}\n`
    content += `📋 特征：${item.features}${rewardText}`

    if (item.notes) {
      content += `\n\n📝 备注：${item.notes}`
    }

    wx.showModal({
      title: this.data.currentTab === 0 ? '走失详情' : '捡到详情',
      content,
      confirmText: '联系TA',
      cancelText: '关闭',
      confirmColor: '#4CAF50',
      success: (res) => {
        if (res.confirm) {
          this.contactPublisher(item)
        }
      }
    })
  },

  // 联系发布者
  contactPublisher(item) {
    wx.showModal({
      title: '联系方式',
      content: `请联系：${item.contact}\n\n请注意保护个人隐私，谨防诈骗。`,
      confirmText: '复制联系方式',
      cancelText: '取消',
      confirmColor: '#4CAF50',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: item.contact,
            success: () => {
              wx.showToast({
                title: '已复制',
                icon: 'success'
              })
            }
          })
        }
      }
    })
  },

  // 预览图片
  previewImage(e) {
    const { current, urls } = e.currentTarget.dataset
    wx.previewImage({
      current,
      urls
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.refreshData()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  onShareAppMessage() {
    return {
      title: '猫咪匹配 - 帮流浪猫找到家',
      path: '/pages/features/cat-match/cat-match',
      imageUrl: ''
    }
  }
})
