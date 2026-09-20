Page({
  data: {
    // 用户头像
    avatarUrl: '',
    // 用户昵称
    nickName: '',
    // 是否可以提交
    canSubmit: false,
    // 上传中状态
    isUploading: false
  },

  onLoad() {
    // 检查是否已有用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo && userInfo.nickName) {
      this.setData({
        avatarUrl: userInfo.avatarUrl || '',
        nickName: userInfo.nickName || ''
      })
      this.checkCanSubmit()
    }
  },

  // 选择头像 - 使用最新规范
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail

    console.log('选择的头像路径:', avatarUrl)

    this.setData({
      avatarUrl: avatarUrl
    })

    this.checkCanSubmit()

    wx.showToast({
      title: '头像已选择',
      icon: 'success',
      duration: 1500
    })
  },

  // 昵称输入 - 使用最新规范
  onNicknameInput(e) {
    const nickName = e.detail.value

    this.setData({
      nickName: nickName
    })

    this.checkCanSubmit()
  },

  // 检查是否可以提交
  checkCanSubmit() {
    const { avatarUrl, nickName } = this.data
    const canSubmit = avatarUrl.length > 0 && nickName.trim().length > 0

    this.setData({ canSubmit })
  },

  // 提交用户信息
  onSubmit() {
    if (!this.data.canSubmit || this.data.isUploading) {
      return
    }

    const { avatarUrl, nickName } = this.data

    // 验证昵称
    if (nickName.trim().length === 0) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (nickName.length > 20) {
      wx.showToast({
        title: '昵称不能超过20个字符',
        icon: 'none',
        duration: 2000
      })
      return
    }

    // 开始上传流程
    this.setData({ isUploading: true })

    wx.showLoading({
      title: '保存中...',
      mask: true
    })

    // 模拟上传头像到服务器
    this.uploadAvatar(avatarUrl)
      .then((uploadedUrl) => {
        // 保存用户信息到本地缓存
        const userInfo = {
          avatarUrl: uploadedUrl,
          nickName: nickName.trim(),
          updateTime: Date.now()
        }

        wx.setStorageSync('userInfo', userInfo)

        wx.hideLoading()

        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 1500
        })

        // 延迟跳转到首页
        setTimeout(() => {
          this.setData({ isUploading: false })
          wx.switchTab({
            url: '/pages/core/index/index'
          })
        }, 1500)
      })
      .catch((error) => {
        wx.hideLoading()
        this.setData({ isUploading: false })

        console.error('上传失败:', error)

        wx.showModal({
          title: '保存失败',
          content: '头像上传失败，请重试',
          confirmText: '重试',
          confirmColor: '#4CAF50',
          success: (res) => {
            if (res.confirm) {
              this.onSubmit()
            }
          }
        })
      })
  },

  // 模拟上传头像到服务器
  uploadAvatar(tempFilePath) {
    return new Promise((resolve, reject) => {
      // 模拟网络延迟
      setTimeout(() => {
        // 实际开发中，这里应该调用 wx.uploadFile 上传到服务器
        // wx.uploadFile({
        //   url: 'https://your-server.com/upload',
        //   filePath: tempFilePath,
        //   name: 'file',
        //   success: (res) => {
        //     const data = JSON.parse(res.data)
        //     resolve(data.url)
        //   },
        //   fail: reject
        // })

        // 模拟上传成功，返回临时路径（实际应返回服务器URL）
        const progress = [30, 60, 80, 100]
        let index = 0

        const timer = setInterval(() => {
          if (index < progress.length) {
            wx.showLoading({
              title: `上传中 ${progress[index]}%`,
              mask: true
            })
            index++
          } else {
            clearInterval(timer)
            // 模拟返回上传后的URL（实际开发中应该是服务器返回的URL）
            resolve(tempFilePath)
          }
        }, 300)
      }, 100)
    })
  },

  // 跳过填写（游客模式）
  onSkip() {
    wx.showModal({
      title: '游客模式',
      content: '跳过登录可浏览内容，但无法发布救助信息、评论互动。您可以随时在"我的"页面登录。',
      confirmText: '继续浏览',
      cancelText: '返回',
      confirmColor: '#FF9800',
      success: (res) => {
        if (res.confirm) {
          // 标记为游客模式（不设置 userInfo）
          wx.setStorageSync('isGuest', true)

          wx.showToast({
            title: '游客模式',
            icon: 'success',
            duration: 1500
          })

          setTimeout(() => {
            wx.switchTab({
              url: '/pages/core/index/index'
            })
          }, 1500)
        }
      }
    })
  },

  goBack() {
    wx.navigateBack()
  }
})
