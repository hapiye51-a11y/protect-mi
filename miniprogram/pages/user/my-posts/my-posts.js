const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    posts: [],
    allPosts: [],
    publishedCount: 0,
    pendingCount: 0,
    reviewingCount: 0,
    loading: false,
    currentFilter: 'all'
  },

  onLoad() {
    console.log('我的发布页面加载')
    this.loadMyPosts()
  },

  onShow() {
    // 每次显示时重新加载
    this.loadMyPosts()
  },

  // 加载我的发布
  loadMyPosts() {
    this.setData({ loading: true })

    // 需要获取用户的 openid
    // 这里先从本地获取用户信息，实际应该使用云函数获取 openid
    const userInfo = wx.getStorageSync('userInfo') || {}

    // 从 rescues 集合读取用户发布的救助信息
    db.collection('rescues')
      .where({
        'reporter.nickName': userInfo.nickName || '' // 简单匹配，实际应使用 openid
      })
      .orderBy('createTime', 'desc')
      .get({
        success: (res) => {
          const rescues = res.data || []
          console.log('救助信息加载成功:', rescues.length, '条')

          // 从 risks 集合读取用户上报的风险
          db.collection('risks')
            .where({
              'reporter.nickName': userInfo.nickName || ''
            })
            .orderBy('createTime', 'desc')
            .get({
              success: (riskRes) => {
                const risks = riskRes.data || []
                console.log('风险上报加载成功:', risks.length, '条')

                // 从 moments 集合读取用户发布的动态
                db.collection('moments')
                  .where({
                    'author.nickName': userInfo.nickName || '',
                    isDeleted: false
                  })
                  .orderBy('createTime', 'desc')
                  .get({
                    success: (momentRes) => {
                      const moments = momentRes.data || []
                      console.log('动态加载成功:', moments.length, '条')

                      this.combinePosts(rescues, risks, moments)
                    },
                    fail: (err) => {
                      console.error('动态加载失败:', err)
                      this.combinePosts(rescues, risks, [])
                    }
                  })
              },
              fail: (err) => {
                console.error('风险上报加载失败:', err)
                this.combinePosts(rescues, [], [])
              }
            })
        },
        fail: (err) => {
          console.error('救助信息加载失败:', err)
          this.setData({ loading: false })
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          })
        }
      })
  },

  // 合并所有发布数据
  combinePosts(rescues, risks, moments) {
    // 将不同类型的数据合并为统一格式
    const combinedPosts = [
      // 救助信息
      ...rescues.map(rescue => ({
        ...rescue,
        type: 'rescue',
        typeText: '救助信息',
        statusText: this.getRescueStatusText(rescue.status),
        locationText: rescue.location?.address || '未知位置'
      })),
      // 风险上报
      ...risks.map(risk => ({
        ...risk,
        type: 'risk',
        typeText: '风险上报',
        statusText: this.getRiskStatusText(risk.status),
        riskLevelText: this.getLevelText(risk.riskLevel),
        riskTypeText: this.getRiskTypeText(risk.riskType),
        locationText: risk.location?.address || '未知位置'
      })),
      // 社区动态
      ...moments.map(moment => ({
        ...moment,
        type: 'moment',
        typeText: '社区动态',
        statusText: '已发布',
        locationText: moment.location || '社区'
      }))
    ]

    // 按时间排序（最新的在前）
    combinedPosts.sort((a, b) => {
      const timeA = new Date(a.createTime).getTime()
      const timeB = new Date(b.createTime).getTime()
      return timeB - timeA
    })

    // 计算统计数据
    const publishedCount = combinedPosts.filter(p => {
      if (p.type === 'rescue') return p.status === 'published'
      if (p.type === 'risk') return p.status === 'published'
      return true // moment 总是已发布
    }).length

    const pendingCount = combinedPosts.filter(p => {
      if (p.type === 'rescue') return p.status === 'draft'
      if (p.type === 'risk') return p.status === 'draft'
      return false
    }).length

    const reviewingCount = combinedPosts.filter(p => {
      if (p.type === 'rescue' || p.type === 'risk') return p.status === 'pending'
      return false
    }).length

    this.setData({
      posts: combinedPosts,
      allPosts: combinedPosts,
      publishedCount,
      pendingCount,
      reviewingCount,
      loading: false
    })

    console.log('总加载:', combinedPosts.length, '条发布')
  },

  // 获取救助状态文本
  getRescueStatusText(status) {
    const map = {
      pending: '审核中',
      published: '已发布',
      rejected: '已拒绝'
    }
    return map[status] || '未知'
  },

  // 获取风险状态文本
  getRiskStatusText(status) {
    const map = {
      pending: '审核中',
      published: '已发布',
      rejected: '已拒绝'
    }
    return map[status] || '未知'
  },

  // 获取风险等级文本
  getLevelText(level) {
    const map = {
      high: '高危',
      medium: '中危',
      low: '低危'
    }
    return map[level] || ''
  },

  // 获取风险类型文本
  getRiskTypeText(type) {
    const map = {
      abuse: '虐待行为',
      trap: '捕猫陷阱',
      poison: '投毒危险',
      traffic: '交通危险',
      environment: '危险环境',
      other: '其他风险'
    }
    return map[type] || '风险类型'
  },

  // 查看发布详情
  onPostDetail(e) {
    const id = e.currentTarget.dataset.id
    const post = this.data.posts.find(p => p._id === id)

    if (!post) return

    let content = ''
    if (post.type === 'risk') {
      content = `风险类型：${post.riskTypeText}\n`
      content += `风险等级：${post.riskLevelText}\n`
      content += `描述：${post.description}\n`
      content += `位置：${post.locationText}\n`
      content += `上报时间：${new Date(post.createTime).toLocaleString()}\n`
      content += `状态：${post.statusText}`
    } else {
      content = `描述：${post.description}\n`
      content += `位置：${post.locationText}\n`
      content += `发布时间：${new Date(post.createTime).toLocaleString()}\n`
      content += `状态：${post.statusText}`
    }

    wx.showModal({
      title: post.typeText + '详情',
      content: content,
      confirmText: '导航前往',
      confirmColor: '#FF9800',
      cancelText: '关闭',
      success: (res) => {
        if (res.confirm && post.location && post.location.latitude && post.location.longitude) {
          wx.openLocation({
            latitude: post.location.latitude,
            longitude: post.location.longitude,
            name: post.typeText,
            address: post.locationText,
            scale: 16
          })
        }
      }
    })
  },

  // 编辑发布
  onEdit(e) {
    const id = e.currentTarget.dataset.id
    const post = this.data.posts.find(p => p._id === id)

    if (!post) return

    if (post.type === 'rescue') {
      // 编辑救助信息
      wx.navigateTo({
        url: `/pages/core/publish/publish?id=${id}`
      })
    } else if (post.type === 'risk') {
      // 编辑风险上报
      wx.navigateTo({
        url: `/pages/features/report-risk/report-risk?id=${id}`
      })
    } else {
      // 编辑动态
      wx.navigateTo({
        url: `/pages/user/post-moment/post-moment?id=${id}`
      })
    }
  },

  // 删除发布
  onDelete(e) {
    const id = e.currentTarget.dataset.id
    const post = this.data.posts.find(p => p._id === id)

    if (!post) return

    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这条发布吗？',
      confirmText: '删除',
      confirmColor: '#FF5252',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.deletePost(post)
        }
      }
    })
  },

  // 执行删除
  deletePost(post) {
    wx.showLoading({
      title: '删除中...',
      mask: true
    })

    const collectionName = post.type === 'rescue' ? 'rescues' :
                         post.type === 'risk' ? 'risks' : 'moments'

    db.collection(collectionName)
      .doc(post._id)
      .remove({
        success: () => {
          console.log('删除成功:', post._id)
          wx.hideLoading()

          wx.showToast({
            title: '✅ 删除成功',
            icon: 'success',
            duration: 1500
          })

          // 重新加载列表
          this.loadMyPosts()
        },
        fail: (err) => {
          console.error('删除失败:', err)
          wx.hideLoading()
          wx.showToast({
            title: '删除失败',
            icon: 'none'
          })
        }
      })
  },

  // 去发布救助
  goPublish() {
    wx.navigateTo({
      url: '/pages/core/publish/publish'
    })
  },

  // 去上报风险
  goReport() {
    wx.navigateTo({
      url: '/pages/features/report-risk/report-risk'
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadMyPosts()
    setTimeout(() => {
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      })
      wx.stopPullDownRefresh()
    }, 1000)
  },

  // 筛选待发布
  filterPending() {
    const pendingPosts = this.data.allPosts.filter(p => {
      if (p.type === 'rescue' || p.type === 'risk') return p.status !== 'published'
      return false
    })
    this.setData({ 
      posts: pendingPosts,
      currentFilter: 'pending'
    })
    if (pendingPosts.length === 0) {
      wx.showToast({ title: '暂无待发布内容', icon: 'none' })
    }
  },

  // 筛选已发布
  filterPublished() {
    const publishedPosts = this.data.allPosts.filter(p => {
      if (p.type === 'rescue' || p.type === 'risk') return p.status === 'published'
      return true
    })
    this.setData({ 
      posts: publishedPosts,
      currentFilter: 'published'
    })
  },

  // 显示全部
  filterAll() {
    this.setData({ 
      posts: this.data.allPosts,
      currentFilter: 'all'
    })
  },

  goBack() {
    wx.navigateBack()
  }
})
