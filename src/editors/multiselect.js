import { AbstractEditor } from '../editor.js'

export class MultiSelectEditor extends AbstractEditor {
  onInputChange () {
    this.value = this.input.value
    this.onChange(true)
  }

  register () {
    super.register()
    if (!this.input) return
    this.input.setAttribute('name', this.formname)
  }

  unregister () {
    super.unregister()
    if (!this.input) return
    this.input.removeAttribute('name')
  }

  getNumColumns () {
    let longestText = this.getTitle().length
    Object.keys(this.select_values).forEach(i => (longestText = Math.max(longestText, (`${this.select_values[i]}`).length + 4)))

    return Math.min(12, Math.max(longestText / 7, 2))
  }

  preBuild () {
    super.preBuild()

    this.select_options = {}
    this.select_values = {}
    this.option_keys = []
    this.option_titles = []

    if (!this.schema.items.enum) {
      let callback
      callback = this.expandCallbacks('template', { template: this.schema.items.options.values })
      if (typeof callback.template === 'function') this.values_callback = callback.template
      callback = this.expandCallbacks('template', { template: this.schema.items.options.titles })
      if (typeof callback.template === 'function') this.titles_callback = callback.template
      callback = this.expandCallbacks('template', { template: this.schema.items.options.updated })
      if (typeof callback.template === 'function') this.updated_callback = callback.template
    } else {
      let i
      const itemsSchema = this.jsoneditor.expandRefs(this.schema.items || {})
      const e = itemsSchema.enum || []
      const t = itemsSchema.options ? itemsSchema.options.enum_titles || [] : []

      for (i = 0; i < e.length; i++) {
        /* If the sanitized value is different from the enum value, don't include it */
        if (this.sanitize(e[i]) !== e[i]) continue

        this.option_keys.push(`${e[i]}`)
        this.option_titles.push(`${t[i] || e[i]}`)
        this.select_values[`${e[i]}`] = e[i]
      }
    }
  }

  build () {
    let i
    if (!this.options.compact) this.header = this.label = this.theme.getFormInputLabel(this.getTitle(), this.isRequired())
    if (this.schema.description) this.description = this.theme.getFormInputDescription(this.translateProperty(this.schema.description))
    if (this.options.infoText) this.infoButton = this.theme.getInfoButton(this.translateProperty(this.options.infoText))
    if (this.options.compact) this.container.classList.add('compact')

    if ((!this.schema.format && this.option_keys.length < 8) || this.schema.format === 'checkbox') {
      this.input_type = 'checkboxes'

      this.inputs = {}
      this.controls = {}
      for (i = 0; i < this.option_keys.length; i++) {
        const id = this.formname + i.toString()
        this.inputs[this.option_keys[i]] = this.theme.getCheckbox()
        this.inputs[this.option_keys[i]].id = id
        this.select_options[this.option_keys[i]] = this.inputs[this.option_keys[i]]
        const label = this.theme.getCheckboxLabel(this.option_titles[i])
        label.htmlFor = id
        this.controls[this.option_keys[i]] = this.theme.getFormControl(label, this.inputs[this.option_keys[i]])
      }

      this.control = this.theme.getMultiCheckboxHolder(this.controls, this.label, this.description, this.infoButton)
      this.inputs.controlgroup = this.inputs.controls = this.control /* Enable error messages for checkboxes */
    } else {
      this.input_type = 'select'
      this.input = this.theme.getSelectInput(this.option_keys, true)
      this.theme.setSelectOptions(this.input, this.option_keys, this.option_titles)
      /* this.input.multiple = true; */
      this.input.setAttribute('multiple', 'multiple')
      this.input.size = Math.min(10, this.option_keys.length)
      for (i = 0; i < this.option_keys.length; i++) {
        this.select_options[this.option_keys[i]] = this.input.children[i]
      }

      this.control = this.theme.getFormControl(this.label, this.input, this.description, this.infoButton)
    }

    if (this.schema.readOnly || this.schema.readonly) {
      this.disable(true)
    }

    this.container.appendChild(this.control)

    this.multiselectChangeHandler = (e) => {
      const newValue = []
      for (i = 0; i < this.option_keys.length; i++) {
        if (this.select_options[this.option_keys[i]] && (this.select_options[this.option_keys[i]].selected || this.select_options[this.option_keys[i]].checked)) newValue.push(this.select_values[this.option_keys[i]])
      }
      this.updateValue(newValue)
      this.onChange(true)
    }

    this.control.addEventListener('change', this.multiselectChangeHandler, false)

    /* Any special formatting that needs to happen after the input is added to the dom */
    window.requestAnimationFrame(() => {
      this.afterInputReady()
    })
  }

  postBuild () {
    super.postBuild()
    /* this.theme.afterInputReady(this.input || this.inputs); */
  }

  afterInputReady () {
    this.theme.afterInputReady(this.input || this.inputs)
  }

  setValue (value, initial) {
    value = value || []
    if (!(Array.isArray(value))) value = [value]

    /* Make sure we are dealing with an array of strings so we can check for strict equality */
    value = value.map(e => `${e}`)

    /* Update selected status of options */
    Object.keys(this.select_options).forEach(i => {
      this.select_options[i][this.input_type === 'select' ? 'selected' : 'checked'] = (value.includes(i))
    })

    this.updateValue(value)
    this.onChange(true)
  }

  removeValue (value) {
    /* Remove from existing value(s) */
    value = [].concat(value)
    this.setValue(this.getValue().filter(item => !value.includes(item)))
  }

  addValue (value) {
    /* Add to existing value(s) */
    this.setValue(this.getValue().concat(value))
  }

  updateValue (value) {
    let changed = false
    const newValue = []
    for (let i = 0; i < value.length; i++) {
      if (!this.select_options[`${value[i]}`]) {
        changed = true
        continue
      }
      const sanitized = this.sanitize(this.select_values[value[i]])
      newValue.push(sanitized)
      if (sanitized !== value[i]) changed = true
    }
    this.value = newValue

    return changed
  }

  sanitize (value) {
    if (this.schema.items.type === 'boolean') return !!value
    else if (this.schema.items.type === 'number') return 1 * value || 0
    else if (this.schema.items.type === 'integer') return Math.floor(value * 1 || 0)
    return `${value}`
  }

  enable () {
    if (!this.always_disabled) {
      if (this.input) {
        this.input.disabled = false
      } else if (this.inputs) {
        Object.keys(this.inputs).forEach(i => (this.inputs[i].disabled = false))
      }
      super.enable()
    }
  }

  disable (alwaysDisabled) {
    if (alwaysDisabled) this.always_disabled = true
    if (this.input) {
      this.input.disabled = true
    } else if (this.inputs) {
      Object.keys(this.inputs).forEach(i => (this.inputs[i].disabled = true))
    }
    super.disable()
  }

  destroy () {
    super.destroy()
  }

  escapeRegExp (string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  showValidationErrors (errors) {
    const regexPath = new RegExp(`^${this.escapeRegExp(this.path)}(\\.\\d+)?$`)
    const addMessage = (messages, error) => {
      if (error.path.match(regexPath)) {
        messages.push(error.message)
      }
      return messages
    }

    const messages = errors.reduce(addMessage, [])

    if (messages.length) {
      this.theme.addInputError(this.input || this.inputs, `${messages.join('. ')}.`)
    } else {
      this.theme.removeInputError(this.input || this.inputs)
    }
  }
}
