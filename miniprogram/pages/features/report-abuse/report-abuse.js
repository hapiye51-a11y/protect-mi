// 举报页面
Page({
  data: {
    type: 'abuse',
    description: '',
    date: '',
    today: '',
    location: '',
    latitude: null,
    longitude: null,
    photos: [],
    abuserInfo: '',
    contact: ''
  },

  onLoad: function() {
    // 检查登录状态
    var userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.nickName) {
      wx.showModal({
        title: '请先登录',
        content: '举报虐猫需要登录，是否前往登录？',
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
    
    var d = new Date()
    this.setData({
      today: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
    })
  },

  setType: function(e) {
    this.setData({ type: e.currentTarget.dataset.type })
  },

  setDescription: function(e) {
    this.setData({ description: e.detail.value })
  },

  setDate: function(e) {
    this.setData({ date: e.detail.value })
  },

  chooseLocation: function() {
    var that = this
    wx.chooseLocation({
      success: function(res) {
        that.setData({
          location: res.name || res.address || '选中位置',
          latitude: res.latitude,
          longitude: res.longitude
        })
      }
    })
  },

  addPhoto: function() {
    var that = this
    wx.chooseMedia({
      count: 9 - that.data.photos.length,
      mediaType: ['image', 'video'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        var newPhotos = res.tempFiles.map(function(f) { return f.tempFilePath })
        that.setData({
          photos: that.data.photos.concat(newPhotos)
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

  previewImage: function(e) {
    var url = e.currentTarget.dataset.url
    wx.previewImage({
      current: url,
      urls: this.data.photos
    })
  },

  setAbuserInfo: function(e) {
    this.setData({ abuserInfo: e.detail.value })
  },

  setContact: function(e) {
    this.setData({ contact: e.detail.value })
  },

  submit: function() {
    var that = this

    if (!this.data.description.trim()) {
      wx.showToast({ title: '请描述事件', icon: 'none' })
      return
    }

    if (!this.data.location) {
      wx.showToast({ title: '请选择地点', icon: 'none' })
      return
    }

    wx.showModal({
      title: '确认提交',
      content: '举报信息提交后，我们将尽快处理。是否确认提交？',
      confirmText: '确认提交',
      confirmColor: '#4CAF50',
      success: function(res) {
        if (res.confirm) {
          that.doSubmit()
        }
      }
    })
  },

  doSubmit: function() {
    var that = this
    wx.showLoading({ title: '提交中...', mask: true })

    // 模拟提交
    setTimeout(function() {
      wx.hideLoading()
      wx.showModal({
        title: '✅ 提交成功',
        content: '感谢您的举报！\n\n我们已收到您的举报信息，将尽快核实处理。\n\n建议您同时拨打110报警，以便更快处理。',
        confirmText: '立即报警',
        cancelText: '返回',
        confirmColor: '#F44336',
        success: function(res) {
          if (res.confirm) {
            wx.makePhoneCall({ phoneNumber: '110' })
          } else {
            wx.navigateBack()
          }
        }
      })
    }, 1500)
  }
})
