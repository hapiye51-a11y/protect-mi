const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    cat: null,
    healthRecordCount: 0,
    photoCount: 0,
    diaryCount: 0,
    latestDiary: null
  },

  onLoad(options) {
    const catId = options.id
    if (catId) {
      this.loadCatDetail(catId)
    }
  },

  // 加载猫咪详情
  loadCatDetail(catId) {
    wx.showLoading({ title: '加载中...', mask: true })

    // 获取猫咪基本信息
    db.collection('cats').doc(catId).get({
      success: (res) => {
        const cat = res.data
        console.log('猫咪详情:', cat)

        // 格式化状态文字
        const statusMap = {
          'available': '待领养',
          'adopted': '已领养',
          'treatment': '治疗中'
        }
        cat.statusText = statusMap[cat.status] || '未知'

        this.setData({ cat })
        this.loadRelatedData(catId)
        wx.hideLoading()
      },
      fail: (err) => {
        console.error('加载失败:', err)
        wx.hideLoading()
        wx.showToast({ title: '加载失败', icon: 'none' })
      }
    })
  },

  // 加载相关数据
  loadRelatedData(catId) {
    // 获取健康记录数
    db.collection('cat_health').where({ catId }).count({
      success: (res) => {
        this.setData({ healthRecordCount: res.total })
      }
    })

    // 获取照片数（从猫咪的images数组）
    if (this.data.cat.images && this.data.cat.images.length) {
      this.setData({ photoCount: this.data.cat.images.length })
    }

    // 获取成长日记数
    db.collection('cat_diary').where({ catId }).orderBy('createTime', 'desc').limit(1).get({
      success: (res) => {
        if (res.data && res.data.length) {
          const diary = res.data[0]
          diary.displayDate = this.formatDate(diary.createTime)
          this.setData({ 
            latestDiary: diary,
            diaryCount: 1 // TODO: 实际应该用count
          })
        }
      }
    })
  },

  // 返回
  onBack() {
    wx.navigateBack()
  },

  // 跳转健康档案
  goToHealth() {
    if (!this.data.cat) return
    wx.navigateTo({
      url: `/pages/core/cat-health/cat-health?id=${this.data.cat._id}`
    })
  },

  // 跳转相册
  goToAlbum() {
    if (!this.data.cat) return
    wx.navigateTo({
      url: `/pages/core/cat-album/cat-album?id=${this.data.cat._id}`
    })
  },

  // 跳转成长记录
  goToDiary() {
    if (!this.data.cat) return
    wx.navigateTo({
      url: `/pages/core/cat-diary/cat-diary?id=${this.data.cat._id}`
    })
  },

  // 申请领养
  onAdopt() {
    const cat = this.data.cat
    if (!cat) return

    wx.showModal({
      title: '申请领养 ' + cat.name,
      content: '申请领养需要：\n\n1. 填写领养申请表\n2. 提供家庭环境照片\n3. 承诺善待猫咪\n4. 定期反馈猫咪状况\n\n确定要申请领养吗？',
      confirmText: '立即申请',
      confirmColor: '#FF9800',
      cancelText: '再想想',
      success: (res) => {
        if (res.confirm) {
          this.submitAdoptionApplication()
        }
      }
    })
  },

  // 提交领养申请
  submitAdoptionApplication() {
    const cat = this.data.cat
    const userInfo = wx.getStorageSync('userInfo') || {}

    const applicationData = {
      catId: cat._id,
      catName: cat.name,
      applicant: {
        openid: '',
        nickName: userInfo.nickName || '申请人',
        avatarUrl: userInfo.avatarUrl || ''
      },
      status: 'pending',
      createTime: db.serverDate()
    }

    db.collection('adoptions').add({
      data: applicationData,
      success: () => {
        wx.showModal({
          title: '申请已提交',
          content: '请联系我们提交领养申请：\n\n📧 a229941302@163.com\n💬 微信：shouhumi2024\n\n我们会尽快审核您的申请并与您联系。',
          confirmText: '复制邮箱',
          confirmColor: '#FF9800',
          cancelText: '稍后',
          success: (res) => {
            if (res.confirm) {
              wx.setClipboardData({
                data: 'a229941302@163.com',
                success: () => {
                  wx.showToast({ title: '邮箱已复制', icon: 'success' })
                }
              })
            }
          }
        })
      },
      fail: (err) => {
        console.error('申请保存失败:', err)
        wx.showToast({ title: '申请失败', icon: 'none' })
      }
    })
  },

  // 联系我们
  onContact() {
    wx.showModal({
      title: '联系我们',
      content: '📧 邮箱：a229941302@163.com\n💬 微信：shouhumi2024\n\n欢迎咨询关于猫咪的任何问题！',
      confirmText: '复制邮箱',
      confirmColor: '#FF9800',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: 'a229941302@163.com',
            success: () => {
              wx.showToast({ title: '邮箱已复制', icon: 'success' })
            }
          })
        }
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

  // 分享
  onShareAppMessage() {
    const cat = this.data.cat
    return {
      title: `守护咪 - ${cat ? cat.name : '猫咪档案'} 🐱`,
      path: `/pages/core/cat-detail/cat-detail?id=${cat ? cat._id : ''}`,
      imageUrl: cat ? cat.avatar : ''
    }
  }
})
