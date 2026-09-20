// 排行榜页面
const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({
  data: {
    currentTab: 0,
    tabs: ['月度榜', '总榜', '投喂榜', '捐赠榜'],
    leaderboard: [],
    myRank: null,
    loading: false
  },

  onLoad() {
    this.loadLeaderboard()
  },

  onShow() {},

  // 切换Tab
  onTabChange(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    this.setData({ currentTab: index })
    this.loadLeaderboard()
  },

  // 加载榜单数据
  loadLeaderboard() {
    this.setData({ loading: true })
    
    const tabIndex = this.data.currentTab
    
    switch(tabIndex) {
      case 0:
        this.loadMonthlyRank()
        break
      case 1:
        this.loadTotalRank()
        break
      case 2:
        this.loadFeedingRank()
        break
      case 3:
        this.loadDonationRank()
        break
    }
  },

  // 月度榜（本月救助数量）
  loadMonthlyRank() {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    db.collection('rescues')
      .where({
        createTime: _.gte(monthStart)
      })
      .get({
        success: (res) => {
          const records = res.data || []
          const userStats = this.groupByUser(records, 'createTime')
          this.setData({
            leaderboard: userStats,
            loading: false
          })
        },
        fail: () => {
          this.setData({
            leaderboard: this.getMockLeaderboard(),
            loading: false
          })
        }
      })
  },

  // 总榜（累计救助数量）
  loadTotalRank() {
    db.collection('users')
      .orderBy('rescueCount', 'desc')
      .limit(20)
      .get({
        success: (res) => {
          const users = (res.data || []).map((user, index) => ({
            rank: index + 1,
            name: user.nickName || '爱心用户',
            avatar: user.avatarUrl || '',
            count: user.rescueCount || 0,
            badge: index < 3 ? ['🥇', '🥈', '🥉'][index] : ''
          }))
          this.setData({
            leaderboard: users,
            loading: false
          })
        },
        fail: () => {
          this.setData({
            leaderboard: this.getMockLeaderboard(),
            loading: false
          })
        }
      })
  },

  // 投喂榜
  loadFeedingRank() {
    db.collection('checkins')
      .where({ type: 'feeding' })
      .get({
        success: (res) => {
          const records = res.data || []
          const userStats = this.groupByUser(records, 'catsCount')
          this.setData({
            leaderboard: userStats,
            loading: false
          })
        },
        fail: () => {
          this.setData({
            leaderboard: this.getMockLeaderboard(),
            loading: false
          })
        }
      })
  },

  // 捐赠榜
  loadDonationRank() {
    db.collection('donations')
      .orderBy('amount', 'desc')
      .limit(20)
      .get({
        success: (res) => {
          const donations = (res.data || []).map((item, index) => ({
            rank: index + 1,
            name: item.username || '爱心人士',
            avatar: item.avatar || '',
            count: item.amount || 0,
            badge: index < 3 ? ['🥇', '🥈', '🥉'][index] : ''
          }))
          this.setData({
            leaderboard: donations,
            loading: false
          })
        },
        fail: () => {
          this.setData({
            leaderboard: this.getMockLeaderboard(),
            loading: false
          })
        }
      })
  },

  // 按用户分组统计
  groupByUser(records, countField) {
    const userMap = {}
    
    records.forEach(record => {
      const userId = record._openid || record.userId || 'anonymous'
      if (!userMap[userId]) {
        userMap[userId] = {
          count: 0,
          name: record.username || '爱心用户',
          avatar: record.avatar || record.avatarUrl || ''
        }
      }
      
      if (countField === 'catsCount') {
        userMap[userId].count += record.catsCount || 1
      } else {
        userMap[userId].count += 1
      }
    })
    
    const sorted = Object.values(userMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
      .map((user, index) => ({
        rank: index + 1,
        name: user.name,
        avatar: user.avatar,
        count: user.count,
        badge: index < 3 ? ['🥇', '🥈', '🥉'][index] : ''
      }))
    
    return sorted
  },

  // 获取模拟榜单数据（兜底）
  getMockLeaderboard() {
    const names = ['爱心使者', '猫咪守护者', '温暖天使', '救助先锋', '爱心达人', '投喂专家', '志愿之星', '爱心大使', '守护英雄', '温暖使者']
    
    return names.map((name, index) => ({
      rank: index + 1,
      name: name,
      count: Math.floor(Math.random() * 100) + 50,
      avatar: '',
      badge: index < 3 ? ['🥇', '🥈', '🥉'][index] : ''
    }))
  },

  // 查看用户详情
  onUserTap(e) {
    const user = e.currentTarget.dataset.user
    wx.showModal({
      title: `${user.badge || ''} ${user.name}`,
      content: `救助次数：${user.count}次\n\n感谢您的爱心付出！`,
      showCancel: false,
      confirmText: '点赞',
      confirmColor: '#FF9800'
    })
  },

  // 分享榜单
  onShare() {
    wx.showModal({
      title: '分享榜单',
      content: '邀请好友一起为流浪猫献爱心！',
      confirmText: '分享给好友',
      confirmColor: '#FF9800',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '分享功能开发中',
            icon: 'none'
          })
        }
      }
    })
  },

  onShareAppMessage() {
    return {
      title: '守护咪 - 爱心排行榜 🏆',
      path: '/pages/features/leaderboard/leaderboard'
    }
  }
})
