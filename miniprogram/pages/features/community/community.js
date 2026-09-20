// 社区页面
const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({
  data: {
    currentTab: 0,
    loading: false,
    refreshing: false,
    catMoments: [],
    recentRescues: [],
    adoptCats: [],
    questions: []
  },

  onLoad: function(options) {
    console.log('社区页面加载')
    this.loadAllData()
  },

  onShow: function() {
    console.log('社区页面显示')
  },

  onPullDownRefresh: function() {
    this.setData({ refreshing: true })
    this.loadAllData().then(() => {
      wx.stopPullDownRefresh()
      this.setData({ refreshing: false })
    })
  },

  loadAllData: function() {
    this.setData({ loading: true })
    
    return Promise.all([
      this.loadMoments(),
      this.loadRescues(),
      this.loadAdoptCats(),
      this.loadQuestions()
    ]).then(() => {
      this.setData({ loading: false })
    }).catch(err => {
      console.log('加载数据失败', err)
      this.setData({ loading: false })
    })
  },

  // 加载动态列表
  loadMoments: function() {
    return new Promise((resolve) => {
      db.collection('moments')
        .orderBy('createTime', 'desc')
        .limit(20)
        .get({
          success: (res) => {
            const moments = (res.data || []).map(item => ({
              id: item._id,
              openid: item._openid,
              avatar: item.avatar || '',
              username: item.username || '匿名用户',
              time: this.formatTime(item.createTime),
              content: item.content || '',
              images: item.images || [],
              likes: item.likes || 0,
              comments: item.comments || 0,
              liked: false
            }))
            this.setData({ catMoments: moments })
            resolve()
          },
          fail: (err) => {
            console.log('加载动态失败', err)
            // 使用示例数据
            this.setData({
              catMoments: this.getDefaultMoments()
            })
            resolve()
          }
        })
    })
  },

  // 加载救助动态
  loadRescues: function() {
    return new Promise((resolve) => {
      db.collection('rescues')
        .orderBy('createTime', 'desc')
        .limit(10)
        .get({
          success: (res) => {
            const rescues = (res.data || []).map(item => ({
              id: item._id,
              image: item.photos && item.photos[0] || '',
              title: item.title || '救助动态',
              description: item.description || '',
              statusType: item.status || 'pending',
              statusText: this.getRescueStatusText(item.status),
              author: item.username || '匿名',
              time: this.formatTime(item.createTime)
            }))
            this.setData({ recentRescues: rescues })
            resolve()
          },
          fail: (err) => {
            console.log('加载救助动态失败', err)
            this.setData({
              recentRescues: this.getDefaultRescues()
            })
            resolve()
          }
        })
    })
  },

  // 加载待领养猫咪
  loadAdoptCats: function() {
    return new Promise((resolve) => {
      db.collection('cats')
        .where({
          status: _.in(['available', 'treatment'])
        })
        .orderBy('createTime', 'desc')
        .limit(6)
        .get({
          success: (res) => {
            const cats = (res.data || []).map(item => ({
              id: item._id,
              photo: item.photos && item.photos[0] || '',
              name: item.name || '未知',
              status: item.status || 'available',
              statusText: this.getStatusText(item.status),
              description: item.description || '',
              tags: [item.breed || '猫猫', item.gender || '未知'].filter(Boolean),
              progress: item.progress || 50,
              supporters: item.supporters || 0
            }))
            this.setData({ adoptCats: cats })
            resolve()
          },
          fail: (err) => {
            console.log('加载领养猫咪失败', err)
            this.setData({
              adoptCats: this.getDefaultAdoptCats()
            })
            resolve()
          }
        })
    })
  },

  // 加载问答
  loadQuestions: function() {
    return new Promise((resolve) => {
      db.collection('questions')
        .orderBy('createTime', 'desc')
        .limit(10)
        .get({
          success: (res) => {
            const questions = (res.data || []).map(item => ({
              id: item._id,
              type: item.category || 'other',
              typeText: this.getCategoryText(item.category),
              question: item.title || item.question || '',
              author: item.username || '匿名用户',
              time: this.formatTime(item.createTime),
              answerCount: item.answers || 0,
              solved: item.solved || false
            }))
            this.setData({ questions: questions })
            resolve()
          },
          fail: (err) => {
            console.log('加载问答失败', err)
            this.setData({
              questions: this.getDefaultQuestions()
            })
            resolve()
          }
        })
    })
  },

  // 格式化时间
  formatTime: function(date) {
    if (!date) return '刚刚'
    const d = new Date(date)
    const now = new Date()
    const diff = now - d
    
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
    if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
    
    const year = d.getFullYear()
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const day = d.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  // 状态文本转换
  getStatusText: function(status) {
    const map = {
      'available': '待领养',
      'treatment': '治疗中',
      'adopted': '已领养',
      'foster': '寄养中',
      'deceased': '已离世'
    }
    return map[status] || '待领养'
  },

  getRescueStatusText: function(status) {
    const map = {
      'pending': '待救助',
      'rescuing': '救助中',
      'completed': '已完成',
      'urgent': '紧急'
    }
    return map[status] || '待救助'
  },

  getCategoryText: function(category) {
    const map = {
      'feed': '喂养',
      'health': '健康',
      'rescue': '救助',
      'adopt': '领养',
      'other': '其他'
    }
    return map[category] || '其他'
  },

  // 默认数据（兜底）
  getDefaultMoments: function() {
    return [
      {
        id: 'demo1',
        avatar: '',
        username: '守护咪用户',
        time: '刚刚',
        content: '今天在小区遇到了一只超可爱的小橘猫，性格特别温顺，已经联系了医院准备做绝育啦~',
        images: [],
        likes: 12,
        comments: 3,
        liked: false
      }
    ]
  },

  getDefaultRescues: function() {
    return [
      {
        id: 'demo1',
        image: '',
        title: '紧急救助',
        description: '发现一只受伤的小猫，需要救助',
        statusType: 'urgent',
        statusText: '紧急',
        author: '小王',
        time: '30分钟前'
      }
    ]
  },

  getDefaultAdoptCats: function() {
    return [
      {
        id: 'demo1',
        photo: '',
        name: '小橘',
        status: 'available',
        statusText: '待领养',
        description: '一只温顺的橘猫，约2岁，已绝育',
        tags: ['橘猫', '已绝育'],
        progress: 60,
        supporters: 5
      }
    ]
  },

  getDefaultQuestions: function() {
    return [
      {
        id: 'demo1',
        type: 'feed',
        typeText: '喂养',
        question: '流浪猫吃什么比较好？',
        author: '新手上路',
        time: '2小时前',
        answerCount: 3,
        solved: false
      }
    ]
  },

  switchTab: function(e) {
    var index = parseInt(e.currentTarget.dataset.index)
    this.setData({ currentTab: index })
  },

  postMoment: function() {
    wx.navigateTo({ url: '/pages/user/post-moment/post-moment' })
  },

  likeMoment: function(e) {
    var id = e.currentTarget.dataset.id
    var openid = e.currentTarget.dataset.openid || ''
    
    // 检查登录状态
    var userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.nickName) {
      wx.showModal({
        title: '请先登录',
        content: '点赞需要登录，是否前往登录？',
        confirmText: '去登录',
        confirmColor: '#4CAF50',
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/user/login/login' })
          }
        }
      })
      return
    }
    
    var moments = this.data.catMoments
    
    for (var i = 0; i < moments.length; i++) {
      if (moments[i].id === id) {
        moments[i].liked = !moments[i].liked
        moments[i].likes += moments[i].liked ? 1 : -1
        
        // 更新云数据库
        if (moments[i].liked) {
          db.collection('moments').doc(id).update({
            data: { likes: _.inc(1) }
          })
        } else {
          db.collection('moments').doc(id).update({
            data: { likes: _.inc(-1) }
          })
        }
        break
      }
    }
    this.setData({ catMoments: moments })
  },

  supportCat: function(e) {
    var id = e.currentTarget.dataset.id
    
    // 检查登录状态
    var userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.nickName) {
      wx.showModal({
        title: '请先登录',
        content: '云养打卡需要登录，是否前往登录？',
        confirmText: '去登录',
        confirmColor: '#4CAF50',
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/user/login/login' })
          }
        }
      })
      return
    }
    
    var cats = this.data.adoptCats
    
    for (var i = 0; i < cats.length; i++) {
      if (cats[i].id === id) {
        cats[i].supporters = (cats[i].supporters || 0) + 1
        break
      }
    }
    
    this.setData({ adoptCats: cats })
    wx.showToast({ title: '云养成功！', icon: 'success' })
    
    // 更新云数据库
    db.collection('cats').doc(id).update({
      data: { supporters: _.inc(1) }
    }).catch(function(err) {
      console.log('更新云养数失败', err)
    })
  },

  askQuestion: function() {
    wx.navigateTo({ url: '/pages/features/ask-question/ask-question' })
  },

  viewQuestion: function(e) {
    var item = e.currentTarget.dataset.item
    wx.navigateTo({ 
      url: '/pages/features/question-detail/question-detail?id=' + item.id
    })
  },

  viewMoment: function(e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({ 
      url: '/pages/features/moment-detail/moment-detail?id=' + id
    })
  },

  onCatDetail: function(e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/core/cat-detail/cat-detail?id=' + id
    })
  },

  onShareAppMessage: function() {
    return {
      title: '咪咪守护站 - 社区动态',
      path: '/pages/features/community/community'
    }
  }
})
