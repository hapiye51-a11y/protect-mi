const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    catId: '',
    cat: {
      name: '',
      age: '',
      breed: '',
      gender: 'unknown',
      color: '',
      weight: '',
      health: 'healthy',
      status: 'available',
      description: '',
      images: [],
      location: '',
      urgent: false
    },
    genderOptions: ['未知', '公猫', '母猫'],
    genderIndex: 0,
    healthOptions: ['健康', '良好', '一般', '较差', '生病中'],
    healthIndex: 0,
    statusOptions: ['待领养', '治疗中', '已领养', '已回喵星'],
    statusIndex: 0
  },

  onLoad(options) {
    // 检查登录状态
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.nickName) {
      wx.showModal({
        title: '请先登录',
        content: '添加猫咪档案需要登录，是否前往登录？',
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
    
    if (options.id) {
      this.setData({ catId: options.id })
      this.loadCatData(options.id)
    }
  },

  // 加载猫咪数据
  loadCatData(id) {
    wx.showLoading({ title: '加载中...', mask: true })

    db.collection('cats')
      .doc(id)
      .get({
        success: (res) => {
          wx.hideLoading()
          const cat = res.data
          
          // 权限检查：只有创建者才能编辑
          const userInfo = wx.getStorageSync('userInfo') || {}
          const isOwner = cat._openid === userInfo.openid || 
                          cat.reporter?.openid === userInfo.openid ||
                          (userInfo.nickName && cat.reporter?.nickName === userInfo.nickName)
          
          if (!isOwner) {
            wx.showModal({
              title: '无权限',
              content: '只有档案创建者才能编辑',
              showCancel: false,
              confirmText: '返回',
              success: () => {
                wx.navigateBack()
              }
            })
            return
          }
          
          // 设置选项索引
          const genderIndex = cat.gender === 'male' ? 1 : (cat.gender === 'female' ? 2 : 0)
          const healthIndex = this.getHealthIndex(cat.health)
          const statusIndex = this.getStatusIndex(cat.status)

          this.setData({
            cat,
            genderIndex,
            healthIndex,
            statusIndex
          })
        },
        fail: (err) => {
          wx.hideLoading()
          console.error('加载猫咪数据失败:', err)
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          })
        }
      })
  },

  // 获取健康状态索引
  getHealthIndex(health) {
    const map = {
      'healthy': 0,
      'good': 1,
      'normal': 2,
      'poor': 3,
      'sick': 4
    }
    return map[health] || 0
  },

  // 获取领养状态索引
  getStatusIndex(status) {
    const map = {
      'available': 0,
      'treatment': 1,
      'adopted': 2,
      'passed': 3
    }
    return map[status] || 0
  },

  // 输入框变化
  onInputChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`cat.${field}`]: value
    })
  },

  // 性别选择
  onGenderChange(e) {
    const index = e.detail.value
    const genderMap = ['unknown', 'male', 'female']
    this.setData({
      genderIndex: index,
      'cat.gender': genderMap[index]
    })
  },

  // 健康状态选择
  onHealthChange(e) {
    const index = e.detail.value
    const healthMap = ['healthy', 'good', 'normal', 'poor', 'sick']
    this.setData({
      healthIndex: index,
      'cat.health': healthMap[index]
    })
  },

  // 领养状态选择
  onStatusChange(e) {
    const index = e.detail.value
    const statusMap = ['available', 'treatment', 'adopted', 'passed']
    this.setData({
      statusIndex: index,
      'cat.status': statusMap[index]
    })
  },

  // 紧急状态切换
  onUrgentChange(e) {
    this.setData({
      'cat.urgent': e.detail.value
    })
  },

  // 选择图片
  onChooseImage() {
    const maxCount = 9 - this.data.cat.images.length
    if (maxCount <= 0) {
      wx.showToast({
        title: '最多上传9张图片',
        icon: 'none'
      })
      return
    }

    wx.chooseImage({
      count: maxCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const images = [...this.data.cat.images, ...res.tempFilePaths]
        this.setData({
          'cat.images': images
        })
      }
    })
  },

  // 删除图片
  onDeleteImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.cat.images.filter((_, i) => i !== index)
    this.setData({
      'cat.images': images
    })
  },

  // 选择位置
  onChooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          'cat.location': res.address
        })
      },
      fail: (err) => {
        console.error('选择位置失败:', err)
      }
    })
  },

  // 保存
  onSave() {
    const { cat, catId } = this.data

    // 验证必填项
    if (!cat.name) {
      wx.showToast({
        title: '请输入猫咪名字',
        icon: 'none'
      })
      return
    }
    
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.nickName) {
      wx.showModal({
        title: '请先登录',
        content: '添加猫咪档案需要登录',
        confirmText: '去登录',
        confirmColor: '#4CAF50',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/user/login/login' })
          }
        }
      })
      return
    }

    wx.showLoading({ title: '保存中...', mask: true })

    // 上传图片
    this.uploadImages().then((imageUrls) => {
      const catData = {
        ...cat,
        photos: imageUrls,  // 使用 photos 字段，与其他页面保持一致
        images: imageUrls,
        updateTime: db.serverDate()
      }
      
      // 设置发布者信息
      catData.reporter = {
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl || ''
      }

      // 更新数据库
      if (catId) {
        // 编辑模式
        db.collection('cats')
          .doc(catId)
          .update({
            data: catData,
            success: () => {
              wx.hideLoading()
              wx.showToast({
                title: '保存成功',
                icon: 'success'
              })
              setTimeout(() => {
                wx.navigateBack()
              }, 1500)
            },
            fail: (err) => {
              wx.hideLoading()
              console.error('保存失败:', err)
              wx.showToast({
                title: '保存失败: ' + (err.errMsg || '未知错误'),
                icon: 'none'
              })
            }
          })
      } else {
        // 新增模式
        catData.createTime = db.serverDate()
        catData.status = 'pending' // 待审核状态
        catData.reviewed = false // 未审核

        db.collection('cats')
          .add({
            data: catData,
            success: () => {
              wx.hideLoading()
              wx.showModal({
                title: '✅ 提交成功',
                content: '猫咪档案已提交，审核通过后将会公开展示。感谢你的贡献！',
                showCancel: false,
                confirmText: '知道了',
                confirmColor: '#4CAF50',
                success: () => {
                  wx.navigateBack()
                }
              })
            },
            fail: (err) => {
              wx.hideLoading()
              console.error('添加失败:', err)
              wx.showToast({
                title: '添加失败: ' + (err.errMsg || '未知错误'),
                icon: 'none',
                duration: 3000
              })
            }
          })
      }
    })
  },

  // 上传图片
  uploadImages() {
    return new Promise((resolve) => {
      const images = this.data.cat.images
      if (images.length === 0) {
        resolve([])
        return
      }

      // 如果已经是网络图片，直接返回
      if (images[0].startsWith('http')) {
        resolve(images)
        return
      }

      // 上传本地图片
      const uploadTasks = images.map((image, index) => {
        return new Promise((resolveUpload) => {
          const cloudPath = `cats/${Date.now()}_${index}_${Math.random().toString(36).substr(2)}.jpg`
          wx.cloud.uploadFile({
            cloudPath,
            filePath: image,
            success: (res) => {
              resolveUpload(res.fileID)
            },
            fail: () => {
              resolveUpload(image) // 失败时返回原路径
            }
          })
        })
      })

      Promise.all(uploadTasks).then((urls) => {
        resolve(urls)
      })
    })
  }
})
