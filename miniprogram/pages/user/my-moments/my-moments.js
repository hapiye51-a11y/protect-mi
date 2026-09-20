const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    moments: [],
    loading: true,
    isEmpty: false
  },

  onLoad() {
    this.loadMyMoments()
  },

  onShow() {
    this.loadMyMoments()
  },

  // 加载我的动态
  loadMyMoments() {
    this.setData({ loading: true })

    db.collection('moments')
      .where({
        _openid: app.globalData.userInfo?.openid || ''
      })
      .orderBy('createTime', 'desc')
      .get({
        success: (res) => {
          const moments = res.data || []
          this.setData({
            moments,
            isEmpty: moments.length === 0,
            loading: false
          })
        },
        fail: (err) => {
          console.error('加载我的动态失败:', err)
          this.setData({ loading: false })
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          })
        }
      })
  },

  // 查看动态详情
  onMomentTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/features/community/community?momentId=${id}`
    })
  },

  // 删除动态
  onDelete(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除动态',
      content: '确定要删除这条动态吗？',
      confirmText: '删除',
      confirmColor: '#FF5252',
      success: (res) => {
        if (res.confirm) {
          this.doDelete(id)
        }
      }
    })
  },

  // 执行删除
  doDelete(id) {
    wx.showLoading({ title: '删除中...', mask: true })

    db.collection('moments')
      .doc(id)
      .remove({
        success: () => {
          wx.hideLoading()
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
          this.loadMyMoments()
        },
        fail: (err) => {
          wx.hideLoading()
          console.error('删除失败:', err)
          wx.showToast({
            title: '删除失败',
            icon: 'none'
          })
        }
      })
  },

  // 发布新动态
  onPublish() {
    wx.navigateTo({
      url: '/pages/user/post-moment/post-moment'
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadMyMoments()
    wx.stopPullDownRefresh()
  }
})
