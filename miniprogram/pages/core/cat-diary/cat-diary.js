const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    catId: '',
    catName: '',
    diaries: [],
    totalCount: 0,
    isOwner: false // 是否是档案创建者
  },

  onLoad(options) {
    this.setData({ catId: options.id })
    this.loadCatInfo()
    this.loadDiaries()
  },

  // 加载猫咪信息
  loadCatInfo() {
    db.collection('cats').doc(this.data.catId).get({
      success: (res) => {
        const cat = res.data
        
        // 判断是否是档案创建者
        const userInfo = wx.getStorageSync('userInfo') || {}
        const isOwner = cat._openid === userInfo.openid || 
                        cat.reporter?.openid === userInfo.openid ||
                        (userInfo.nickName && cat.reporter?.nickName === userInfo.nickName)
        
        this.setData({ 
          catName: cat.name,
          isOwner: isOwner
        })
      }
    })
  },

  // 加载日志
  loadDiaries() {
    db.collection('cat_diary')
      .where({ catId: this.data.catId })
      .orderBy('createTime', 'desc')
      .limit(100)
      .get({
        success: (res) => {
          const diaries = res.data.map(d => {
            const date = new Date(d.createTime)
            d.day = String(date.getDate()).padStart(2, '0')
            d.month = `${date.getMonth() + 1}月`
            return d
          })

          this.setData({
            diaries,
            totalCount: diaries.length
          })
        }
      })
  },

  // 查看日志详情
  viewDiary(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/core/diary-detail/diary-detail?id=${id}`
    })
  },

  // 长按日记 - 删除
  onLongPressDiary(e) {
    const id = e.currentTarget.dataset.id
    const diary = this.data.diaries.find(d => d._id === id)
    
    if (!diary || !this.data.isOwner) return
    
    wx.showActionSheet({
      itemList: ['删除这篇日记'],
      itemColor: '#FF5252',
      success: (res) => {
        if (res.tapIndex === 0) {
          this.deleteDiary(id)
        }
      }
    })
  },

  // 删除日记
  deleteDiary(id) {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这篇日记吗？',
      confirmText: '删除',
      confirmColor: '#FF5252',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...', mask: true })
          
          db.collection('cat_diary')
            .doc(id)
            .remove({
              success: () => {
                wx.hideLoading()
                wx.showToast({ title: '已删除', icon: 'success' })
                this.loadDiaries()
              },
              fail: (err) => {
                wx.hideLoading()
                console.error('删除失败:', err)
                wx.showToast({ title: '删除失败', icon: 'none' })
              }
            })
        }
      }
    })
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

  // 添加日志
  addDiary() {
    wx.navigateTo({
      url: `/pages/user/diary-add/diary-add?catId=${this.data.catId}`
    })
  },

  onShareAppMessage() {
    return {
      title: `${this.data.catName}的成长记录 📝`,
      path: `/pages/core/cat-diary/cat-diary?id=${this.data.catId}`
    }
  }
})
