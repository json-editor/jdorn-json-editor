import { AbstractEditor } from '../editor.js'
import { extend } from '../utilities.js'

export class SelectEditor extends AbstractEditor {
  setValue (value, initial) {
    /* Sanitize value before setting it */
    let sanitized = this.typecast(value)

    const haveToUseDefaultValue = !!this.jsoneditor.options.use_default_values || typeof this.schema.default !== 'undefined'

    if (
      (this.enum_options.length > 0 && !this.enum_values.includes(sanitized)) ||
      (initial && !this.isRequired() && !haveToUseDefaultValue)
    ) {
      sanitized = this.enum_values[0]
    }

    if (this.value === sanitized) return

    if (initial) this.is_dirty = false
    else if (this.jsoneditor.options.show_errors === 'change') this.is_dirty = true

    this.input.value = this.enum_options[this.enum_values.indexOf(sanitized)]

    this.value = sanitized
    this.onChange()
    this.change()
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
    if (!this.enum_options) return 3
    let longestText = this.getTitle().length
    for (let i = 0; i < this.enum_options.length; i++) {
      longestText = Math.max(longestText, this.enum_options[i].length + 4)
    }
    return Math.min(12, Math.max(longestText / 7, 2))
  }

  typecast (value) {
    if (this.schema.type === 'boolean') return value === 'undefined' || value === undefined ? undefined : !!value
    else if (this.schema.type === 'number') return 1 * value || 0
    else if (this.schema.type === 'integer') return Math.floor(value * 1 || 0)
    else if (this.schema.enum && value === undefined) return undefined
    return `${value}`
  }

  getValue () {
    if (!this.dependenciesFulfilled) {
      return undefined
    }
    return this.typecast(this.value)
  }

  preBuild () {
    this.input_type = 'select'
    this.enum_options = []
    this.enum_values = []
    this.enum_display = []
    let i
    let callback

    /* Enum options enumerated */
    if (this.schema.enum) {
      const display = (this.schema.options && this.schema.options.enum_titles) || []

      this.schema.enum.forEach((option, i) => {
        this.enum_options[i] = `${option}`
        this.enum_display[i] = `${this.translateProperty(display[i]) || option}`
        this.enum_values[i] = this.typecast(option)
      })

      if (!this.isRequired()) {
        this.enum_display.unshift(' ')
        this.enum_options.unshift('undefined')
        this.enum_values.unshift(undefined)
      }
      /* Boolean */
    } else if (this.schema.type === 'boolean') {
      this.enum_display = (this.schema.options && this.schema.options.enum_titles) || ['true', 'false']
      this.enum_options = ['1', '']
      this.enum_values = [true, false]

      if (!this.isRequired()) {
        this.enum_display.unshift(' ')
        this.enum_options.unshift('undefined')
        this.enum_values.unshift(undefined)
      }
      /* Dynamic Enum */
    } else if (this.schema.enumSource) {
      this.enumSource = []
      this.enum_display = []
      this.enum_options = []
      this.enum_values = []

      /* Shortcut declaration for using a single array */
      if (!(Array.isArray(this.schema.enumSource))) {
        if (this.schema.enumValue) {
          this.enumSource = [
            {
              source: this.schema.enumSource,
              value: this.schema.enumValue
            }
          ]
        } else {
          this.enumSource = [
            {
              source: this.schema.enumSource
            }
          ]
        }
      } else {
        for (i = 0; i < this.schema.enumSource.length; i++) {
          /* Shorthand for watched variable */
          if (typeof this.schema.enumSource[i] === 'string') {
            this.enumSource[i] = {
              source: this.schema.enumSource[i]
            }
            /* Make a copy of the schema */
          } else if (!(Array.isArray(this.schema.enumSource[i]))) {
            this.enumSource[i] = extend({}, this.schema.enumSource[i])
          } else {
            this.enumSource[i] = this.schema.enumSource[i]
          }
        }
      }
      /* Now, enumSource is an array of sources */
      /* Walk through this array and fix up the values */
      for (i = 0; i < this.enumSource.length; i++) {
        if (this.enumSource[i].source) {
          callback = this.expandCallbacks('template', { template: this.enumSource[i].source })
          if (typeof callback.template === 'function') this.enumSource[i].source = callback.template
        }
        if (this.enumSource[i].value) {
          callback = this.expandCallbacks('template', { template: this.enumSource[i].value })
          if (typeof callback.template === 'function') this.enumSource[i].value = callback.template
          else this.enumSource[i].value = this.jsoneditor.compileTemplate(this.enumSource[i].value, this.template_engine)
        }
        if (this.enumSource[i].title) {
          callback = this.expandCallbacks('template', { template: this.enumSource[i].title })
          if (typeof callback.template === 'function') this.enumSource[i].title = callback.template
          else this.enumSource[i].title = this.jsoneditor.compileTemplate(this.enumSource[i].title, this.template_engine)
        }
        if (this.enumSource[i].filter && this.enumSource[i].value) {
          callback = this.expandCallbacks('template', { template: this.enumSource[i].filter })
          if (typeof callback.template === 'function') this.enumSource[i].filter = callback.template
          else this.enumSource[i].filter = this.jsoneditor.compileTemplate(this.enumSource[i].filter, this.template_engine)
        }
      }
      /* Other, not supported */
    } else {
      throw new Error("'select' editor requires the enum property to be set.")
    }
  }

