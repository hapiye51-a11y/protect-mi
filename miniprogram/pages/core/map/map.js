const app = getApp()

Page({
  data: {
    // 地图中心点
    longitude: 116.397428,
    latitude: 39.90923,
    scale: 14,

    // 地图标记点
    markers: [],

    // 当前选中的标记
    selectedMarker: null,

    // 风险区域数据
    riskAreas: [
      {
        id: 1,
        longitude: 116.397428,
        latitude: 39.90923,
        level: 'low',
        levelText: '低危',
        levelColor: '#FFC107',
        width: 30,
        height: 30,
        title: '朝阳公园附近',
        description: '监控缺失，建议加强巡逻',
        reportCount: 2,
        lastUpdate: '2小时前'
      },
      {
        id: 2,
        longitude: 116.400428,
        latitude: 39.91123,
        level: 'medium',
        levelText: '中危',
        levelColor: '#FF9800',
        width: 30,
        height: 30,
        title: 'XX小区周边',
        description: '发现过陷阱，请注意',
        reportCount: 5,
        lastUpdate: '1天前'
      },
      {
        id: 3,
        longitude: 116.394428,
        latitude: 39.90623,
        level: 'high',
        levelText: '高危',
        levelColor: '#FF5252',
        width: 30,
        height: 30,
        title: 'XX路交汇处',
        description: '确证虐猫案件，严禁接近',
        reportCount: 12,
        lastUpdate: '3小时前'
      }
    ],

    // 流浪猫点位数据
    catLocations: [
      {
        id: 11,
        longitude: 116.398,
        latitude: 39.909,
        type: 'cat',
        width: 30,
        height: 30,
        title: '小橘投喂点',
        description: '友善的橘猫，每天早晚出现',
        catCount: 3,
        hasFeeder: true
      },
      {
        id: 12,
        longitude: 116.396,
        latitude: 39.911,
        type: 'cat',
        width: 30,
        height: 30,
        title: '三花聚集地',
        description: '5-6只流浪猫定点投喂',
        catCount: 6,
        hasFeeder: true
      }
    ],

    // 救助点位数据
    rescueLocations: [
      {
        id: 21,
        longitude: 116.399,
        latitude: 39.908,
        type: 'rescue',
        width: 30,
        height: 30,
        title: '紧急救助中',
        description: '小黑受伤需要救助',
        status: 'urgent',
        reportTime: '30分钟前'
      }
    ],

    // 底部面板显示状态
    showPanel: false,
    panelData: null,

    // 雷达菜单显示状态
    showMenu: false,

    // 筛选条件
    filterType: 'all', // all, risk, cat, rescue

    // 统计数据
    stats: {
      totalMarkers: 0,
      highRisk: 0,
      catPoints: 0,
      rescuePoints: 0
    }
  },

  onLoad() {
    console.log('守护雷达页面加载')
    this.initMap()
  },

  onShow() {
    console.log('守护雷达页面显示')
    // 每次显示时重新加载用户上报数据
    this.loadUserReports()
  },

  // 初始化地图
  initMap() {
    // 获取用户位置
    this.getUserLocation()

    // 加载用户上报数据
    this.loadUserReports()

    // 加载所有标记
    this.loadAllMarkers()

    // 计算统计数据
    this.calculateStats()
  },

  // 获取用户位置
  getUserLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          longitude: res.longitude,
          latitude: res.latitude
        })

        // 保存到全局
        if (app.globalData) {
          app.globalData.userLocation = {
            longitude: res.longitude,
            latitude: res.latitude
          }
        }
      },
      fail: (err) => {
        console.error('获取位置失败:', err)
        wx.showToast({
          title: '获取位置失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  // 加载所有标记点
  loadAllMarkers() {
    const { riskAreas, catLocations, rescueLocations, filterType } = this.data
    let markers = []

    // 根据筛选条件加载标记
    if (filterType === 'all' || filterType === 'risk') {
      markers = markers.concat(riskAreas.map((area, index) => ({
        id: area.id,
        longitude: area.longitude,
        latitude: area.latitude,
        iconPath: this.getMarkerIcon(area.level),
        width: area.width,
        height: area.height,
        callout: {
          content: `${area.levelText} - ${area.title}`,
          color: '#333333',
          fontSize: 12,
          borderRadius: 8,
          bgColor: this.getCalloutBgByLevel(area.level),
          padding: 8,
          display: 'BYCLICK'
        },
        data: area
      })))
    }

    if (filterType === 'all' || filterType === 'cat') {
      markers = markers.concat(catLocations.map(cat => ({
        id: cat.id,
        longitude: cat.longitude,
        latitude: cat.latitude,
        width: cat.width,
        height: cat.height,
        callout: {
          content: `🐱 ${cat.title}`,
          color: '#333333',
          fontSize: 12,
          borderRadius: 8,
          bgColor: '#E8F5E9',
          padding: 8,
          display: 'BYCLICK'
        },
        data: cat
      })))
    }

    if (filterType === 'all' || filterType === 'rescue') {
      markers = markers.concat(rescueLocations.map(rescue => ({
        id: rescue.id,
        longitude: rescue.longitude,
        latitude: rescue.latitude,
        width: rescue.width,
        height: rescue.height,
        callout: {
          content: `🆘 ${rescue.title}`,
          color: '#333333',
          fontSize: 12,
          borderRadius: 8,
          bgColor: '#FFEBEE',
          padding: 8,
          display: 'BYCLICK'
        },
        data: rescue
      })))
    }

    this.setData({ markers })
  },

  // 获取标记图标（使用默认图标，可替换为自定义图片）
  getMarkerIcon(level) {
    // 如果有自定义图标，使用图片路径
    // const icons = {
    //   high: '/images/marker-high.png',
    //   medium: '/images/marker-medium.png',
    //   low: '/images/marker-low.png'
    // }
    // return icons[level] || icons.low

    // 使用默认地图标记
    return ''
  },

  // 根据风险等级获取气泡背景色
  getCalloutBgByLevel(level) {
    const colors = {
      low: '#FFF9C4',
      medium: '#FFE0B2',
      high: '#FFCDD2'
    }
    return colors[level] || colors.low
  },

  // 计算统计数据
  calculateStats() {
    const { riskAreas, catLocations, rescueLocations } = this.data

    const stats = {
      totalMarkers: riskAreas.length + catLocations.length + rescueLocations.length,
      highRisk: riskAreas.filter(area => area.level === 'high').length,
      catPoints: catLocations.length,
      rescuePoints: rescueLocations.length
    }

    this.setData({ stats })
  },

  // 标记点击事件
  onMarkerTap(e) {
    const markerId = e.detail.markerId
    const marker = this.data.markers.find(m => m.id === markerId)

    if (marker && marker.data) {
      this.setData({
        showPanel: true,
        panelData: marker.data,
        selectedMarker: marker
      })
    }
  },

  // 关闭底部面板
  closePanel() {
    this.setData({
      showPanel: false,
      panelData: null,
      selectedMarker: null
    })
  },

  // 筛选切换
  switchFilter(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      filterType: type,
      showPanel: false
    })
    this.loadAllMarkers()

    wx.showToast({
      title: this.getFilterText(type),
      icon: 'none',
      duration: 1000
    })
  },

  getFilterText(type) {
    const texts = {
      all: '显示全部',
      risk: '仅显示风险区域',
      cat: '仅显示猫咪点位',
      rescue: '仅显示救助信息'
    }
    return texts[type] || texts.all
  },

  // 移动到我的位置
  moveToMyLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.mapCtx = wx.createMapContext('radarMap', this)
        this.mapCtx.moveToLocation({
          longitude: res.longitude,
          latitude: res.latitude
        })

        this.setData({
          longitude: res.longitude,
          latitude: res.latitude
        })

        wx.showToast({
          title: '已定位到当前位置',
          icon: 'success',
          duration: 1500
        })
      },
      fail: () => {
        wx.showToast({
          title: '定位失败',
          icon: 'none'
        })
      }
    })
  },

  // 添加新标记
  addNewMarker() {
    wx.showActionSheet({
      itemList: ['报告风险区域', '添加猫咪点位', '发布救助信息'],
      itemColor: '#FF9800',
      success: (res) => {
        if (res.tapIndex === 0) {
          // 报告风险区域 - 跳转到上报页面
          wx.navigateTo({
            url: `/pages/features/report-risk/report-risk?latitude=${this.data.latitude}&longitude=${this.data.longitude}`
          })
        } else if (res.tapIndex === 1) {
          // 添加猫咪点位
          wx.showToast({
            title: '猫咪点位功能开发中',
            icon: 'none',
            duration: 2000
          })
        } else if (res.tapIndex === 2) {
          // 发布救助信息
          wx.navigateTo({
            url: '/pages/core/publish/publish'
          })
        }
      }
    })
  },

  // 加载用户上报的数据
  loadUserReports() {
    try {
      const reports = wx.getStorageSync('userReports') || []
      console.log('✅ 加载用户上报数据:', reports.length, '条')
      console.log('📍 上报详情:', reports)

      // 过滤掉现有的用户上报数据，避免重复
      const systemRiskAreas = this.data.riskAreas.filter(area => !area.isUserReport)

      // 转换用户上报数据为风险区域格式
      const userRiskAreas = reports.map(report => ({
        id: report.id,
        longitude: report.longitude,
        latitude: report.latitude,
        level: report.riskLevel,
        levelText: this.getLevelText(report.riskLevel),
        levelColor: this.getLevelColor(report.riskLevel),
        width: 30,
        height: 30,
        title: `用户上报 - ${this.getRiskTypeText(report.riskType)}`,
        description: report.description,
        reportCount: 1,
        lastUpdate: report.reportTime,
        isUserReport: true
      }))

      // 合并系统数据和用户上报数据
      this.setData({
        riskAreas: [...systemRiskAreas, ...userRiskAreas]
      })

      // 重新加载标记
      this.loadAllMarkers()
      this.calculateStats()

      // 如果有用户上报，显示提示
      if (userRiskAreas.length > 0) {
        console.log('🎉 成功加载', userRiskAreas.length, '个用户上报标记')
      }
    } catch (err) {
      console.error('加载用户上报失败:', err)
    }
  },

  // 获取等级文本
  getLevelText(level) {
    const map = {
      high: '高危',
      medium: '中危',
      low: '低危'
    }
    return map[level] || '未知'
  },

  // 获取等级颜色
  getLevelColor(level) {
    const map = {
      high: '#FF5252',
      medium: '#FF9800',
      low: '#FFC107'
    }
    return map[level] || '#999999'
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
    return map[type] || '风险区域'
  },

  // 查看标记详情
  viewMarkerDetail() {
    const { panelData } = this.data

    if (!panelData) return

    let content = ''

    if (panelData.level) {
      // 风险区域
      content = `风险等级：${panelData.levelText}\n`
      content += `描述：${panelData.description}\n`
      content += `举报次数：${panelData.reportCount}次\n`
      content += `最后更新：${panelData.lastUpdate}\n\n`
      content += '⚠️ 请注意安全，避免单独前往'
    } else if (panelData.catCount) {
      // 猫咪点位
      content = `猫咪数量：约${panelData.catCount}只\n`
      content += `投喂状态：${panelData.hasFeeder ? '已有志愿者定点投喂' : '无固定投喂'}\n`
      content += `描述：${panelData.description}\n\n`
      content += '💝 欢迎加入投喂志愿者行列'
    } else if (panelData.status) {
      // 救助信息
      content = `救助状态：${panelData.status === 'urgent' ? '🆘 紧急' : '⏳ 进行中'}\n`
      content += `描述：${panelData.description}\n`
      content += `发布时间：${panelData.reportTime}\n\n`
      content += '请有能力的爱心人士伸出援手'
    }

    wx.showModal({
      title: panelData.title,
      content: content,
      confirmText: '导航前往',
      confirmColor: '#FF9800',
      cancelText: '关闭',
      success: (res) => {
        if (res.confirm) {
          this.navigateToLocation(panelData)
        }
      }
    })
  },

  // 导航到标记位置
  navigateToLocation(location) {
    wx.openLocation({
      latitude: location.latitude,
      longitude: location.longitude,
      name: location.title,
      address: location.description,
      scale: 16
    })
  },

  // 分享地图
  onShareAppMessage() {
    return {
      title: '守护咪 - 守护雷达：实时掌握周边流浪猫动态',
      path: '/pages/core/map/map',
      imageUrl: ''
    }
  },

  // ========== 雷达菜单相关方法 ==========

  // 切换菜单显示/隐藏
  toggleMenu() {
    this.setData({
      showMenu: !this.data.showMenu
    })

    // 如果菜单打开，关闭详情面板
    if (this.data.showMenu && this.data.showPanel) {
      this.closePanel()
    }
  },

  // 周边救助点
  onRescuePoints() {
    this.toggleMenu()
    
    // 切换到救助筛选
    this.setData({
      filterType: 'rescue'
    })
    this.loadAllMarkers()
    
    wx.showToast({
      title: '已切换到救助点',
      icon: 'success',
      duration: 2000
    })
  },

  // 受助猫咪档案
  onCatProfiles() {
    this.toggleMenu()
    wx.navigateTo({
      url: '/pages/core/cat-profiles/cat-profiles'
    })
  },

  // 爱心榜单
  onLeaderboard() {
    this.toggleMenu()
    wx.navigateTo({
      url: '/pages/features/leaderboard/leaderboard'
    })
  },

  // 投喂地图
  onFeedingMap() {
    this.toggleMenu()

    // 切换到猫咪筛选
    this.setData({
      filterType: 'cat'
    })
    this.loadAllMarkers()

    wx.showToast({
      title: '已切换到投喂点位',
      icon: 'success',
      duration: 2000
    })
  },

  // 安全区域
  onSafeZones() {
    this.toggleMenu()

    // 切换到风险筛选
    this.setData({
      filterType: 'risk'
    })
    this.loadAllMarkers()

    wx.showModal({
      title: '🛡️ 安全区域提示',
      content: '地图上已标注所有风险区域：\n\n🔴 高危区域：请勿接近\n🟠 中危区域：谨慎前往\n🟡 低危区域：注意安全\n\n请大家提高警惕，保护好自己和猫咪！',
      confirmText: '知道了',
      confirmColor: '#FF9800',
      showCancel: false
    })
  },

  // 志愿者招募
  onVolunteerRecruit() {
    this.toggleMenu()
    wx.showModal({
      title: '💪 加入我们',
      content: '守护咪志愿者招募中！\n\n我们需要：\n✅ 投喂志愿者\n✅ 救助协调员\n✅ 医疗支持\n✅ 领养审核员\n✅ 社区宣传员\n\n期待你的加入！\n\n联系方式：\n📧 a229941302@163.com\n💬 微信：shouhumi2024',
      confirmText: '复制邮箱',
      confirmColor: '#4CAF50',
      cancelText: '稍后联系',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: 'a229941302@163.com',
            success: () => {
              wx.showToast({
                title: '邮箱已复制',
                icon: 'success',
                duration: 2000
              })
            }
          })
        }
      }
    })
  },

  // 投喂打卡
  onFeedingCheckin() {
    this.toggleMenu()
    wx.navigateTo({
      url: '/pages/features/feeding-checkin/feeding-checkin'
    })
  },

  // 安全路线
  onSafeRoute() {
    this.toggleMenu()
    
    const { riskAreas, latitude, longitude } = this.data
    const highRisk = riskAreas.filter(r => r.level === 'high')
    const mediumRisk = riskAreas.filter(r => r.level === 'medium')
    
    // 构建风险提示
    let riskWarning = ''
    if (highRisk.length > 0) {
      riskWarning = `\n🔴 高危区域 ${highRisk.length} 个，请务必避开！\n`
      highRisk.forEach(r => {
        riskWarning += `  · ${r.title}\n`
      })
    }
    if (mediumRisk.length > 0) {
      riskWarning += `\n🟠 中危区域 ${mediumRisk.length} 个，建议绕行\n`
    }
    
    wx.showModal({
      title: '🛤️ 安全路线',
      content: `已为您分析周边风险区域${riskWarning}\n请选择目的地类型：`,
      confirmText: '救助点',
      confirmColor: '#FF9800',
      cancelText: '投喂点',
      success: (res) => {
        // 获取用户选择的目的地类型
        const destinations = res.confirm ? this.data.rescueLocations : this.data.catLocations
        
        if (destinations.length === 0) {
          wx.showToast({
            title: res.confirm ? '暂无救助点' : '暂无投喂点',
            icon: 'none'
          })
          return
        }
        
        // 找最近的目的地
        let nearest = null
        let minDistance = Infinity
        
        destinations.forEach(dest => {
          const distance = this.calculateDistance(latitude, longitude, dest.latitude, dest.longitude)
          if (distance < minDistance) {
            minDistance = distance
            nearest = dest
          }
        })
        
        if (nearest) {
          // 显示风险提示并导航
          let navWarning = ''
          if (highRisk.length > 0) {
            navWarning = '\n\n⚠️ 注意：路线可能经过风险区域，请保持警惕！'
          }
          
          wx.showModal({
            title: `前往：${nearest.title}`,
            content: `距离约 ${Math.round(minDistance)} 米${navWarning}`,
            confirmText: '开始导航',
            confirmColor: '#4CAF50',
            cancelText: '取消',
            success: (navRes) => {
              if (navRes.confirm) {
                wx.openLocation({
                  latitude: nearest.latitude,
                  longitude: nearest.longitude,
                  name: nearest.title,
                  address: nearest.description,
                  scale: 16
                })
              }
            }
          })
        }
      }
    })
  },
  
  // 计算两点间距离（米）
  calculateDistance(lat1, lng1, lat2, lng2) {
    const rad = Math.PI / 180
    const R = 6371000 // 地球半径（米）
    
    const dLat = (lat2 - lat1) * rad
    const dLng = (lng2 - lng1) * rad
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    
    return R * c
  }
})
