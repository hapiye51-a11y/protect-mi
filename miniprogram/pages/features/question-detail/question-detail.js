// 问题详情页
Page({
  data: {
    questionId: '',
    question: {},
    answers: [],
    myAnswer: '',
    replyToId: '',
    replyToAuthor: ''
  },

  onLoad: function(options) {
    this.setData({ questionId: options.id })
    this.loadQuestion(options.id)
  },

  loadQuestion: function(id) {
    // 从上一页获取问题数据
    var pages = getCurrentPages()
    var prevPage = pages[pages.length - 2]
    if (prevPage && prevPage.data.questions) {
      var questions = prevPage.data.questions
      for (var i = 0; i < questions.length; i++) {
        if (questions[i].id === id) {
          this.setData({ 
            question: questions[i],
            answers: questions[i].answers || []
          })
          break
        }
      }
    }

    // 如果没有找到，使用默认数据
    if (!this.data.question.question) {
      this.setData({
        question: {
          id: id,
          typeText: '其他',
          question: '这是一个问题',
          author: '匿名用户',
          time: '刚刚',
          content: '问题详情...'
        },
        answers: []
      })
    }
  },

  setMyAnswer: function(e) {
    this.setData({ myAnswer: e.detail.value })
  },

  // 回复某人
  replyTo: function(e) {
    var id = e.currentTarget.dataset.id
    var author = e.currentTarget.dataset.author
    this.setData({ 
      replyToId: id,
      replyToAuthor: author
    })
  },

  // 显示/隐藏回复
  showReplies: function(e) {
    var id = e.currentTarget.dataset.id
    var answers = this.data.answers
    for (var i = 0; i < answers.length; i++) {
      if (answers[i].id === id) {
        answers[i].showReplies = !answers[i].showReplies
        break
      }
    }
    this.setData({ answers: answers })
  },

  submitAnswer: function() {
    var that = this

    if (!this.data.myAnswer.trim()) {
      wx.showToast({ title: '请输入内容', icon: 'none' })
      return
    }

    // 如果是回复某条回答
    if (this.data.replyToId) {
      var reply = {
        id: 'r' + Date.now(),
        author: '我',
        toAuthor: this.data.replyToAuthor,
        content: this.data.myAnswer,
        time: '刚刚'
      }

      var answers = this.data.answers
      for (var i = 0; i < answers.length; i++) {
        if (answers[i].id === that.data.replyToId) {
          if (!answers[i].replies) {
            answers[i].replies = []
          }
          answers[i].replies.push(reply)
          answers[i].showReplies = true
          break
        }
      }

      this.setData({ 
        answers: answers,
        myAnswer: '',
        replyToId: '',
        replyToAuthor: ''
      })

    } else {
      // 新回答
      var newAnswer = {
        id: 'a' + Date.now(),
        author: '我',
        time: '刚刚',
        content: this.data.myAnswer,
        likes: 0,
        liked: false,
        replies: [],
        showReplies: false
      }

      var answers = this.data.answers
      answers.unshift(newAnswer)
      this.setData({ 
        answers: answers,
        myAnswer: ''
      })
    }

    // 更新上一页的数据
    this.updatePrevPage()

    wx.showToast({ title: '发送成功', icon: 'success' })
  },

  likeAnswer: function(e) {
    var id = e.currentTarget.dataset.id
    var answers = this.data.answers
    for (var i = 0; i < answers.length; i++) {
      if (answers[i].id === id) {
        answers[i].liked = !answers[i].liked
        answers[i].likes += answers[i].liked ? 1 : -1
        break
      }
    }
    this.setData({ answers: answers })
    this.updatePrevPage()
  },

  updatePrevPage: function() {
    var pages = getCurrentPages()
    var prevPage = pages[pages.length - 2]
    if (prevPage && prevPage.data.questions) {
      var questions = prevPage.data.questions
      for (var i = 0; i < questions.length; i++) {
        if (questions[i].id === this.data.questionId) {
          questions[i].answers = this.data.answers
          questions[i].answerCount = this.data.answers.length
          break
        }
      }
      prevPage.setData({ questions: questions })
    }
  },

  previewImage: function(e) {
    var url = e.currentTarget.dataset.url
    wx.previewImage({
      current: url,
      urls: this.data.question.images || []
    })
  }
})
