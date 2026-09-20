Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },

  data: {
    types: [
      { value: 'abuse', label: '虐待猫咪' },
      { value: 'poison', label: '投毒行为' },
      { value: 'capture', label: '非法捕捉' },
      { value: 'fake_adopt', label: '伪装领养' },
      { value: 'other', label: '其他' }
    ],
    reportType: '',
    location: '',
    perpetrator: '',
    description: '',
    files: [],
    contact: ''
  },

  methods: {
    // 阻止遮罩层滚动穿透
    preventTouchMove() {
      return false
    },

    // 阻止冒泡
    stopPropagation() {
      return false
    },

    // 点击遮罩关闭
    onMaskTap() {
      this.closeDialog()
    },

    // 关闭弹窗
    onClose() {
      this.closeDialog()
    },

    closeDialog() {
      this.triggerEvent('close')
      // 延迟清空数据，等待动画完成
      setTimeout(() => {
        this.setData({
          reportType: '',
          location: '',
          perpetrator: '',
          description: '',
          files: [],
          contact: ''
        })
      }, 300)
    },

    // 选择举报类型
    selectType(e) {
      const value = e.currentTarget.dataset.value
      this.setData({ reportType: value })
    },

    // 输入事件
    onLocationInput(e) {
      this.setData({ location: e.detail.value })
    },

    onPerpetratorInput(e) {
      this.setData({ perpetrator: e.detail.value })
    },

    onDescriptionInput(e) {
      this.setData({ description: e.detail.value })
    },

    onContactInput(e) {
      this.setData({ contact: e.detail.value })
    },

    // 上传文件
    onUpload() {
      wx.chooseMedia({
        count: 9 - this.data.files.length,
        mediaType: ['image', 'video'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const newFiles = [...this.data.files, ...res.tempFiles]
          this.setData({ files: newFiles })
          wx.showToast({
            title: `已选择${newFiles.length}个文件`,
            icon: 'success',
            duration: 1500
          })
        }
      })
    },

    // 提交举报
    onSubmit() {
      // 验证必填项
      if (!this.data.reportType) {
        wx.showToast({ title: '请选择举报类型', icon: 'none' })
        return
      }

      if (!this.data.location) {
        wx.showToast({ title: '请填写时间地点', icon: 'none' })
        return
      }

      if (!this.data.perpetrator) {
        wx.showToast({ title: '请填写施虐者特征', icon: 'none' })
        return
      }

      if (!this.data.description || this.data.description.length < 20) {
        wx.showToast({ title: '请详细描述虐待情况（至少20字）', icon: 'none' })
        return
      }

      if (!this.data.contact || this.data.contact.length !== 11) {
        wx.showToast({ title: '请输入正确的手机号', icon: 'none' })
        return
      }

      // 显示加载
      wx.showLoading({ title: '提交中...', mask: true })

      // 模拟提交
      setTimeout(() => {
        wx.hideLoading()

        // 生成举报编号
        const reportId = 'SH' + Date.now().toString().slice(-8)

        // 触发提交成功事件
        this.triggerEvent('submit', {
          reportId,
          type: this.data.reportType,
          location: this.data.location,
          perpetrator: this.data.perpetrator,
          description: this.data.description,
          filesCount: this.data.files.length,
          contact: this.data.contact
        })

        // 关闭弹窗
        this.closeDialog()

        // 显示成功提示
        wx.showModal({
          title: '举报已提交',
          content: `举报编号：${reportId}\n\n我们已收到您的举报，将在30分钟内联系您。\n\n同时建议：\n1. 立即拨打110报警\n2. 保留好证据材料\n3. 注意自身安全`,
          confirmText: '拨打110',
          confirmColor: '#EF4444',
          cancelText: '知道了',
          success: (res) => {
            if (res.confirm) {
              wx.makePhoneCall({
                phoneNumber: '110',
                fail: () => {
                  wx.showToast({ title: '拨号失败', icon: 'none' })
                }
              })
            }
          }
        })
      }, 1500)
    }
  }
})
