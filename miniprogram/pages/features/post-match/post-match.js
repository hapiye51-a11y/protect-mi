const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    type: 'lost', // lost 或 found
    photos: [],
    catName: '',
    features: '',
    eventDate: '',
    today: '',
    location: null,
    contact: '',
    reward: '',
    notes: '',
    loading: false,
    canSubmit: false
  },

  onLoad(options) {
    // 设置类型
    const type = options.type || 'lost'
    this.setData({
      type,
      today: this.formatDate(new Date())
    })

    // 更新标题
    wx.setNavigationBarTitle({
      title: type === 'lost' ? '发布走失信息' : '发布捡到信息'
    })
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  // 选择照片
  choosePhoto() {
    const remainCount = 9 - this.data.photos.length
    wx.chooseImage({
      count: remainCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newPhotos = [...this.data.photos, ...res.tempFilePaths]
        this.setData({ photos: newPhotos })
        this.checkCanSubmit()
      }
    })
  },

  // 预览照片
  previewPhoto(e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({
      current: url,
      urls: this.data.photos
    })
  },

  // 删除照片
  deletePhoto(e) {
    const index = e.currentTarget.dataset.index
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这张照片吗？',
      success: (res) => {
        if (res.confirm) {
          const photos = [...this.data.photos]
          photos.splice(index, 1)
          this.setData({ photos })
          this.checkCanSubmit()
        }
      }
    })
  },

  // 输入猫咪名称
  onCatNameInput(e) {
    this.setData({ catName: e.detail.value })
    this.checkCanSubmit()
  },

  // 输入特征描述
  onFeaturesInput(e) {
    this.setData({ features: e.detail.value })
    this.checkCanSubmit()
  },

  // 选择日期
  onDateChange(e) {
    this.setData({ eventDate: e.detail.value })
    this.checkCanSubmit()
  },

  // 选择位置
  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          location: {
            latitude: res.latitude,
            longitude: res.longitude,
            name: res.name || '选中位置',
            address: res.address || ''
          }
        })
        this.checkCanSubmit()
      },
      fail: (err) => {
        if (err.errMsg.indexOf('auth deny') !== -1) {
          wx.showModal({
            title: '需要位置权限',
            content: '请在设置中开启位置权限',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting()
              }
            }
          })
        }
      }
    })
  },

  // 输入联系方式
  onContactInput(e) {
    this.setData({ contact: e.detail.value })
    this.checkCanSubmit()
  },

  // 输入悬赏金额
  onRewardInput(e) {
    this.setData({ reward: e.detail.value })
  },

  // 输入备注
  onNotesInput(e) {
    this.setData({ notes: e.detail.value })
  },

  // 检查是否可以提交
  checkCanSubmit() {
    const { photos, catName, features, eventDate, location, contact } = this.data
    const canSubmit = photos.length > 0 &&
                      catName.trim() &&
                      features.trim() &&
                      eventDate &&
                      location &&
                      contact.trim()
    this.setData({ canSubmit })
  },

  // 提交
  submit() {
    if (!this.data.canSubmit || this.data.loading) return

    wx.showModal({
      title: '确认发布',
      content: '发布的信息将公开展示，请确保内容真实有效',
      confirmText: '确认发布',
      confirmColor: '#4CAF50',
      success: (res) => {
        if (res.confirm) {
          this.doSubmit()
        }
      }
    })
  },

  // 执行提交
  async doSubmit() {
    this.setData({ loading: true })
    wx.showLoading({ title: '发布中...', mask: true })

    try {
      // 1. 上传照片到云存储
      const cloudIDs = await this.uploadPhotos()

      // 2. 保存数据到云数据库
      await this.saveToDatabase(cloudIDs)

      wx.hideLoading()
      wx.showModal({
        title: '✅ 发布成功',
        content: '信息已发布，我们会尽力帮您找到猫咪/主人！',
        showCancel: false,
        confirmText: '返回',
        confirmColor: '#4CAF50',
        success: () => {
          wx.navigateBack()
        }
      })
    } catch (err) {
      console.error('发布失败:', err)
      wx.hideLoading()
      this.setData({ loading: false })
      wx.showToast({
        title: '发布失败，请重试',
        icon: 'none'
      })
    }
  },

  // 上传照片
  uploadPhotos() {
    const { photos, type } = this.data
    const uploadTasks = photos.map((photo, index) => {
      return new Promise((resolve, reject) => {
        const cloudPath = `match-photos/${type}/${Date.now()}-${index}.jpg`
        wx.cloud.uploadFile({
          cloudPath,
          filePath: photo,
          success: (res) => resolve(res.fileID),
          fail: (err) => reject(err)
        })
      })
    })
    return Promise.all(uploadTasks)
  },

  // 保存到数据库
  saveToDatabase(cloudIDs) {
    const { type, catName, features, eventDate, location, contact, reward, notes } = this.data
    const userInfo = wx.getStorageSync('userInfo') || {}

    const postData = {
      type, // lost 或 found
      photos: cloudIDs,
      catName,
      features,
      eventDate,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        name: location.name,
        address: location.address
      },
      contact,
      reward: type === 'lost' ? (reward || 0) : 0,
      notes,
      status: 'active', // active, found, closed

      // 用户信息
      publisher: {
        openid: '',
        nickName: userInfo.nickName || '爱心用户',
        avatarUrl: userInfo.avatarUrl || ''
      },

      // 统计
      viewCount: 0,
      likeCount: 0,
      shareCount: 0,

      // 时间
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    }

    return new Promise((resolve, reject) => {
      db.collection('matches').add({
        data: postData,
        success: (res) => resolve(res),
        fail: (err) => reject(err)
      })
    })
  },

  onShareAppMessage() {
    return {
      title: this.data.type === 'lost' ? '寻猫启事' : '捡到猫咪，寻找主人',
      path: `/pages/features/cat-match/cat-match`,
      imageUrl: this.data.photos[0] || ''
    }
  }
})
