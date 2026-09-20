Page({
  onLoad() {
    // 占位页面，用于 tabBar 中间位置
    // 自动跳转到发布页面
    wx.navigateTo({
      url: '/pages/core/publish/publish'
    })
  }
})
