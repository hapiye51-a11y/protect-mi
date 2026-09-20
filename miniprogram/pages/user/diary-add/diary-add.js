const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    catId: '',
    form: {
      title: '',
      content: '',
      images: [],
      tags: [],
      mood: 'happy'
    },
    tagOptions: [
      { name: '日常', emoji: '☀️', selected: false },
      { name: '玩耍', emoji: '🎾', selected: false },
      { name: '吃饭', emoji: '🍖', selected: false },
      { name: '睡觉', emoji: '😴', selected: false },
      { name: '生病', emoji: '🤒', selected: false },
      { name: '康复', emoji: '💪', selected: false },
      { name: '领养', emoji: '🏠', selected: false },
      { name: '其他', emoji: '📝', selected: false }
    ],
    moodOptions: [
      { name: '开心', emoji: '😊', value: 'happy' },
      { name: '感动', emoji: '🥹', value: 'touched' },
      { name: '担心', emoji: '😟', value: 'worried' },
      { name: '生气', emoji: '😤', value: 'angry' }
    ],
    publishing: false
  },

  onLoad(options) {
    this.setData({ catId: options.catId })
    this.checkPermission()
  },

  // 检查权限
  checkPermission() {
    db.collection('cats').doc(this.data.catId).get({
      success: (res) => {
        const cat = res.data
        const userInfo = wx.getStorageSync('userInfo') || {}
        const isOwner = cat._openid === userInfo.openid || 
                        cat.reporter?.openid === userInfo.openid ||
                        (userInfo.nickName && cat.reporter?.nickName === userInfo.nickName)
        
        if (!isOwner) {
          wx.showModal({
            title: '无权限',
            content: '只有档案创建者才能添加成长记录',
            showCancel: false,
            confirmText: '返回',
            success: () => {
              wx.navigateBack()
            }
          })
        }
      },
      fail: () => {
        wx.showToast({ title: '加载失败', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 1500)
      }
    })
  },

  // 标题输入
  onTitleInput(e) {
    this.setData({ 'form.title': e.detail.value })
  },

  // 内容输入
  onContentInput(e) {
    this.setData({ 'form.content': e.detail.value })
  },

  // 选择图片
  onChooseImage() {
    const count = 9 - this.data.form.images.length
    wx.chooseMedia({
      count: count,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = res.tempFiles.map(f => f.tempFilePath)
        this.setData({
          'form.images': [...this.data.form.images, ...newImages]
        })
      }
    })
  },

  // 删除图片
  onDeleteImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.form.images
    images.splice(index, 1)
    this.setData({ 'form.images': images })
  },

  // 切换标签
  toggleTag(e) {
    const index = e.currentTarget.dataset.index
    const tagOptions = this.data.tagOptions
    tagOptions[index].selected = !tagOptions[index].selected
    this.setData({ tagOptions })
  },

  // 选择心情
  selectMood(e) {
    const mood = e.currentTarget.dataset.mood
    this.setData({ 'form.mood': mood })
  },

  // 发布
  async onPublish() {
    if (!this.data.form.content.trim()) {
      wx.showToast({ title: '请输入日志内容', icon: 'none' })
      return
    }

    this.setData({ publishing: true })

    try {
      // 上传图片
      const imageUrls = []
      for (const tempPath of this.data.form.images) {
        const cloudPath = `diary/${this.data.catId}/${Date.now()}_${Math.random().toString(36).substr(2)}.jpg`
        const uploadRes = await wx.cloud.uploadFile({
          cloudPath: cloudPath,
          filePath: tempPath
        })
        imageUrls.push(uploadRes.fileID)
      }

      // 收集选中的标签
      const selectedTags = this.data.tagOptions
        .filter(t => t.selected)
        .map(t => t.name)

      // 构建日志数据
      const diaryData = {
        catId: this.data.catId,
        title: this.data.form.title || '成长日记',
        content: this.data.form.content,
        images: imageUrls,
        tags: selectedTags,
        mood: this.data.form.mood,
        views: 0,
        likes: 0,
        createTime: db.serverDate()
      }

      // 保存到数据库
      await db.collection('cat_diary').add({ data: diaryData })

      wx.showToast({ title: '发布成功', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (err) {
      console.error('发布失败:', err)
      wx.showToast({ title: '发布失败', icon: 'none' })
    } finally {
      this.setData({ publishing: false })
    }
  }
})
