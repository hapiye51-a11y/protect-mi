const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    catId: '',
    type: 'vaccine',
    typeInfo: {
      icon: '💉',
      title: '添加疫苗记录'
    },
    form: {
      date: '',
      vaccineType: '猫三联',
      vaccineName: '',
      dewormType: '体内驱虫',
      brand: '',
      hospital: '',
      diagnosis: '',
      treatment: '',
      cost: '',
      nextDate: '',
      note: '',
      images: []
    },
    vaccineTypes: ['猫三联', '狂犬疫苗', '猫三联+狂犬', '其他'],
    vaccineIndex: 0,
    dewormTypes: ['体内驱虫', '体外驱虫', '内外同驱'],
    dewormIndex: 0,
    saving: false
  },

  onLoad(options) {
    const type = options.type || 'vaccine'
    const typeInfo = {
      'vaccine': { icon: '💉', title: '添加疫苗记录' },
      'deworm': { icon: '🐛', title: '添加驱虫记录' },
      'treatment': { icon: '🏥', title: '添加就诊记录' }
    }

    this.setData({
      catId: options.catId,
      type,
      typeInfo: typeInfo[type] || typeInfo['vaccine'],
      'form.date': this.formatDate(new Date())
    })
  },

  // 输入框变化
  onInputChange(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  // 日期变化
  onDateChange(e) {
    this.setData({ 'form.date': e.detail.value })
  },

  // 下次日期变化
  onNextDateChange(e) {
    this.setData({ 'form.nextDate': e.detail.value })
  },

  // 疫苗类型变化
  onVaccineTypeChange(e) {
    const index = parseInt(e.detail.value)
    this.setData({
      vaccineIndex: index,
      'form.vaccineType': this.data.vaccineTypes[index]
    })
  },

  // 驱虫类型变化
  onDewormTypeChange(e) {
    const index = parseInt(e.detail.value)
    this.setData({
      dewormIndex: index,
      'form.dewormType': this.data.dewormTypes[index]
    })
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

  // 保存
  async onSave() {
    if (!this.data.form.date) {
      wx.showToast({ title: '请选择日期', icon: 'none' })
      return
    }

    this.setData({ saving: true })

    try {
      // 上传图片
      const imageUrls = []
      for (const tempPath of this.data.form.images) {
        const cloudPath = `health/${this.data.catId}/${Date.now()}_${Math.random().toString(36).substr(2)}.jpg`
        const uploadRes = await wx.cloud.uploadFile({
          cloudPath: cloudPath,
          filePath: tempPath
        })
        imageUrls.push(uploadRes.fileID)
      }

      // 构建记录数据
      const recordData = {
        catId: this.data.catId,
        type: this.data.type,
        date: new Date(this.data.form.date),
        title: this.getTitle(),
        images: imageUrls,
        note: this.data.form.note,
        createTime: db.serverDate()
      }

      // 根据类型添加不同字段
      if (this.data.type === 'vaccine') {
        recordData.vaccineType = this.data.form.vaccineType
        recordData.vaccineName = this.data.form.vaccineName
        recordData.hospital = this.data.form.hospital
        if (this.data.form.nextDate) {
          recordData.nextDate = new Date(this.data.form.nextDate)
        }
      } else if (this.data.type === 'deworm') {
        recordData.dewormType = this.data.form.dewormType
        recordData.brand = this.data.form.brand
        if (this.data.form.nextDate) {
          recordData.nextDate = new Date(this.data.form.nextDate)
        }
      } else if (this.data.type === 'treatment') {
        recordData.hospital = this.data.form.hospital
        recordData.diagnosis = this.data.form.diagnosis
        recordData.treatment = this.data.form.treatment
        recordData.cost = parseFloat(this.data.form.cost) || 0
      }

      // 保存到数据库
      await db.collection('cat_health').add({ data: recordData })

      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (err) {
      console.error('保存失败:', err)
      wx.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      this.setData({ saving: false })
    }
  },

  // 获取标题
  getTitle() {
    if (this.data.type === 'vaccine') {
      return `${this.data.form.vaccineType}接种`
    } else if (this.data.type === 'deworm') {
      return this.data.form.dewormType
    } else if (this.data.type === 'treatment') {
      return this.data.form.diagnosis || '就诊记录'
    }
    return '健康记录'
  },

  // 格式化日期
  formatDate(date) {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
})