  build () {
    if (!this.options.compact) this.header = this.label = this.theme.getFormInputLabel(this.getTitle(), this.isRequired())
    if (this.schema.description) this.description = this.theme.getFormInputDescription(this.translateProperty(this.schema.description))
    if (this.options.infoText) this.infoButton = this.theme.getInfoButton(this.translateProperty(this.options.infoText))
    if (this.options.compact) this.container.classList.add('compact')

    this.input = this.theme.getSelectInput(this.enum_options, false)
    this.theme.setSelectOptions(this.input, this.enum_options, this.enum_display)

    if (this.schema.readOnly || this.schema.readonly) {
      this.disable(true)
      this.input.disabled = true
    }

    /* Set custom attributes on input element. Parameter is array of protected keys. Empty array if none. */
    this.setInputAttributes([])

    this.input.addEventListener('change', (e) => {
      e.preventDefault()
      e.stopPropagation()
      this.onInputChange()
    })

    this.control = this.theme.getFormControl(this.label, this.input, this.description, this.infoButton)
    this.container.appendChild(this.control)

    this.value = this.enum_values[0]

    /* Any special formatting that needs to happen after the input is added to the dom */
    window.requestAnimationFrame(() => {
      if (this.input.parentNode) this.afterInputReady()
    })
  }

  afterInputReady () {
    this.theme.afterInputReady(this.input)
  }

  onInputChange () {
    const val = this.typecast(this.input.value)

    let newVal
    /* Invalid option, use first option instead */
    if (!this.enum_values.includes(val)) {
      newVal = this.enum_values[0]
    } else {
      newVal = this.enum_values[this.enum_values.indexOf(val)]
    }

    /* If valid hasn't changed */
    if (newVal === this.value) return

    this.is_dirty = true

    /* Store new value and propogate change event */
    this.value = newVal
    this.onChange(true)
  }

