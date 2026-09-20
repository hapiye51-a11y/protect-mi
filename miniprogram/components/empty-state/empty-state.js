Component({
  properties: {
    illustration: {
      type: String,
      value: '😿'
    },
    title: {
      type: String,
      value: '喵~这里还没有内容'
    },
    description: {
      type: String,
      value: '暂时没有发现任何信息'
    },
    showButton: {
      type: Boolean,
      value: false
    },
    buttonText: {
      type: String,
      value: '去看看别的'
    }
  },

  methods: {
    onButtonTap() {
      this.triggerEvent('buttontap')
    }
  }
})
