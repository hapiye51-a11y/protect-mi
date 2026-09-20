const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({
  data: {
    currentPath: 'pages/core/index/index',
    greeting: '你好',
    greetingSub: '今天有 3 只小可爱等你来看',
    userInfo: null,
    todos: [],
    todoCount: 0,
    markers: [],
    longitude: 116.397428,
    latitude: 39.90923,
    scale: 14,
    riskAreas: [],
    bannerCats: [
      {
        _id: 'demo1',
        id: 'demo1',
        name: '小橘',
        image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=600&fit=crop',
        age: '2岁',
        breed: '橘猫',
        location: '北京市朝阳区',
        statusText: '待领养',
        urgent: true
      },
      {
        _id: 'demo2',
        id: 'demo2',
        name: '小白',
        image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&h=600&fit=crop',
        age: '1岁',
        breed: '英短',
        location: '北京市海淀区',
        statusText: '治疗中',
        urgent: false
      },
      {
        _id: 'demo3',
        id: 'demo3',
        name: '小黑',
        image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=600&fit=crop',
        age: '3岁',
        breed: '黑猫',
        location: '北京市西城区',
        statusText: '待领养',
        urgent: false
      },
      {
        _id: 'demo4',
        id: 'demo4',
        name: '花花',
        image: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800&h=600&fit=crop',
        age: '1.5岁',
        breed: '三花猫',
        location: '北京市东城区',
        statusText: '已领养',
        urgent: false
      },
      {
        _id: 'demo5',
        id: 'demo5',
        name: '咪咪',
        image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&h=600&fit=crop',
        age: '2.5岁',
        breed: '狸花猫',
        location: '北京市丰台区',
        statusText: '待领养',
        urgent: false
      }
    ],
    stats: {
      rescued: 10,
      adopted: 12,
      volunteers: 50
    },
    urgentCats: [
      {
        _id: 'demo1',
        name: '小橘',
        image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop',
        age: '2岁',
        breed: '橘猫',
        statusText: '待领养',
        urgent: true
      },
      {
        _id: 'demo3',
        name: '小黑',
        image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop',
        age: '3岁',
        breed: '黑猫',
        statusText: '待领养',
        urgent: false
      },
      {
        _id: 'demo5',
        name: '咪咪',
        image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=400&fit=crop',
        age: '2.5岁',
        breed: '狸花猫',
        statusText: '待领养',
        urgent: false
      },
      {
        _id: 'demo2',
        name: '小白',
        image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&h=400&fit=crop',
        age: '1岁',
        breed: '英短',
        statusText: '治疗中',
        urgent: false
      }
    ]
  },

  onLoad() {
    const pages = getCurrentPages()
    const currentPath = pages[pages.length - 1].route
    const greeting = this.getGreeting()
    const greetingSub = this.getGreetingSub()
    const userInfo = wx.getStorageSync('userInfo') || null
    
    this.setData({ 
      currentPath,
      greeting,
      greetingSub,
      userInfo
    })

    this.getLocation()
    this.loadAllData()
    this.loadTodos()
  },

  loadTodos() {
    const todos = [
      { id: 1, type: 'feeding', icon: '🍱', title: '投喂打卡', desc: '今天还没有投喂猫咪哦', done: false, action: 'feedingCheckin' },
      { id: 2, type: 'visit', icon: '🏥', title: '猫咪复查', desc: '小花需要复查伤口', done: false, action: 'catProfiles' },
      { id: 3, type: 'adopt', icon: '🏠', title: '领养审核', desc: '有 2 条待审核的领养申请', done: false, action: 'community' }
    ]
    const todoCount = todos.filter(t => !t.done).length
    this.setData({ todos, todoCount })
  },

  onTodoTap(e) {
    const item = e.currentTarget.dataset.item
    if (item.done) return
    
    switch (item.action) {
      case 'feedingCheckin':
        this.onFeedingCheckin()
        break
      case 'catProfiles':
        this.onCatProfiles()
        break
      case 'community':
        wx.switchTab({ url: '/pages/features/community/community' })
        break
    }
  },

  getGreeting() {
    const hour = new Date().getHours()
    if (hour < 6) return '夜深了'
    if (hour < 9) return '早安'
    if (hour < 12) return '上午好'
    if (hour < 14) return '中午好'
    if (hour < 18) return '下午好'
    if (hour < 22) return '晚上好'
    return '夜深了'
  },

  getGreetingSub() {
    const subs = [
      '今天有 3 只小可爱等你来看',
      '愿你被温柔以待，如猫咪般自在',
      '每一份爱心，都是流浪猫的希望',
      '今天的阳光，和猫咪一样温暖',
      '感谢你的每一份善意'
    ]
    return subs[Math.floor(Math.random() * subs.length)]
  },

  onShow() {
    const userInfo = wx.getStorageSync('userInfo') || null
    if (userInfo) {
      this.setData({ userInfo })
    }
  },

  loadAllData() {
    this.loadRiskAreas()
    this.loadBannerCats()
    this.loadStats()
    this.loadUrgentCats()
  },

  loadRiskAreas() {
    try {
      db.collection('risks').where({ status: 'published' }).orderBy('createTime', 'desc').limit(20).get({
        success: (res) => {
          const risks = res.data || []
          const markers = risks.map(risk => ({
            id: risk._id,
            longitude: risk.location?.longitude || 116.397428,
            latitude: risk.location?.latitude || 39.90923,
            width: 30,
            height: 30
          }))
          this.setData({ riskAreas: risks, markers })
        }
      })
    } catch (error) {}
  },

  loadBannerCats() {
    db.collection('cats')
      .where({ status: _.in(['available', 'treatment']) })
      .orderBy('createTime', 'desc')
      .limit(5)
      .get({
        success: (res) => {
          const cats = res.data || []
          if (cats.length > 0) {
            const bannerCats = cats.map(cat => ({
              _id: cat._id,
              id: cat._id,
              name: cat.name || '未知',
              image: cat.photos && cat.photos[0] || '',
              age: cat.age || '未知',
              breed: cat.breed || '未知',
              location: cat.location || '未知',
              statusText: this.getStatusText(cat.status),
              urgent: cat.urgent || false
            }))
            this.setData({ bannerCats })
          }
        },
        fail: (err) => {
          console.log('加载banner失败，使用默认数据', err)
        }
      })
  },

  getStatusText(status) {
    const statusMap = {
      'available': '待领养',
      'treatment': '治疗中',
      'adopted': '已领养',
      'foster': '寄养中',
      'deceased': '已离世'
    }
    return statusMap[status] || '待领养'
  },

  loadStats() {
    Promise.all([
      db.collection('cats').count(),
      db.collection('cats').where({ status: 'adopted' }).count(),
      db.collection('users').count()
    ]).then(([totalRes, adoptedRes, usersRes]) => {
      this.setData({
        stats: {
          rescued: totalRes.total || 0,
          adopted: adoptedRes.total || 0,
          volunteers: usersRes.total || 0
        }
      })
    }).catch(err => {
      console.log('加载统计失败', err)
    })
  },

  loadUrgentCats() {
    db.collection('cats')
      .where({ 
        status: _.in(['available', 'treatment'])
      })
      .orderBy('createTime', 'desc')
      .limit(4)
      .get({
        success: (res) => {
          const cats = res.data || []
          if (cats.length > 0) {
            const urgentCats = cats.map(cat => ({
              _id: cat._id,
              name: cat.name || '未知',
              image: cat.photos && cat.photos[0] || '',
              age: cat.age || '未知',
              breed: cat.breed || '未知',
              statusText: this.getStatusText(cat.status),
              urgent: cat.urgent || false
            }))
            this.setData({ urgentCats })
          }
        },
        fail: (err) => {
          console.log('加载紧急猫咪失败', err)
        }
      })
  },

  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({ longitude: res.longitude, latitude: res.latitude })
        app.globalData.userLocation = { longitude: res.longitude, latitude: res.latitude }
      }
    })
  },

  onBannerTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/core/cat-detail/cat-detail?id=${id}` })
  },

  onPublish() {
    wx.navigateTo({ url: '/pages/core/publish/publish' })
  },

  onDonation() {
    wx.showModal({
      title: '❤️ 爱心捐赠',
      content: '感谢您想为流浪猫提供帮助！\n\n您可以通过以下方式支持我们：\n💰 捐款购买猫粮\n🏥 赞助医疗费用\n📦 捐赠物资\n\n请联系我们了解详情：\n📧 a229941302@163.com',
      confirmText: '复制邮箱',
      confirmColor: '#4CAF50',
      cancelText: '稍后再说',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({ data: 'a229941302@163.com', success: () => wx.showToast({ title: '邮箱已复制', icon: 'success' }) })
        }
      }
    })
  },

  onFeedingCheckin() {
    wx.navigateTo({ url: '/pages/features/feeding-checkin/feeding-checkin' })
  },

  onCatMatch() {
    wx.navigateTo({ url: '/pages/features/cat-match/cat-match' })
  },

  onTNR() {
    wx.navigateTo({ url: '/pages/features/tnr/tnr' })
  },

  onReport() {
    wx.navigateTo({ url: '/pages/features/protection/protection' })
  },

  onCatProfiles() {
    wx.navigateTo({ url: '/pages/core/cat-profiles/cat-profiles' })
  },

  onCatDetail(e) {
    wx.navigateTo({ url: '/pages/core/cat-profiles/cat-profiles' })
  },

  onShareAppMessage() {
    return {
      title: '咪咪守护站 - 用爱守护每一只流浪猫 🐾',
      path: '/pages/core/index/index',
      imageUrl: ''
    }
  }
})
