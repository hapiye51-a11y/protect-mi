// 消息通知页面
Page({
  data: {
    activeTab: 'all',
    notifications: [],
    loading: true
  },

  onLoad: function() {
    this.loadNotifications()
  },

  onShow: function() {
    this.loadNotifications()
  },

  // 加载通知数据
  loadNotifications: function() {
    // TODO: 从云数据库加载真实数据
    // 目前使用模拟数据
    var mockData = [
      {
        id: '1',
        type: 'like',
        title: '有人赞了你的动态',
        content: '用户"猫咪爱好者"赞了你的动态"今天在小区发现了一只橘猫"',
        time: '2分钟前',
        isRead: false,
        avatar: '/images/default-avatar.png'
      },
      {
        id: '2',
        type: 'comment',
        title: '有人评论了你的发布',
        content: '用户"爱猫人士"评论了："这只猫好可爱，希望能找到好主人"',
        time: '1小时前',
        isRead: false,
        avatar: '/images/default-avatar.png'
      },
      {
        id: '3',
        type: 'follow',
        title: '有新的关注者',
        content: '用户"流浪猫救助站"关注了你',
        time: '3小时前',
        isRead: true,
        avatar: '/images/default-avatar.png'
      },
      {
        id: '4',
        type: 'system',
        title: '系统通知',
        content: '恭喜你升级为"守护达人"，感谢你对流浪猫救助的贡献！',
        time: '昨天',
        isRead: true,
        avatar: '/images/default-avatar.png'
      },
      {
        id: '5',
        type: 'adopt',
        title: '领养申请',
        content: '用户"小王"申请领养你发布的猫咪"小橘"',
        time: '2天前',
        isRead: true,
        avatar: '/images/default-avatar.png'
      }
    ]

    this.setData({
      notifications: mockData,
      loading: false
    })
  },

  // 切换标签
  switchTab: function(e) {
    var tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
    // TODO: 根据标签筛选通知
  },

  // 点击通知
  tapNotification: function(e) {
    var id = e.currentTarget.dataset.id
    var notification = this.data.notifications.find(function(n) {
      return n.id === id
    })
    
    if (!notification) return

    // 标记为已读
    var notifications = this.data.notifications
    var index = notifications.findIndex(function(n) {
      return n.id === id
    })
    if (index !== -1) {
      notifications[index].isRead = true
      this.setData({ notifications: notifications })
    }

    // 根据类型跳转
    switch (notification.type) {
      case 'like':
      case 'comment':
        wx.navigateTo({ url: '/pages/features/moment-detail/moment-detail?id=' + id })
        break
      case 'follow':
        // TODO: 跳转到用户主页
        break
      case 'adopt':
        wx.navigateTo({ url: '/pages/core/cat-detail/cat-detail?id=' + id })
        break
      case 'system':
        // 系统通知暂不跳转
        break
    }
  },

  // 全部已读
  markAllRead: function() {
    var notifications = this.data.notifications.map(function(n) {
      n.isRead = true
      return n
    })
    this.setData({ notifications: notifications })
    wx.showToast({ title: '已全部标记为已读', icon: 'success' })
  },

  // 清空通知
  clearAll: function() {
    var that = this
    wx.showModal({
      title: '清空通知',
      content: '确定要清空所有通知吗？',
      confirmColor: '#FF5252',
      success: function(res) {
        if (res.confirm) {
          that.setData({ notifications: [] })
          wx.showToast({ title: '已清空', icon: 'success' })
        }
      }
    })
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadNotifications()
    wx.stopPullDownRefresh()
  }
})