  onWatchedFieldChange () {
    let vars; let j
    let selectOptions = []; let selectTitles = []

    /* If this editor uses a dynamic select box */
    if (this.enumSource) {
      vars = this.getWatchedFieldValues()

      for (let i = 0; i < this.enumSource.length; i++) {
        /* Constant values */
        if (Array.isArray(this.enumSource[i])) {
          selectOptions = selectOptions.concat(this.enumSource[i])
          selectTitles = selectTitles.concat(this.enumSource[i])
        } else {
          let items = []
          /* Dynamic retrived list of items from callback */
          if (typeof this.enumSource[i].source === 'function') {
            var newItems = this.enumSource[i].source({ watched: vars })
            if (Array.isArray(newItems)) items = newItems
          /* Static list of items */
          } else if (Array.isArray(this.enumSource[i].source)) {
            items = this.enumSource[i].source
            /* A watched field */
          } else {
            items = vars[this.enumSource[i].source]
          }

          if (items) {
            /* Only use a predefined part of the array */
            if (this.enumSource[i].slice) {
              items = Array.prototype.slice.apply(items, this.enumSource[i].slice)
            }
            /* Filter the items */
            if (this.enumSource[i].filter) {
              const newItems = []
              for (j = 0; j < items.length; j++) {
                if (this.enumSource[i].filter({ i: j, item: items[j], watched: vars })) newItems.push(items[j])
              }
              items = newItems
            }

            const itemTitles = []
            const itemValues = []
            for (j = 0; j < items.length; j++) {
              const item = items[j]

              /* Rendered value */
              if (this.enumSource[i].value) {
                itemValues[j] = this.typecast(this.enumSource[i].value({
                  i: j,
                  item
                }))
                /* Use value directly */
              } else {
                itemValues[j] = items[j]
              }

              /* Rendered title */
              if (this.enumSource[i].title) {
                itemTitles[j] = this.enumSource[i].title({
                  i: j,
                  item
                })
                /* Use value as the title also */
              } else {
                itemTitles[j] = itemValues[j]
              }
            }

            if (this.enumSource[i].sort) {
              (((itemValues, itemTitles, order) => {
                itemValues.map((v, i) => ({
                  v,
                  t: itemTitles[i]
                })).sort((a, b) => (a.v < b.v) ? -order : ((a.v === b.v) ? 0 : order)).forEach((v, i) => {
                  itemValues[i] = v.v
                  itemTitles[i] = v.t
                })
              }).bind(null, itemValues, itemTitles, this.enumSource[i].sort === 'desc' ? 1 : -1))()
            }

            selectOptions = selectOptions.concat(itemValues)
            selectTitles = selectTitles.concat(itemTitles)
          }
        }
      }

      const prevValue = this.value

      this.theme.setSelectOptions(this.input, selectOptions, selectTitles)
      this.enum_options = selectOptions
      this.enum_display = selectTitles
      this.enum_values = selectOptions

      /* If the previous value is still in the new select options */
      /* or if global option "enum_source_value_auto_select" is true, stick with it */
      if (selectOptions.includes(prevValue) || this.jsoneditor.options.enum_source_value_auto_select !== false) {
        this.input.value = prevValue
        this.value = prevValue
        /* Otherwise, set the value to the first select option */
      } else {
        this.input.value = selectOptions[0]
        this.value = this.typecast(selectOptions[0] || '')
        if (this.parent && !this.watchLoop) this.parent.onChildEditorChange(this)
        else this.jsoneditor.onChange()
        this.jsoneditor.notifyWatchers(this.path)
      }
    }

    super.onWatchedFieldChange()
  }

  enable () {
    if (!this.always_disabled) {
      this.input.disabled = false
      super.enable()
    }
  }

  disable (alwaysDisabled) {
    if (alwaysDisabled) this.always_disabled = true
    this.input.disabled = true
    super.disable(alwaysDisabled)
  }

  destroy () {
    if (this.label && this.label.parentNode) this.label.parentNode.removeChild(this.label)
    if (this.description && this.description.parentNode) this.description.parentNode.removeChild(this.description)
    if (this.input && this.input.parentNode) this.input.parentNode.removeChild(this.input)

    super.destroy()
  }

  showValidationErrors (errors) {
    this.previous_error_setting = this.jsoneditor.options.show_errors

    const addMessage = (messages, error) => {
      if (error.path === this.path) {
        messages.push(error.message)
      }
      return messages
    }
    const messages = errors.reduce(addMessage, [])

    if (messages.length) {
      this.theme.addInputError(this.input, `${messages.join('. ')}.`)
    } else {
      this.theme.removeInputError(this.input)
    }
  }
}
