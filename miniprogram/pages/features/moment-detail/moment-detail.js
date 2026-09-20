// 动态详情页
Page({
  data: {
    momentId: '',
    moment: {},
    comments: [],
    myComment: '',
    replyToId: '',
    replyToAuthor: ''
  },

  onLoad: function(options) {
    this.setData({ momentId: options.id })
    this.loadMoment(options.id)
  },

  loadMoment: function(id) {
    // 从上一页获取动态数据
    var pages = getCurrentPages()
    var prevPage = pages[pages.length - 2]
    if (prevPage && prevPage.data.catMoments) {
      var moments = prevPage.data.catMoments
      for (var i = 0; i < moments.length; i++) {
        if (moments[i].id === id) {
          this.setData({ 
            moment: moments[i],
            comments: moments[i].commentList || []
          })
          break
        }
      }
    }

    // 如果没有找到，使用默认数据
    if (!this.data.moment.content) {
      this.setData({
        moment: {
          id: id,
          username: '守护咪用户',
          time: '刚刚',
          content: '这是一条动态',
          likes: 0,
          liked: false
        },
        comments: []
      })
    }
  },

  setMyComment: function(e) {
    this.setData({ myComment: e.detail.value })
  },

  likeMoment: function() {
    var moment = this.data.moment
    moment.liked = !moment.liked
    moment.likes += moment.liked ? 1 : -1
    this.setData({ moment: moment })
    this.updatePrevPage()
  },

  replyTo: function(e) {
    var id = e.currentTarget.dataset.id
    var author = e.currentTarget.dataset.author
    this.setData({ 
      replyToId: id,
      replyToAuthor: author
    })
  },

  likeComment: function(e) {
    var id = e.currentTarget.dataset.id
    var comments = this.data.comments
    for (var i = 0; i < comments.length; i++) {
      if (comments[i].id === id) {
        comments[i].liked = !comments[i].liked
        comments[i].likes += comments[i].liked ? 1 : -1
        break
      }
    }
    this.setData({ comments: comments })
    this.updatePrevPage()
  },

  submitComment: function() {
    var that = this

    if (!this.data.myComment.trim()) {
      wx.showToast({ title: '请输入内容', icon: 'none' })
      return
    }

    // 如果是回复某条评论
    if (this.data.replyToId) {
      var reply = {
        id: 'r' + Date.now(),
        author: '我',
        toAuthor: this.data.replyToAuthor,
        content: this.data.myComment
      }

      var comments = this.data.comments
      for (var i = 0; i < comments.length; i++) {
        if (comments[i].id === that.data.replyToId) {
          if (!comments[i].replies) {
            comments[i].replies = []
          }
          comments[i].replies.push(reply)
          break
        }
      }

      this.setData({ 
        comments: comments,
        myComment: '',
        replyToId: '',
        replyToAuthor: ''
      })

    } else {
      // 新评论
      var newComment = {
        id: 'c' + Date.now(),
        author: '我',
        time: '刚刚',
        content: this.data.myComment,
        likes: 0,
        liked: false,
        replies: []
      }

      var comments = this.data.comments
      comments.unshift(newComment)
      this.setData({ 
        comments: comments,
        myComment: ''
      })
    }

    // 更新评论数
    var moment = this.data.moment
    moment.comments = comments.length
    this.setData({ moment: moment })

    this.updatePrevPage()
    wx.showToast({ title: '发送成功', icon: 'success' })
  },

  updatePrevPage: function() {
    var pages = getCurrentPages()
    var prevPage = pages[pages.length - 2]
    if (prevPage && prevPage.data.catMoments) {
      var moments = prevPage.data.catMoments
      for (var i = 0; i < moments.length; i++) {
        if (moments[i].id === this.data.momentId) {
          moments[i] = this.data.moment
          moments[i].commentList = this.data.comments
          moments[i].comments = this.data.comments.length
          break
        }
      }
      prevPage.setData({ catMoments: moments })
    }
  },

  previewImage: function(e) {
    var url = e.currentTarget.dataset.url
    wx.previewImage({
      current: url,
      urls: this.data.moment.images || []
    })
  }
})
