const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    editId: '', // 编辑模式时的记录ID
    // 照片列表
    photos: [],
    photoCloudIDs: [],

    // 风险等级：high, medium, low
    riskLevel: '',

    // 风险类型
    riskType: '',
    riskTypes: [
      { value: 'abuse', label: '虐待行为', icon: '🚫' },
      { value: 'trap', label: '捕猫陷阱', icon: '🪤' },
      { value: 'poison', label: '投毒危险', icon: '☠️' },
      { value: 'traffic', label: '交通危险', icon: '🚗' },
      { value: 'environment', label: '危险环境', icon: '⚠️' },
      { value: 'other', label: '其他风险', icon: '❓' }
    ],

    // 位置信息
    latitude: null,
    longitude: null,
    address: '',

    // 描述和联系方式
    description: '',
    contact: '',

    // 是否可以提交
    canSubmit: false
  },

  onLoad(options) {
    console.log('风险上报页面加载')
    
    // 编辑模式：加载已有数据
    if (options.id) {
      this.setData({ editId: options.id })
      wx.setNavigationBarTitle({ title: '编辑风险上报' })
      this.loadRiskData(options.id)
    } else {
      // 新增模式
      // 如果从地图页面传入了位置信息
      if (options.latitude && options.longitude) {
        this.setData({
          latitude: parseFloat(options.latitude),
          longitude: parseFloat(options.longitude)
        })
        this.getAddressFromLocation()
      } else {
        // 自动获取当前位置
        this.getCurrentLocation()
      }
    }
  },

  // 加载风险数据（编辑模式）
  loadRiskData(id) {
    wx.showLoading({ title: '加载中...', mask: true })
    
    db.collection('risks')
      .doc(id)
      .get({
        success: (res) => {
          wx.hideLoading()
          const data = res.data
          
          this.setData({
            photos: data.photos || [],
            photoCloudIDs: data.photos || [],
            riskLevel: data.riskLevel || '',
            riskType: data.riskType || '',
            latitude: data.location?.latitude || null,
            longitude: data.location?.longitude || null,
            address: data.location?.address || '',
            description: data.description || '',
            contact: data.contact || ''
          })
          
          this.checkCanSubmit()
        },
        fail: (err) => {
          wx.hideLoading()
          console.error('加载风险数据失败:', err)
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          })
        }
      })
  },

  // 获取当前位置
  getCurrentLocation() {
    wx.showLoading({
      title: '获取位置中...',
      mask: true
    })

    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude
        })
        this.getAddressFromLocation()
        wx.hideLoading()
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('获取位置失败:', err)
        wx.showModal({
          title: '无法获取位置',
          content: '请在手机设置中允许小程序访问位置信息',
          confirmText: '去设置',
          confirmColor: '#FF9800',
          success: (res) => {
            if (res.confirm) {
              wx.openSetting()
            }
          }
        })
      }
    })
  },

  // 根据经纬度获取地址
  getAddressFromLocation() {
    if (!this.data.latitude || !this.data.longitude) return

    // 使用微信的逆地理编码API
    wx.showLoading({ title: '获取地址中...', mask: true })

    // 调用云函数获取地址（更可靠的方式）
    // 这里先使用模拟数据，实际应该调用地图服务API
    const mockAddresses = [
      '北京市朝阳区XX路XX号',
      '上海市浦东新区XX街道',
      '广州市天河区XX小区附近',
      '深圳市南山区XX公园旁'
    ]
    const randomAddress = mockAddresses[Math.floor(Math.random() * mockAddresses.length)]

    this.setData({
      address: randomAddress
    })

    wx.hideLoading()
  },

  // 选择位置
  selectLocation() {
    wx.chooseLocation({
      latitude: this.data.latitude || 39.90923,
      longitude: this.data.longitude || 116.397428,
      success: (res) => {
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          address: res.address + res.name
        })
        this.checkCanSubmit()
      },
      fail: (err) => {
        console.error('选择位置失败:', err)
      }
    })
  },

  // 选择照片
  choosePhoto() {
    const remainCount = 3 - this.data.photos.length

    wx.showActionSheet({
      itemList: ['拍照', '从相册选择'],
      success: (res) => {
        const sourceType = res.tapIndex === 0 ? ['camera'] : ['album']

        wx.chooseImage({
          count: remainCount,
          sizeType: ['compressed'],
          sourceType: sourceType,
          success: (res) => {
            const newPhotos = [...this.data.photos, ...res.tempFilePaths]
            this.setData({
              photos: newPhotos
            })
            this.checkCanSubmit()

            wx.showToast({
              title: '照片已添加',
              icon: 'success',
              duration: 1500
            })
          }
        })
      }
    })
  },

  // 预览照片
  previewPhoto(e) {
    const index = e.currentTarget.dataset.index
    wx.previewImage({
      current: this.data.photos[index],
      urls: this.data.photos
    })
  },

  // 删除照片
  deletePhoto(e) {
    const index = e.currentTarget.dataset.index
    const photos = this.data.photos.filter((item, i) => i !== index)
    this.setData({ photos })
    this.checkCanSubmit()

    wx.showToast({
      title: '已删除',
      icon: 'success',
      duration: 1000
    })
  },

  // 选择风险等级
  selectRiskLevel(e) {
    const level = e.currentTarget.dataset.level
    this.setData({ riskLevel: level })
    this.checkCanSubmit()
  },

  // 选择风险类型
  selectRiskType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ riskType: type })
    this.checkCanSubmit()
  },

  // 输入描述
  onDescriptionInput(e) {
    this.setData({
      description: e.detail.value
    })
    this.checkCanSubmit()
  },

  // 输入联系方式
  onContactInput(e) {
    this.setData({
      contact: e.detail.value
    })
  },

  // 检查是否可以提交
  checkCanSubmit() {
    const { photos, riskLevel, riskType, latitude, longitude, description } = this.data

    const canSubmit = photos.length > 0 &&
                     riskLevel !== '' &&
                     riskType !== '' &&
                     latitude !== null &&
                     longitude !== null &&
                     description.trim().length >= 10

    this.setData({ canSubmit })
  },

  // 提交上报
  onSubmit() {
    if (!this.data.canSubmit) {
      return
    }

    wx.showLoading({
      title: '提交中...',
      mask: true
    })

    // 先上传照片到云存储
    this.uploadPhotos()
      .then((cloudIDs) => {
        // 上传成功后保存数据到数据库
        this.saveToCloudDatabase(cloudIDs)
      })
      .catch((err) => {
        console.error('提交失败:', err)
        wx.hideLoading()
        wx.showToast({
          title: '提交失败，请重试',
          icon: 'none'
        })
      })
  },

  // 上传照片到云存储
  uploadPhotos() {
    if (this.data.photos.length === 0) {
      return Promise.resolve([])
    }

    const uploadTasks = this.data.photos.map((photo, index) => {
      return new Promise((resolve, reject) => {
        // 如果已经是云存储地址，直接返回
        if (photo.startsWith('cloud://')) {
          resolve(photo)
          return
        }
        
        // 上传本地照片
        const cloudPath = `risk-photos/${Date.now()}-${index}.jpg`
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
    const reportData = {
      // 风险信息
      photos: cloudIDs,
      riskLevel: this.data.riskLevel,
      riskType: this.data.riskType,
      riskTypeText: this.getRiskTypeText(this.data.riskType),
      description: this.data.description,

      // 位置信息
      location: {
        latitude: this.data.latitude,
        longitude: this.data.longitude,
        address: this.data.address
      },

      // 联系方式
      contact: this.data.contact,

      // 更新时间
      updateTime: db.serverDate()
    }

    // 编辑模式：更新已有记录
    if (this.data.editId) {
      db.collection('risks')
        .doc(this.data.editId)
        .update({
          data: reportData,
          success: (res) => {
            console.log('风险上报更新成功:', res)
            wx.hideLoading()

            wx.showModal({
              title: '✅ 保存成功',
              content: '风险上报已更新',
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
    reportData.reporter = {
      openid: '',
      nickName: userInfo.nickName || '匿名用户',
      avatarUrl: userInfo.avatarUrl || ''
    }
    reportData.status = 'pending'
    reportData.createTime = db.serverDate()
    reportData.viewCount = 0
    reportData.commentCount = 0

    // 添加到 risks 集合
    db.collection('risks').add({
      data: reportData,
      success: (res) => {
        console.log('风险上报成功:', res)
        wx.hideLoading()

        wx.showModal({
          title: '✅ 提交成功',
          content: '感谢您的反馈！您的上报已保存，现在可以在地图上查看。',
          showCancel: false,
          confirmText: '查看地图',
          confirmColor: '#FF9800',
          success: (res) => {
            if (res.confirm) {
              // 检查页面栈中是否已有地图页面
              const pages = getCurrentPages()
              let hasMapPage = false
              let mapPageIndex = -1

              for (let i = 0; i < pages.length - 1; i++) {
                if (pages[i].route === 'pages/core/map/map') {
                  hasMapPage = true
                  mapPageIndex = i
                  break
                }
              }

              if (hasMapPage) {
                // 返回到地图页面
                const delta = pages.length - 1 - mapPageIndex
                wx.navigateBack({
                  delta: delta
                })
              } else {
                // 重定向到地图页面（替换当前页面）
                wx.redirectTo({
                  url: '/pages/core/map/map'
                })
              }
            }
          }
        })
      },
      fail: (err) => {
        console.error('保存到数据库失败:', err)
        wx.hideLoading()
        wx.showToast({
          title: '提交失败，请重试',
          icon: 'none'
        })
      }
    })
  },

  // 获取风险类型文本
  getRiskTypeText(type) {
    const typeObj = this.data.riskTypes.find(t => t.value === type)
    return typeObj ? typeObj.label : '其他风险'
  },

  goBack() {
    wx.navigateBack()
  }
})
