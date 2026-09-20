// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    
    // 初始化云开发
    wx.cloud.init({
      env: 'cloud1-3gsdlfu2be3d6b64', // 替换为你的云开发环境ID
      traceUser: true,
    })
  },
  
  globalData: {
    userInfo: null,
    openid: null,
    // 其他全局数据
  }
})