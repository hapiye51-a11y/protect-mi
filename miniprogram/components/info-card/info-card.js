Component({
  properties: {
    icon: {
      type: String,
      value: ''
    },
    title: {
      type: String,
      value: ''
    },
    description: {
      type: String,
      value: ''
    },
    showArrow: {
      type: Boolean,
      value: true
    },
    customClass: {
      type: String,
      value: ''
    }
  },

  methods: {
    onCardTap() {
      this.triggerEvent('cardtap')
    }
  }
})
