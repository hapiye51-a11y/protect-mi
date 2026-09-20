/**
 * 权限管理工具
 * 用于检查用户是否有编辑权限
 */

const db = wx.cloud.database()

/**
 * 检查用户是否是管理员
 * @returns {Promise<boolean>}
 */
function isAdmin() {
  return new Promise((resolve) => {
    wx.cloud.callFunction({
      name: 'checkAdmin',
      success: (res) => {
        resolve(res.result && res.result.isAdmin)
      },
      fail: () => {
        resolve(false)
      }
    })
  })
}

/**
 * 检查用户是否有权限编辑猫咪档案
 * @param {Object} cat - 猫咪数据对象
 * @param {string} cat._openid - 创建者 openid
 * @returns {Promise<boolean>}
 */
function canEditCat(cat) {
  return new Promise((resolve) => {
    if (!cat) {
      resolve(false)
      return
    }

    // 获取当前用户 openid
    wx.cloud.callFunction({
      name: 'getOpenId',
      success: (res) => {
        const currentOpenId = res.result && res.result.openid
        
        if (!currentOpenId) {
          resolve(false)
          return
        }

        // 创建者有权限
        if (cat._openid === currentOpenId) {
          resolve(true)
          return
        }

        // 检查是否是管理员
        checkIsAdmin(currentOpenId).then(resolve)
      },
      fail: () => {
        resolve(false)
      }
    })
  })
}

/**
 * 检查 openid 是否在管理员列表中
 * @param {string} openid 
 * @returns {Promise<boolean>}
 */
function checkIsAdmin(openid) {
  return new Promise((resolve) => {
    db.collection('admins')
      .where({
        _openid: openid
      })
      .count({
        success: (res) => {
          resolve(res.total > 0)
        },
        fail: () => {
          resolve(false)
        }
      })
  })
}

/**
 * 获取当前用户 openid
 * @returns {Promise<string>}
 */
function getCurrentOpenId() {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'getOpenId',
      success: (res) => {
        resolve(res.result && res.result.openid)
      },
      fail: reject
    })
  })
}

module.exports = {
  isAdmin,
  canEditCat,
  checkIsAdmin,
  getCurrentOpenId
}
