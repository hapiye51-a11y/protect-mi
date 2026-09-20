const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    editId: '', // 编辑模式时的记录ID
    photos: [],
    photoCloudIDs: [], // 云存储的fileID列表
    rescueType: '',
    urgency: 'medium',
    description: '',
    location: null,
    contact: '',
    anonymous: false,
    loading: false,
    uploadingProgress: 0, // 上传进度

    // 救助类型选项
    typeOptions: [
      { value: 'stray', label: '流浪猫', icon: '🐈' },
      { value: 'injured', label: '受伤猫', icon: '🩹' },
      { value: 'sick', label: '生病猫', icon: '😿' },
      { value: 'kitten', label: '奶猫', icon: '👶' },
      { value: 'adopt', label: '待领养', icon: '🏡' },
      { value: 'lost', label: '走失猫', icon: '🔍' }
    ],

    // 紧急程度选项
    urgencyOptions: [
      { value: 'low', label: '一般' },
      { value: 'medium', label: '紧急' },
      { value: 'high', label: '极紧急' }
    ]
  },

  onLoad(options) {
    console.log('发布救助页面加载')
    
    // 检查登录状态
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.nickName) {
      wx.showModal({
        title: '请先登录',
        content: '发布救助信息需要登录，是否前往登录？',
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
      wx.setNavigationBarTitle({ title: '编辑救助信息' })
      this.loadRescueData(options.id)
    } else {
      // 新增模式
      // 如果从地图页面跳转，可能带有位置信息
      if (options.lat && options.lng) {
        this.setData({
          location: {
            latitude: parseFloat(options.lat),
            longitude: parseFloat(options.lng),
            name: options.name || '当前位置',
            address: options.address || ''
          }
        })
      }
    }
  },

  // 加载救助数据（编辑模式）
  loadRescueData(id) {
    wx.showLoading({ title: '加载中...', mask: true })
    
    db.collection('rescues')
      .doc(id)
      .get({
        success: (res) => {
          wx.hideLoading()
          const data = res.data
          
          this.setData({
            photos: data.photos || [],
            photoCloudIDs: data.photos || [],
            rescueType: data.rescueType || '',
            urgency: data.urgency || 'medium',
            description: data.description || '',
            location: data.location || null,
            contact: data.contact || '',
            anonymous: data.anonymous || false
          })
        },
        fail: (err) => {
          wx.hideLoading()
          console.error('加载救助数据失败:', err)
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          })
        }
      })
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
        this.setData({
          photos: newPhotos
        })
        wx.showToast({
          title: `已添加${res.tempFilePaths.length}张照片`,
          icon: 'success'
        })
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
          this.setData({
            photos: photos
          })
        }
      }
    })
  },

  // 选择救助类型
  selectType(e) {
    const value = e.currentTarget.dataset.value
    this.setData({
      rescueType: value
    })
  },

  // 选择紧急程度
  selectUrgency(e) {
    const value = e.currentTarget.dataset.value
    this.setData({
      urgency: value
    })
  },

  // 描述输入
  onDescriptionInput(e) {
    this.setData({
      description: e.detail.value
    })
  },

  // 选择位置
  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          location: {
            latitude: res.latitude,
            longitude: res.longitude,
            name: res.name,
            address: res.address
          }
        })
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

  // 联系方式输入
  onContactInput(e) {
    this.setData({
      contact: e.detail.value
    })
  },

  // 匿名选择
  onAnonymousChange(e) {
    this.setData({
      anonymous: e.detail.value.includes('anonymous')
    })
  },

  // 提交救助信息
  submitRescue() {
    // 验证必填项
    if (this.data.photos.length === 0) {
      wx.showToast({
        title: '请上传猫咪照片',
        icon: 'none'
      })
      return
    }

    if (!this.data.rescueType) {
      wx.showToast({
        title: '请选择救助类型',
        icon: 'none'
      })
      return
    }

    if (!this.data.description.trim()) {
      wx.showToast({
        title: '请填写详细描述',
        icon: 'none'
      })
      return
    }

    if (!this.data.location) {
      wx.showToast({
        title: '请选择位置信息',
        icon: 'none'
      })
      return
    }

    // 显示确认弹窗
    wx.showModal({
      title: '确认发布',
      content: '发布的信息将公开展示，请确保内容真实有效',
      confirmText: '确认发布',
      confirmColor: '#FF9800',
      success: (res) => {
        if (res.confirm) {
          this.doSubmit()
        }
      }
    })
  },

  // 执行提交
  doSubmit() {
    this.setData({
      loading: true,
      uploadingProgress: 0
    })

    wx.showLoading({
      title: this.data.editId ? '保存中...' : '上传中...',
      mask: true
    })

    // 检查是否有新照片需要上传
    const hasNewPhotos = this.data.photos.some(p => !p.startsWith('cloud://'))
    
    if (hasNewPhotos) {
      // 上传新照片到云存储
      this.uploadAllPhotos()
        .then((cloudIDs) => {
          this.saveToCloudDatabase(cloudIDs)
        })
        .catch((err) => {
          console.error('上传失败:', err)
          this.setData({ loading: false })
          wx.hideLoading()
          wx.showToast({
            title: '上传失败，请重试',
            icon: 'none'
          })
        })
    } else {
      // 没有新照片，直接保存
      this.saveToCloudDatabase(this.data.photos)
    }
  },

  // 上传所有照片到云存储
  uploadAllPhotos() {
    const photos = this.data.photos
    const uploadTasks = photos.map((photo, index) => {
      return new Promise((resolve, reject) => {
        // 如果已经是云存储地址，直接返回
        if (photo.startsWith('cloud://')) {
          resolve(photo)
          return
        }
        
        // 上传本地照片
        const cloudPath = `rescue-photos/${Date.now()}-${index}.jpg`
        wx.cloud.uploadFile({
          cloudPath: cloudPath,
          filePath: photo,
          success: (res) => {
            console.log('照片上传成功:', res.fileID)
            resolve(res.fileID)
          },
          fail: (err) => {
            console.error('照片上传失败:', err)
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
    const postData = {
      // 救助信息
      photos: cloudIDs,
      rescueType: this.data.rescueType,
      rescueTypeText: this.getTypeText(this.data.rescueType),
      urgency: this.data.urgency,
      urgencyText: this.getUrgencyText(this.data.urgency),
      description: this.data.description,

      // 位置信息
      location: {
        latitude: this.data.location.latitude,
        longitude: this.data.location.longitude,
        name: this.data.location.name,
        address: this.data.location.address
      },

      // 联系方式
      contact: this.data.contact,
      anonymous: this.data.anonymous,

      // 用户信息
      reporter: {
        openid: '', // 将在云函数中获取
        nickName: this.data.anonymous ? '匿名用户' : (userInfo.nickName || '守护咪用户'),
        avatarUrl: this.data.anonymous ? '' : (userInfo.avatarUrl || '')
      },

      // 更新时间
      updateTime: db.serverDate()
    }

    // 编辑模式：更新已有记录
    if (this.data.editId) {
      db.collection('rescues')
        .doc(this.data.editId)
        .update({
          data: postData,
          success: (res) => {
            console.log('救助信息更新成功:', res)
            this.setData({ loading: false })
            wx.hideLoading()

            wx.showModal({
              title: '✅ 保存成功',
              content: '救助信息已更新',
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
            this.setData({ loading: false })
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
    postData.status = 'pending'
    postData.createTime = db.serverDate()
    postData.viewCount = 0
    postData.likeCount = 0
    postData.commentCount = 0

    // 添加到 rescues 集合
    db.collection('rescues').add({
      data: postData,
      success: (res) => {
        console.log('救助信息保存成功:', res)
        this.setData({ loading: false })
        wx.hideLoading()

        wx.showModal({
          title: '✅ 发布成功',
          content: '感谢你的爱心！你的救助信息已成功发布，可以在"我的发布"中查看。',
          showCancel: false,
          confirmText: '查看我的发布',
          confirmColor: '#FF9800',
          success: (res) => {
            if (res.confirm) {
              // 跳转到我的发布页面
              wx.navigateTo({
                url: '/pages/user/my-posts/my-posts'
              })
            } else {
              // 返回首页
              wx.switchTab({
                url: '/pages/core/index/index'
              })
            }
          }
        })
      },
      fail: (err) => {
        console.error('保存到数据库失败:', err)
        this.setData({ loading: false })
        wx.hideLoading()
        wx.showToast({
          title: '发布失败，请重试',
          icon: 'none'
        })
      }
    })
  },

  // 获取类型文本
  getTypeText(type) {
    const typeObj = this.data.typeOptions.find(t => t.value === type)
    return typeObj ? typeObj.label : '救助信息'
  },

  // 获取紧急程度文本
  getUrgencyText(urgency) {
    const urgencyObj = this.data.urgencyOptions.find(u => u.value === urgency)
    return urgencyObj ? urgencyObj.label : '紧急'
  },

  onShareAppMessage() {
    return {
      title: '守护咪 - 发布救助信息',
      path: '/pages/core/publish/publish',
      imageUrl: ''
    }
  },


})
