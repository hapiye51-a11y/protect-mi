const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    catId: '',
    catName: '',
    photos: [],
    allPhotos: [],
    activeCategory: 'all',
    totalCount: 0,
    lifeCount: 0,
    rescueCount: 0,
    showUploadModal: false,
    uploading: false,
    pendingPhoto: '',
    uploadData: {
      category: 'life',
      date: '',
      note: '',
      tempUrl: ''
    },
    isOwner: false // 是否是档案创建者
  },

  onLoad(options) {
    this.setData({ catId: options.id })
    this.loadCatInfo()
    this.loadPhotos()
    
    // 设置默认日期为今天
    const today = this.formatDate(new Date())
    this.setData({ 'uploadData.date': today })
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

  // 加载照片
  loadPhotos() {
    db.collection('cat_photos')
      .where({ catId: this.data.catId })
      .orderBy('date', 'desc')
      .limit(200)
      .get({
        success: (res) => {
          const photos = res.data.map(p => {
            p.displayDate = this.formatDate(p.date)
            p.categoryText = this.getCategoryText(p.category)
            return p
          })

          const lifeCount = photos.filter(p => p.category === 'life').length
          const rescueCount = photos.filter(p => p.category === 'rescue').length

          this.setData({
            photos,
            allPhotos: photos,
            totalCount: photos.length,
            lifeCount,
            rescueCount
          })
        }
      })
  },

  // 切换分类
  switchCategory(e) {
    const type = e.currentTarget.dataset.type
    let filtered = this.data.allPhotos
    
    if (type !== 'all') {
      filtered = this.data.allPhotos.filter(p => p.category === type)
    }

    this.setData({
      activeCategory: type,
      photos: filtered
    })
  },

  // 获取分类文字
  getCategoryText(category) {
    const map = {
      'life': '生活照',
      'rescue': '救助时',
      'medical': '就医'
    }
    return map[category] || '其他'
  },

  // 预览照片
  previewPhoto(e) {
    const index = e.currentTarget.dataset.index
    const photos = this.data.photos
    const urls = photos.map(p => p.url)
    
    if (urls.length === 0) return
    
    wx.previewImage({
      current: urls[index] || urls[0],
      urls: urls
    })
  },

  // 长按照片 - 删除
  onLongPressPhoto(e) {
    const index = e.currentTarget.dataset.index
    const photo = this.data.photos[index]
    
    if (!photo) return
    
    // 非创建者不能删除
    if (!this.data.isOwner) {
      return
    }
    
    wx.showActionSheet({
      itemList: ['删除这张照片'],
      itemColor: '#FF5252',
      success: (res) => {
        if (res.tapIndex === 0) {
          this.deletePhoto(photo._id, index)
        }
      }
    })
  },

  // 删除照片
  deletePhoto(photoId, index) {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这张照片吗？',
      confirmText: '删除',
      confirmColor: '#FF5252',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...', mask: true })
          
          db.collection('cat_photos')
            .doc(photoId)
            .remove({
              success: () => {
                wx.hideLoading()
                wx.showToast({ title: '已删除', icon: 'success' })
                this.loadPhotos()
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

  // 点击格子 - 统一处理
  onSlotTap(e) {
    const index = e.currentTarget.dataset.index
    
    // 如果有照片，预览
    if (this.data.photos[index]) {
      this.previewPhoto({ currentTarget: { dataset: { index } } })
      return
    }
    
    // 如果没有照片且是创建者，可以添加
    if (this.data.isOwner) {
      this.addPhoto({ currentTarget: { dataset: { index } } })
      return
    }
    
    // 非创建者不能添加
    wx.showToast({ 
      title: '只有档案创建者才能上传照片', 
      icon: 'none' 
    })
  },

  // 点击格子 - 添加照片
  addPhoto(e) {
    const index = e.currentTarget.dataset.index
    
    // 如果已有照片，点击可预览
    if (this.data.photos[index]) {
      this.previewPhoto({ currentTarget: { dataset: { index } } })
      return
    }
    
    // 检查是否已满
    if (this.data.photos.length >= 5) {
      wx.showToast({ title: '最多上传5张照片', icon: 'none' })
      return
    }
    
    // 选择照片
    const that = this
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        that.setData({ 
          pendingPhoto: res.tempFiles[0].tempFilePath,
          showUploadModal: true,
          'uploadData.tempUrl': res.tempFiles[0].tempFilePath
        })
      }
    })
  },

  // 点击待确认的照片，弹出表单填写信息
  confirmPendingPhoto() {
    this.setData({ 
      'uploadData.tempUrl': this.data.pendingPhoto,
      showUploadModal: true 
    })
  },

  // 删除待确认的照片
  deletePendingPhoto() {
    this.setData({ pendingPhoto: '' })
  },

  // 隐藏上传弹窗
  hideUploadModal() {
    this.setData({ 
      showUploadModal: false,
      'uploadData.tempUrl': ''
    })
  },

  // 选择分类
  selectCategory(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ 'uploadData.category': type })
  },

  // 选择日期
  onDateChange(e) {
    this.setData({ 'uploadData.date': e.detail.value })
  },

  // 输入备注
  onNoteInput(e) {
    this.setData({ 'uploadData.note': e.detail.value })
  },

  // 重新选择照片
  rechoosePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({ 'uploadData.tempUrl': res.tempFiles[0].tempFilePath })
      }
    })
  },

  // 删除已选照片
  deletePhoto() {
    this.setData({ 
      'uploadData.tempUrl': '',
      showUploadModal: false
    })
  },

  // 确认上传
  confirmUpload() {
    if (!this.data.uploadData.tempUrl) {
      wx.showToast({ title: '请选择照片', icon: 'none' })
      return
    }

    if (!this.data.uploadData.date) {
      wx.showToast({ title: '请选择日期', icon: 'none' })
      return
    }

    this.setData({ uploading: true })

    // 上传图片到云存储
    const cloudPath = `cat_photos/${this.data.catId}/${Date.now()}_${Math.random().toString(36).substr(2)}.jpg`
    
    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: this.data.uploadData.tempUrl,
      success: (res) => {
        // 保存记录到数据库
        db.collection('cat_photos').add({
          data: {
            catId: this.data.catId,
            url: res.fileID,
            category: this.data.uploadData.category,
            date: new Date(this.data.uploadData.date),
            note: this.data.uploadData.note,
            createTime: db.serverDate()
          },
          success: () => {
            wx.showToast({ title: '上传成功', icon: 'success' })
            this.hideUploadModal()
            this.loadPhotos()
            
            // 重置表单
            this.setData({
              uploading: false,
              uploadData: {
                category: 'life',
                date: this.formatDate(new Date()),
                note: '',
                tempUrl: ''
              }
            })
          },
          fail: () => {
            wx.showToast({ title: '保存失败', icon: 'none' })
            this.setData({ uploading: false })
          }
        })
      },
      fail: () => {
        wx.showToast({ title: '上传失败', icon: 'none' })
        this.setData({ uploading: false })
      }
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
      title: `${this.data.catName}的相册 📷`,
      path: `/pages/core/cat-album/cat-album?id=${this.data.catId}`
    }
  }
})
