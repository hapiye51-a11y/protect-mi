const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    step: 1,
    
    // 步骤1：猫咪信息
    photos: [],
    catName: '',
    gender: '',
    ageIndex: 0,
    ageOptions: [
      { value: 'unknown', label: '未知' },
      { value: 'kitten', label: '幼猫（<6月）' },
      { value: 'young', label: '青年（6月-2岁）' },
      { value: 'adult', label: '成年（2-7岁）' },
      { value: 'senior', label: '老年（>7岁）' }
    ],
    location: null,
    notes: '',

    // 步骤2：手术信息
    hospitals: [
      { id: 1, name: '请选择医院' },
      { id: 2, name: '宠爱动物医院' },
      { id: 3, name: '瑞鹏宠物医院' },
      { id: 4, name: '瑞派宠物医院' },
      { id: 5, name: '其他医院' }
    ],
    hospitalIndex: 0,
    surgeryDate: '',
    surgeryType: 'neuter',
    earmark: 'left',
    vaccine: '',
    cost: '',

    // 步骤3：放归信息
    releaseStatus: 'pending',
    releaseDate: '',
    releaseLocation: null,
    followUp: '',

    // 其他
    today: '',
    canNext: false,
    loading: false
  },

  onLoad() {
    // 检查登录状态
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.nickName) {
      wx.showModal({
        title: '请先登录',
        content: '记录TNR需要登录，是否前往登录？',
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
    
    this.setData({
      today: this.formatDate(new Date())
    })
  },

  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  // ========== 步骤1 ==========

  choosePhoto() {
    const remainCount = 3 - this.data.photos.length
    wx.chooseImage({
      count: remainCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          photos: [...this.data.photos, ...res.tempFilePaths]
        })
        this.checkCanNext()
      }
    })
  },

  previewPhoto(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.url,
      urls: this.data.photos
    })
  },

  deletePhoto(e) {
    const index = e.currentTarget.dataset.index
    const photos = [...this.data.photos]
    photos.splice(index, 1)
    this.setData({ photos })
    this.checkCanNext()
  },

  onCatNameInput(e) {
    this.setData({ catName: e.detail.value })
    this.checkCanNext()
  },

  selectGender(e) {
    this.setData({ gender: e.currentTarget.dataset.gender })
    this.checkCanNext()
  },

  onAgeChange(e) {
    this.setData({ ageIndex: parseInt(e.detail.value) })
  },

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
        this.checkCanNext()
      }
    })
  },

  onNotesInput(e) {
    this.setData({ notes: e.detail.value })
  },

  // ========== 步骤2 ==========

  onHospitalChange(e) {
    this.setData({ hospitalIndex: parseInt(e.detail.value) })
    this.checkCanNext()
  },

  onSurgeryDateChange(e) {
    this.setData({ surgeryDate: e.detail.value })
    this.checkCanNext()
  },

  selectSurgeryType(e) {
    this.setData({ surgeryType: e.currentTarget.dataset.type })
  },

  selectEarmark(e) {
    this.setData({ earmark: e.currentTarget.dataset.earmark })
  },

  toggleVaccine(e) {
    const vaccine = e.currentTarget.dataset.vaccine
    this.setData({
      vaccine: this.data.vaccine === vaccine ? '' : vaccine
    })
  },

  onCostInput(e) {
    this.setData({ cost: e.detail.value })
  },

  // ========== 步骤3 ==========

  selectReleaseStatus(e) {
    this.setData({ releaseStatus: e.currentTarget.dataset.status })
    this.checkCanNext()
  },

  onReleaseDateChange(e) {
    this.setData({ releaseDate: e.detail.value })
    this.checkCanNext()
  },

  chooseReleaseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          releaseLocation: {
            latitude: res.latitude,
            longitude: res.longitude,
            name: res.name || '选中位置',
            address: res.address || ''
          }
        })
        this.checkCanNext()
      }
    })
  },

  onFollowUpInput(e) {
    this.setData({ followUp: e.detail.value })
  },

  // ========== 导航 ==========

  checkCanNext() {
    let canNext = false

    if (this.data.step === 1) {
      canNext = this.data.catName.trim() && 
                this.data.gender && 
                this.data.location
    } else if (this.data.step === 2) {
      canNext = this.data.hospitalIndex > 0 && 
                this.data.surgeryDate
    } else if (this.data.step === 3) {
      if (this.data.releaseStatus === 'done') {
        canNext = this.data.releaseDate && this.data.releaseLocation
      } else {
        canNext = true
      }
    }

    this.setData({ canNext })
  },

  prevStep() {
    if (this.data.step > 1) {
      this.setData({ step: this.data.step - 1 })
      this.checkCanNext()
    }
  },

  nextStep() {
    if (!this.data.canNext) return

    if (this.data.step < 3) {
      this.setData({ step: this.data.step + 1 })
      this.checkCanNext()
    } else {
      this.submit()
    }
  },

  // ========== 提交 ==========

  async submit() {
    this.setData({ loading: true })
    wx.showLoading({ title: '提交中...', mask: true })

    try {
      // 上传照片
      const cloudIDs = await this.uploadPhotos()
      
      // 保存数据
      await this.saveToDatabase(cloudIDs)

      wx.hideLoading()
      wx.showModal({
        title: '✅ 记录成功',
        content: 'TNR记录已保存，感谢您的付出！',
        showCancel: false,
        confirmText: '返回',
        confirmColor: '#4CAF50',
        success: () => {
          wx.navigateBack()
        }
      })
    } catch (err) {
      console.error('提交失败:', err)
      wx.hideLoading()
      this.setData({ loading: false })
      wx.showToast({
        title: '提交失败，请重试',
        icon: 'none'
      })
    }
  },

  uploadPhotos() {
    const { photos } = this.data
    if (photos.length === 0) return Promise.resolve([])

    const uploadTasks = photos.map((photo, index) => {
      return new Promise((resolve, reject) => {
        const cloudPath = `tnr-photos/${Date.now()}-${index}.jpg`
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

  saveToDatabase(cloudIDs) {
    const {
      catName, gender, ageOptions, ageIndex, location, notes,
      hospitals, hospitalIndex, surgeryDate, surgeryType, earmark, vaccine, cost,
      releaseStatus, releaseDate, releaseLocation, followUp
    } = this.data

    const userInfo = wx.getStorageSync('userInfo') || {}

    const postData = {
      // 猫咪信息
      catName,
      photos: cloudIDs,
      gender,
      genderText: gender === 'male' ? '公猫' : gender === 'female' ? '母猫' : '未知',
      age: ageOptions[ageIndex].value,
      ageText: ageOptions[ageIndex].label,
      captureLocation: location ? {
        latitude: location.latitude,
        longitude: location.longitude,
        name: location.name,
        address: location.address
      } : null,
      notes,

      // 手术信息
      hospital: hospitals[hospitalIndex]?.name || '',
      surgeryDate,
      surgeryType,
      earmark,
      vaccine,
      cost: parseFloat(cost) || 0,

      // 放归信息
      releaseStatus,
      releaseDate,
      releaseLocation: releaseLocation ? {
        latitude: releaseLocation.latitude,
        longitude: releaseLocation.longitude,
        name: releaseLocation.name,
        address: releaseLocation.address
      } : null,
      followUp,

      // 状态
      status: releaseStatus === 'done' ? 'done' : releaseStatus === 'recovery' ? 'progress' : 'pending',
      statusText: releaseStatus === 'done' ? '已完成' : releaseStatus === 'recovery' ? '康复中' : '待放归',

      // 用户信息
      recorder: {
        openid: '',
        nickName: userInfo.nickName || '志愿者',
        avatarUrl: userInfo.avatarUrl || ''
      },

      // 时间
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    }

    return new Promise((resolve, reject) => {
      db.collection('tnr_records').add({
        data: postData,
        success: (res) => resolve(res),
        fail: (err) => reject(err)
      })
    })
  }
})
