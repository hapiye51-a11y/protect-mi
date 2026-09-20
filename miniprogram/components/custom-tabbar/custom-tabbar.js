Component({
  properties: {
    currentPath: {
      type: String,
      value: ''
    }
  },

  data: {
    list: [
      {
        pagePath: 'pages/core/index/index',
        text: '首页',
        icon: '🏠'
      },
      {
        pagePath: 'pages/core/map/map',
        text: '地图',
        icon: '🗺️'
      },
      {
        pagePath: 'pages/core/publish/publish',
        text: '发布',
        icon: '📢',
        isCenter: true
      },
      {
        pagePath: 'pages/features/community/community',
        text: '社区',
        icon: '💬'
      },
      {
        pagePath: 'pages/core/profile/profile',
        text: '我的',
        icon: '👤'
      }
    ]
  },

  methods: {
    switchTab(e) {
      const path = e.currentTarget.dataset.path
      const currentPath = this.data.currentPath

      if (path === currentPath) return

      wx.switchTab({
        url: '/' + path
      })
    }
  }
})
