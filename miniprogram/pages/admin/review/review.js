// 管理员审核页面
const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({
  data: {
    isAdmin: false,
    loading: true,
    cats: [],
    tab: 'pending',
    pendingCount: 0
  },

  onLoad() {
    this.checkAdmin()
  },

  onShow() {
    if (this.data.isAdmin) {
      this.loadCats()
      this.loadPendingCount()
    }
  },

  onPullDownRefresh() {
    if (this.data.isAdmin) {
      this.loadCats()
      this.loadPendingCount()
    }
    wx.stopPullDownRefresh()
  },

  // 检查管理员权限
  checkAdmin() {
    // 通过云函数检查（推荐）
    wx.cloud.callFunction({
      name: 'checkAdmin',
      success: (res) => {
        const isAdmin = res.result && res.result.isAdmin
        this.setData({ isAdmin, loading: false })
        if (isAdmin) {
          this.loadCats()
          this.loadPendingCount()
        }
      },
      fail: (err) => {
        console.error('检查管理员权限失败:', err)
        // 备用方案：暂时让所有人都能访问（测试用）
        // 正式上线时改为 false
        this.setData({ 
          isAdmin: true,
          loading: false 
        })
        this.loadCats()
        this.loadPendingCount()
      }
    })
  },

  // 加载待审核数量
  loadPendingCount() {
    db.collection('cats')
      .where({ status: 'pending' })
      .count({
        success: (res) => {
          this.setData({ pendingCount: res.total })
        }
      })
  },

  // 加载猫咪列表
  loadCats() {
    this.setData({ loading: true })
    
    const statusMap = {
      'pending': 'pending',
      'approved': 'available',
      'rejected': 'rejected'
    }
    
    db.collection('cats')
      .where({
        status: statusMap[this.data.tab] || 'pending'
      })
      .orderBy('createTime', 'desc')
      .limit(50)
      .get({
        success: (res) => {
          const cats = res.data.map(cat => ({
            ...cat,
            createTimeText: this.formatTime(cat.createTime)
          }))
          this.setData({ 
            cats,
            loading: false 
          })
        },
        fail: (err) => {
          console.error('加载失败:', err)
          this.setData({ loading: false })
          wx.showToast({ title: '加载失败', icon: 'none' })
        }
      })
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ tab }, () => {
      this.loadCats()
    })
  },

  // 查看详情
  viewDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/core/cat-detail/cat-detail?id=${id}`
    })
  },

  // 批准
  approve(e) {
    const id = e.currentTarget.dataset.id
    const cat = this.data.cats.find(c => c._id === id)
    
    wx.showModal({
      title: '批准发布',
      content: `确定批准"${cat.name}"的档案吗？批准后将对所有人可见。`,
      confirmText: '批准',
      confirmColor: '#4CAF50',
      success: (res) => {
        if (res.confirm) {
          this.updateStatus(id, 'available', '已批准')
        }
      }
    })
  },

  // 拒绝
  reject(e) {
    const id = e.currentTarget.dataset.id
    const cat = this.data.cats.find(c => c._id === id)
    
    wx.showModal({
      title: '拒绝发布',
      content: `确定拒绝"${cat.name}"的档案吗？`,
      confirmText: '拒绝',
      confirmColor: '#FF5252',
      success: (res) => {
        if (res.confirm) {
          this.updateStatus(id, 'rejected', '已拒绝')
        }
      }
    })
  },

  // 更新状态
  updateStatus(id, status, message) {
    wx.showLoading({ title: '处理中...', mask: true })
    
    db.collection('cats')
      .doc(id)
      .update({
        data: {
          status: status,
          reviewed: true,
          reviewedTime: db.serverDate()
        },
        success: () => {
          wx.hideLoading()
          wx.showToast({ title: message, icon: 'success' })
          this.loadCats()
          this.loadPendingCount()
        },
        fail: (err) => {
          wx.hideLoading()
          console.error('更新失败:', err)
          wx.showToast({ title: '操作失败', icon: 'none' })
        }
      })
  },

  // 格式化时间
  formatTime(date) {
    if (!date) return ''
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hour = String(d.getHours()).padStart(2, '0')
    const minute = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  },

  onShareAppMessage() {
    return {
      title: '守护咪 - 审核管理',
      path: '/pages/admin/review/review'
    }
  }
})
