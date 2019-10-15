import { StringEditor } from './string'
import { $extend } from '../utilities'
export var ScEditor = StringEditor.extend({

  setValue: function (value, initial, fromTemplate) {
    var res = this._super(value, initial, fromTemplate)
    if (res !== undefined && res.changed && this.sceditor_instance) this.sceditor_instance.val(res.value)
  },
  build: function () {
    this.options.format = 'textarea' // Force format into "textarea"
    this._super()
    this.input_type = this.schema.format // Restore original format
    this.input.setAttribute('data-schemaformat', this.input_type)
  },
  afterInputReady: function () {
    var self = this; var options

    if (window.sceditor) {
      // Get options, either global options from "this.defaults.options.sceditor" or
      // single property options from schema "options.sceditor"
      options = this.expandCallbacks('sceditor', $extend({}, {
        plugins: self.input_type,
        emoticonsEnabled: false,
        width: '100%',
        height: 300
      }, this.defaults.options.sceditor || {}, this.options.sceditor || {}, {
        element: this.input
      }))

      this.sceditor_instance = window.sceditor.create(this.input, options)

      if (this.schema.readOnly || this.schema.readonly || this.schema.template) {
        this.sceditor_instance.readOnly(true)
      }

      // Listen for changes
      self.sceditor_instance.blur(function () {
        // Get editor's value
        var val = self.sceditor_instance.val()
        // Set the value and update
        self.input.value = val.html()
        self.value = self.input.value
        self.is_dirty = true
        self.onChange(true)
      })

      this.theme.afterInputReady(self.input)
    } else this._super() // Library not loaded, so just treat this as a string
  },
  getNumColumns: function () {
    return 6
  },
  enable: function () {
    if (!this.always_disabled && this.sceditor_instance) this.sceditor_instance.readOnly(false)
    this._super()
  },
  disable: function (alwaysDisabled) {
    if (this.sceditor_instance) this.sceditor_instance.readOnly(true)
    this._super(alwaysDisabled)
  },
  destroy: function () {
    if (this.sceditor_instance) {
      this.sceditor_instance.destroy()
      this.sceditor_instance = null
    }
    this._super()
  }
})
