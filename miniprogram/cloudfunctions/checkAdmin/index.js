const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    // 查询 admins 集合中是否有该 openid
    const result = await db.collection('admins')
      .where({
        _openid: openid
      })
      .count()

    return {
      openid: openid,
      isAdmin: result.total > 0
    }
  } catch (err) {
    console.error('checkAdmin error:', err)
    return {
      openid: openid,
      isAdmin: false,
      error: err.message
    }
  }
}
