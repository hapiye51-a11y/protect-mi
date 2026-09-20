Page({
  data: {
    list: [],
    currentFilter: 'all',
    todoCount: 0,
    doingCount: 0,
    doneCount: 0,
    showModal: false,
    isEdit: false,
    editId: '',
    today: '',
    form: {
      type: 'feed',
      title: '',
      desc: '',
      location: '',
      latitude: null,
      longitude: null,
      deadline: ''
    },
    typeText: {
      feed: '定期投喂',
      tnr: 'TNR计划',
      rescue: '救助跟进',
      adopt: '领养审核',
      other: '其他'
    }
  },

  onLoad() {
    const d = new Date()
    this.setData({
      today: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    })
    this.load()
  },

  onShow() {
    this.load()
  },

  load() {
    const plans = wx.getStorageSync('rescuePlans') || []
    const todo = plans.filter(p => p.status === 'todo').length
    const doing = plans.filter(p => p.status === 'doing').length
    const done = plans.filter(p => p.status === 'done').length
    
    let list = plans
    if (this.data.currentFilter !== 'all') {
      list = plans.filter(p => p.status === this.data.currentFilter)
    }
    
    // 排序：进行中 > 待办 > 已完成
    const order = { doing: 0, todo: 1, done: 2 }
    list.sort((a, b) => order[a.status] - order[b.status] || new Date(b.createTime) - new Date(a.createTime))
    
    this.setData({ plans, list, todoCount: todo, doingCount: doing, doneCount: done })
  },

  save(plans) {
    wx.setStorageSync('rescuePlans', plans)
    this.load()
  },

  setFilter(e) {
    this.setData({ currentFilter: e.currentTarget.dataset.f })
    this.load()
  },

  toggleStatus(e) {
    const id = e.currentTarget.dataset.id
    const plans = this.data.plans
    const i = plans.findIndex(p => p.id === id)
    if (i > -1) {
      const flow = { todo: 'doing', doing: 'done', done: 'todo' }
      plans[i].status = flow[plans[i].status]
      plans[i].updateTime = new Date().toISOString()
      this.save(plans)
    }
  },

  addPlan() {
    this.setData({
      showModal: true,
      isEdit: false,
      editId: '',
      form: { type: 'feed', title: '', desc: '', location: '', latitude: null, longitude: null, deadline: '' }
    })
  },

  editPlan(e) {
    const item = e.currentTarget.dataset.item
    this.setData({
      showModal: true,
      isEdit: true,
      editId: item.id,
      form: {
        type: item.type,
        title: item.title,
        desc: item.desc || '',
        location: item.location || '',
        latitude: item.latitude,
        longitude: item.longitude,
        deadline: item.deadline || ''
      }
    })
  },

  closeModal() {
    this.setData({ showModal: false })
  },

  setType(e) {
    this.setData({ 'form.type': e.currentTarget.dataset.t })
  },

  setTitle(e) {
    this.setData({ 'form.title': e.detail.value })
  },

  setDesc(e) {
    this.setData({ 'form.desc': e.detail.value })
  },

  pickLoc() {
    wx.chooseLocation({
      success: r => {
        this.setData({
          'form.location': r.name || '选中位置',
          'form.latitude': r.latitude,
          'form.longitude': r.longitude
        })
      }
    })
  },

  setDate(e) {
    this.setData({ 'form.deadline': e.detail.value })
  },

  savePlan() {
    const { form, isEdit, editId, plans, typeText } = this.data
    if (!form.title.trim()) {
      wx.showToast({ title: '请输入标题', icon: 'none' })
      return
    }

    const now = new Date().toISOString()
    const newPlans = [...plans]

    if (isEdit && editId) {
      const i = newPlans.findIndex(p => p.id === editId)
      if (i > -1) {
        newPlans[i] = {
          ...newPlans[i],
          ...form,
          typeText: typeText[form.type],
          updateTime: now
        }
      }
    } else {
      newPlans.push({
        id: Date.now().toString(),
        ...form,
        typeText: typeText[form.type],
        status: 'todo',
        createTime: now,
        updateTime: now
      })
    }

    this.save(newPlans)
    this.closeModal()
    wx.showToast({ title: '保存成功', icon: 'success' })
  },

  delPlan() {
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复',
      confirmColor: '#FF5252',
      success: r => {
        if (r.confirm) {
          const plans = this.data.plans.filter(p => p.id !== this.data.editId)
          this.save(plans)
          this.closeModal()
          wx.showToast({ title: '已删除', icon: 'success' })
        }
      }
    })
  }
})
