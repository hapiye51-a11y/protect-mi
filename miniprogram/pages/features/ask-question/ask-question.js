// 提问页面
Page({
  data: {
    type: 'feed',
    title: '',
    content: '',
    photos: [],
    typeText: {
      feed: '喂养',
      medical: '医疗',
      behavior: '行为',
      rescue: '救助',
      other: '其他'
    }
  },

  onLoad: function() {
    // 检查登录状态
    var userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.nickName) {
      wx.showModal({
        title: '请先登录',
        content: '提问需要登录，是否前往登录？',
        confirmText: '去登录',
        confirmColor: '#4CAF50',
        success: function(res) {
          if (res.confirm) {
            wx.redirectTo({ url: '/pages/user/login/login' })
          } else {
            wx.navigateBack()
          }
        }
      })
      return
    }
  },

  setType: function(e) {
    this.setData({ type: e.currentTarget.dataset.type })
  },

  setTitle: function(e) {
    this.setData({ title: e.detail.value })
  },

  setContent: function(e) {
    this.setData({ content: e.detail.value })
  },

  addPhoto: function() {
    var that = this
    wx.chooseImage({
      count: 3 - that.data.photos.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        that.setData({
          photos: that.data.photos.concat(res.tempFilePaths)
        })
      }
    })
  },

  delPhoto: function(e) {
    var index = e.currentTarget.dataset.index
    var photos = this.data.photos
    photos.splice(index, 1)
    this.setData({ photos: photos })
  },

  submit: function() {
    var that = this

    if (!this.data.title.trim()) {
      wx.showToast({ title: '请输入问题标题', icon: 'none' })
      return
    }

    if (!this.data.content.trim()) {
      wx.showToast({ title: '请输入详细描述', icon: 'none' })
      return
    }

    wx.showLoading({ title: '发布中...', mask: true })

    // 模拟发布
    setTimeout(function() {
      wx.hideLoading()

      // 返回上一页并传递数据
      var pages = getCurrentPages()
      var prevPage = pages[pages.length - 2]
      if (prevPage) {
        var questions = prevPage.data.questions || []
        questions.unshift({
          id: 'q' + Date.now(),
          type: that.data.type,
          typeText: that.data.typeText[that.data.type],
          question: that.data.title,
          author: '我',
          time: '刚刚',
          answerCount: 0,
          solved: false
        })
        prevPage.setData({ questions: questions })
      }

      wx.showToast({ title: '发布成功', icon: 'success' })
      setTimeout(function() {
        wx.navigateBack()
      }, 1500)
    }, 1000)
  }
})
