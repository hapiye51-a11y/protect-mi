const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    editId: '', // 编辑模式时的记录ID
    content: '',
    images: [],
    imageCloudIDs: [],
    location: '',
    tags: ['今日吸猫', '救助日记', '喂养记录', '云养猫', '猫咪日常', '求助'],
    selectedTags: [],
    anonymous: false,
    allowComment: true,
    canPublish: false
  },

  onLoad(options) {
    console.log('发布动态页面加载')
    
    // 检查登录状态
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.nickName) {
      wx.showModal({
        title: '请先登录',
        content: '发布动态需要登录，是否前往登录？',
        confirmText: '去登录',
        confirmColor: '#4CAF50',
        success: (res) => {
          if (res.confirm) {
            wx.redirectTo({ url: '/pages/user/login/login' })
          } else {
            wx.navigateBack()
          }
        }
      })
      return
    }
    
    // 编辑模式：加载已有数据
    if (options.id) {
      this.setData({ editId: options.id })
      wx.setNavigationBarTitle({ title: '编辑动态' })
      this.loadMomentData(options.id)
    }
  },

  // 加载动态数据（编辑模式）
  loadMomentData(id) {
    wx.showLoading({ title: '加载中...', mask: true })
    
    db.collection('moments')
      .doc(id)
      .get({
        success: (res) => {
          wx.hideLoading()
          const data = res.data
          
          this.setData({
            content: data.content || '',
            images: data.images || [],
            imageCloudIDs: data.images || [],
            location: data.location || '',
            selectedTags: data.tags || [],
            anonymous: data.anonymous || false,
            allowComment: data.allowComment !== false
          })
          
          this.checkCanPublish()
        },
        fail: (err) => {
          wx.hideLoading()
          console.error('加载动态数据失败:', err)
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          })
        }
      })
  },

  // 内容输入
  onContentInput(e) {
    const content = e.detail.value
    this.setData({ content })
    this.checkCanPublish()
  },

  // 选择图片
  chooseImage() {
    const maxCount = 9 - this.data.images.length
    wx.chooseMedia({
      count: maxCount,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: (res) => {
        const newImages = res.tempFiles.map(file => file.tempFilePath)
        this.setData({
          images: [...this.data.images, ...newImages]
        })
        this.checkCanPublish()
        wx.showToast({
          title: `已添加${newImages.length}张图片`,
          icon: 'success',
          duration: 1500
        })
      }
    })
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.images.filter((_, i) => i !== index)
    this.setData({ images })
    this.checkCanPublish()
    wx.showToast({
      title: '已删除',
      icon: 'success',
      duration: 1000
    })
  },

  // 选择位置
  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          location: res.name || res.address
        })
        wx.showToast({
          title: '位置已添加',
          icon: 'success',
          duration: 1500
        })
      },
      fail: (err) => {
        if (err.errMsg.includes('auth deny')) {
          wx.showModal({
            title: '需要授权',
            content: '请允许访问您的位置信息',
            confirmText: '去设置',
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

  // 切换话题标签
  toggleTag(e) {
    const tag = e.currentTarget.dataset.tag
    let selectedTags = [...this.data.selectedTags]

    if (selectedTags.includes(tag)) {
      selectedTags = selectedTags.filter(t => t !== tag)
    } else {
      if (selectedTags.length >= 3) {
        wx.showToast({
          title: '最多选择3个话题',
          icon: 'none',
          duration: 2000
        })
        return
      }
      selectedTags.push(tag)
    }

    this.setData({ selectedTags })
  },

  // 匿名开关
  onAnonymousChange(e) {
    this.setData({
      anonymous: e.detail.value
    })
  },

  // 允许评论开关
  onAllowCommentChange(e) {
    this.setData({
      allowComment: e.detail.value
    })
  },

  // 检查是否可以发布
  checkCanPublish() {
    const canPublish = this.data.content.trim().length > 0 || this.data.images.length > 0
    this.setData({ canPublish })
  },

  // 取消发布
  onCancel() {
    if (this.data.content || this.data.images.length > 0) {
      wx.showModal({
        title: '确认退出',
        content: '退出后内容将不会保存，确定要退出吗？',
        confirmText: '确定退出',
        confirmColor: '#EF4444',
        cancelText: '继续编辑',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack()
          }
        }
      })
    } else {
      wx.navigateBack()
    }
  },

  // 发布动态
  onPublish() {
    if (!this.data.canPublish) {
      wx.showToast({
        title: '请输入内容或添加图片',
        icon: 'none',
        duration: 2000
      })
      return
    }

    // 验证内容
    if (this.data.content.length > 500) {
      wx.showToast({
        title: '内容不能超过500字',
        icon: 'none',
        duration: 2000
      })
      return
    }

    wx.showLoading({
      title: '发布中...',
      mask: true
    })

    // 先上传图片
    this.uploadImages()
      .then((cloudIDs) => {
        // 上传成功后保存到数据库
        this.saveToCloudDatabase(cloudIDs)
      })
      .catch((err) => {
        console.error('发布失败:', err)
        wx.hideLoading()
        wx.showToast({
          title: '发布失败，请重试',
          icon: 'none'
        })
      })
  },

  // 上传所有图片到云存储
  uploadImages() {
    if (this.data.images.length === 0) {
      return Promise.resolve([])
    }

    const uploadTasks = this.data.images.map((image, index) => {
      return new Promise((resolve, reject) => {
        // 如果已经是云存储地址，直接返回
        if (image.startsWith('cloud://')) {
          resolve(image)
          return
        }
        
        // 上传本地图片
        const cloudPath = `moments/${Date.now()}-${index}.jpg`
        wx.cloud.uploadFile({
          cloudPath: cloudPath,
          filePath: image,
          success: (res) => {
            console.log('图片上传成功:', res.fileID)
            resolve(res.fileID)
          },
          fail: (err) => {
            console.error('图片上传失败:', err)
            reject(err)
          }
        })
      })
    })

    return Promise.all(uploadTasks)
  },

  // 保存数据到云数据库
  saveToCloudDatabase(cloudIDs) {
    const userInfo = wx.getStorageSync('userInfo') || {}
    const momentData = {
      // 内容信息
      content: this.data.content,
      images: cloudIDs,
      location: this.data.location,
      tags: this.data.selectedTags,
      anonymous: this.data.anonymous,
      allowComment: this.data.allowComment,

      // 更新时间
      updateTime: db.serverDate()
    }

    // 编辑模式：更新已有记录
    if (this.data.editId) {
      db.collection('moments')
        .doc(this.data.editId)
        .update({
          data: momentData,
          success: (res) => {
            console.log('动态更新成功:', res)
            wx.hideLoading()

            wx.showModal({
              title: '✅ 保存成功',
              content: '动态已更新',
              showCancel: false,
              confirmText: '返回',
              confirmColor: '#FF9800',
              success: () => {
                wx.navigateBack()
              }
            })
          },
          fail: (err) => {
            console.error('更新失败:', err)
            wx.hideLoading()
            wx.showToast({
              title: '保存失败，请重试',
              icon: 'none'
            })
          }
        })
      return
    }

    // 新增模式：添加新记录
    momentData.author = {
      openid: '',
      nickName: this.data.anonymous ? '匿名用户' : (userInfo.nickName || '守护咪用户'),
      avatarUrl: this.data.anonymous ? '' : (userInfo.avatarUrl || '')
    }
    momentData.likes = 0
    momentData.comments = 0
    momentData.shares = 0
    momentData.views = 0
    momentData.createTime = db.serverDate()
    momentData.isDeleted = false

    // 添加到 moments 集合
    db.collection('moments').add({
      data: momentData,
      success: (res) => {
        console.log('动态发布成功:', res)
        wx.hideLoading()

        wx.showToast({
          title: '✅ 发布成功',
          icon: 'success',
          duration: 2000
        })

        // 延迟返回
        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/features/community/community'
          })
        }, 500)
      },
      fail: (err) => {
        console.error('保存到数据库失败:', err)
        wx.hideLoading()
        wx.showToast({
          title: '发布失败，请重试',
          icon: 'none'
        })
      }
    })
  }
})
