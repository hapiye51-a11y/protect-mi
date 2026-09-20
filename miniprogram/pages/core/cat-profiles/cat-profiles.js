const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    cats: [],
    adoptedCount: 0,
    treatmentCount: 0,
    pendingCount: 0,
    filterType: 'all',
    loading: false
  },

  onLoad() {
    console.log('猫咪档案页面加载')
    this.loadCatProfiles()
  },

  onShow() {
    console.log('猫咪档案页面显示')
  },

  onPullDownRefresh() {
    this.loadCatProfiles()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  // 加载猫咪档案
  loadCatProfiles() {
    this.setData({ loading: true })

    wx.showLoading({ title: '加载中...', mask: true })

    // 获取当前用户信息
    const userInfo = wx.getStorageSync('userInfo') || {}

    // 从云数据库读取猫咪档案（包括待审核的）
    db.collection('cats')
      .orderBy('createTime', 'desc')
      .limit(100)
      .get({
        success: (res) => {
          let cats = res.data || []
          
          // 如果没有数据，使用示例数据
          if (cats.length === 0) {
            cats = this.getDefaultCats()
          }
          
          console.log('猫咪档案加载成功:', cats.length, '只')

          // 格式化数据
          cats.forEach(cat => {
            const statusMap = {
              'pending': '待审核',
              'available': '待领养',
              'adopted': '已领养',
              'treatment': '治疗中',
              'foster': '寄养中',
              'deceased': '已离世',
              'rejected': '审核未通过'
            }
            cat.statusText = statusMap[cat.status] || '待领养'
            
            // 判断是否是当前用户创建的（用于显示编辑按钮）
            cat.isOwner = cat._openid === userInfo.openid || 
                          cat.reporter?.openid === userInfo.openid ||
                          (userInfo.nickName && cat.reporter?.nickName === userInfo.nickName)
            
            // 处理图片字段（兼容 photos 和 image）
            if (cat.photos && cat.photos.length > 0) {
              cat.avatar = cat.photos[0]
            } else if (!cat.image) {
              cat.avatar = ''
            }
            
            // 默认渐变背景色
            if (!cat.bgColor) {
              const colors = [
                'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                'linear-gradient(135deg, #607D8B 0%, #455A64 100%)',
                'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
                'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)'
              ]
              cat.bgColor = colors[Math.floor(Math.random() * colors.length)]
            }
            
            // 格式化救助日期
            if (cat.rescueDate) {
              const d = new Date(cat.rescueDate)
              cat.rescueDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            } else if (cat.createTime) {
              const d = new Date(cat.createTime)
              cat.rescueDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            }
          })

          // 计算统计数据（不包括待审核）
          const publishedCats = cats.filter(cat => cat.status !== 'pending' && cat.status !== 'rejected')
          const adoptedCount = publishedCats.filter(cat => cat.status === 'adopted').length
          const treatmentCount = publishedCats.filter(cat => cat.status === 'treatment').length
          const pendingCount = cats.filter(cat => cat.status === 'pending').length

          this.setData({
            cats,
            allCats: cats,
            adoptedCount,
            treatmentCount,
            pendingCount,
            loading: false
          })

          wx.hideLoading()
        },
        fail: (err) => {
          console.error('猫咪档案加载失败:', err)
          this.setData({ loading: false })
          wx.hideLoading()
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          })
        }
      })
  },

  // 切换筛选类型
  switchFilter(e) {
    const type = e.currentTarget.dataset.type
    let filteredCats = this.data.allCats

    if (type !== 'all') {
      filteredCats = this.data.allCats.filter(cat => cat.status === type)
    }

    this.setData({
      filterType: type,
      cats: filteredCats
    })
  },

  // 查看猫咪详情
  onCatDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/core/cat-detail/cat-detail?id=${id}`
    })
  },

  // 申请领养
  onAdopt(e) {
    const id = e.currentTarget.dataset.id
    const cat = this.data.cats.find(c => c._id === id)

    if (!cat) return

    // 检查登录状态
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.nickName) {
      wx.showModal({
        title: '请先登录',
        content: '申请领养需要登录，是否前往登录？',
        confirmText: '去登录',
        confirmColor: '#4CAF50',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/user/login/login' })
          }
        }
      })
      return
    }

    wx.showModal({
      title: '申请领养 ' + cat.name,
      content: '申请领养需要：\n\n1. 填写领养申请表\n2. 提供家庭环境照片\n3. 承诺善待猫咪\n4. 定期反馈猫咪状况\n\n确定要申请领养吗？',
      confirmText: '立即申请',
      confirmColor: '#FF9800',
      cancelText: '再想想',
      success: (res) => {
        if (res.confirm) {
          // 保存领养申请到云数据库
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
                        wx.showToast({
                          title: '邮箱已复制',
                          icon: 'success'
                        })
                      }
                    })
                  }
                }
              })
            },
            fail: (err) => {
              console.error('申请保存失败:', err)
              wx.showToast({
                title: '申请失败',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },

  // 添加猫咪档案
  onAddCat() {
    wx.navigateTo({
      url: '/pages/user/cat-edit/cat-edit'
    })
  },

  // 编辑猫咪
  onEdit(e) {
    const id = e.currentTarget.dataset.id
    const cat = this.data.cats.find(c => c._id === id)

    if (!cat) return

    wx.navigateTo({
      url: `/pages/user/cat-edit/cat-edit?id=${id}`
    })
  },

  // 删除猫咪档案
  onDeleteCat(e) {
    const id = e.currentTarget.dataset.id
    const cat = this.data.cats.find(c => c._id === id)

    if (!cat) return

    wx.showModal({
      title: '确认删除',
      content: `确定要删除"${cat.name}"的档案吗？删除后无法恢复。`,
      confirmText: '删除',
      confirmColor: '#FF5252',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.deleteCat(id)
        }
      }
    })
  },

  // 执行删除
  deleteCat(id) {
    wx.showLoading({ title: '删除中...', mask: true })

    db.collection('cats')
      .doc(id)
      .remove({
        success: () => {
          wx.hideLoading()
          wx.showToast({
            title: '已删除',
            icon: 'success'
          })
          // 重新加载列表
          this.loadCatProfiles()
        },
        fail: (err) => {
          wx.hideLoading()
          console.error('删除失败:', err)
          wx.showToast({
            title: '删除失败',
            icon: 'none'
          })
        }
      })
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '守护咪 - 猫咪档案 🐱',
      path: '/pages/core/cat-profiles/cat-profiles',
      imageUrl: ''
    }
  },

  // 默认示例数据
  getDefaultCats() {
    return [
      {
        _id: 'demo1',
        name: '小橘',
        gender: 'male',
        age: '2岁',
        breed: '橘猫',
        color: '橘色',
        status: 'available',
        statusText: '待领养',
        isNeutered: true,
        location: '朝阳区',
        rescueDate: '2024-01-15',
        image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop'
      },
      {
        _id: 'demo2',
        name: '小白',
        gender: 'female',
        age: '1岁',
        breed: '英短',
        color: '白色',
        status: 'treatment',
        statusText: '治疗中',
        isNeutered: false,
        location: '海淀区',
        rescueDate: '2024-02-20',
        image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&h=400&fit=crop'
      },
      {
        _id: 'demo3',
        name: '小黑',
        gender: 'male',
        age: '3岁',
        breed: '黑猫',
        color: '黑色',
        status: 'available',
        statusText: '待领养',
        isNeutered: true,
        location: '西城区',
        rescueDate: '2023-12-10',
        image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop'
      },
      {
        _id: 'demo4',
        name: '花花',
        gender: 'female',
        age: '1.5岁',
        breed: '三花猫',
        color: '三花',
        status: 'adopted',
        statusText: '已领养',
        isNeutered: true,
        location: '东城区',
        rescueDate: '2023-11-05',
        image: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400&h=400&fit=crop'
      },
      {
        _id: 'demo5',
        name: '咪咪',
        gender: 'male',
        age: '2.5岁',
        breed: '狸花猫',
        color: '狸花',
        status: 'available',
        statusText: '待领养',
        isNeutered: true,
        location: '丰台区',
        rescueDate: '2024-01-20',
        image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=400&fit=crop'
      }
    ]
  }
})
