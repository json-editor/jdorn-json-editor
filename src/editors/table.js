import { ArrayEditor } from './array.js'
import { extend, trigger } from '../utilities.js'

export class TableEditor extends ArrayEditor {
  register () {
    super.register()
    if (this.rows) {
      for (let i = 0; i < this.rows.length; i++) {
        this.rows[i].register()
      }
    }
  }

  unregister () {
    super.unregister()
    if (this.rows) {
      for (let i = 0; i < this.rows.length; i++) {
        this.rows[i].unregister()
      }
    }
  }

  getNumColumns () {
    return Math.max(Math.min(12, this.width), 3)
  }

  preBuild () {
    const itemSchema = this.jsoneditor.expandRefs(this.schema.items || {})

    this.item_title = itemSchema.title || 'row'
    this.item_default = itemSchema.default || null
    this.item_has_child_editors = itemSchema.properties || itemSchema.items
    this.width = 12
    this.array_controls_top = this.options.array_controls_top || this.jsoneditor.options.array_controls_top
    super.preBuild()
  }

  build () {
    this.table = this.theme.getTable()
    this.container.appendChild(this.table)
    this.thead = this.theme.getTableHead()
    this.table.appendChild(this.thead)
    this.header_row = this.theme.getTableRow()
    this.thead.appendChild(this.header_row)
    this.row_holder = this.theme.getTableBody()
    this.table.appendChild(this.row_holder)

    /* Determine the default value of array element */
    const tmp = this.getElementEditor(0, true)
    this.item_default = tmp.getDefault()
    this.width = tmp.getNumColumns() + 2

    if (!this.options.compact) {
      this.header = document.createElement('label')
      this.header.textContent = this.getTitle()
      this.title = this.theme.getHeader(this.header, this.getPathDepth())
      this.container.appendChild(this.title)
      if (this.options.infoText) {
        this.infoButton = this.theme.getInfoButton(this.translateProperty(this.options.infoText))
        this.container.appendChild(this.infoButton)
      }
      this.title_controls = this.theme.getHeaderButtonHolder()
      this.title.appendChild(this.title_controls)
      if (this.schema.description) {
        this.description = this.theme.getDescription(this.translateProperty(this.schema.description))
        this.container.appendChild(this.description)
      }
      this.panel = this.theme.getIndentedPanel()
      this.container.appendChild(this.panel)
      this.error_holder = document.createElement('div')
      this.panel.appendChild(this.error_holder)
    } else {
      this.panel = document.createElement('div')
      this.container.appendChild(this.panel)
    }

    this.panel.appendChild(this.table)
    this.controls = this.theme.getButtonHolder()
    if (this.array_controls_top) {
      this.title.appendChild(this.controls)
    } else {
      this.panel.appendChild(this.controls)
    }

    if (this.item_has_child_editors) {
      const ce = tmp.getChildEditors()
      const order = tmp.property_order || Object.keys(ce)
      for (let i = 0; i < order.length; i++) {
        const th = this.theme.getTableHeaderCell(ce[order[i]].getTitle(), ce[order[i]].isRequired())
        if (ce[order[i]].options.hidden) th.style.display = 'none'
        this.header_row.appendChild(th)
      }
    } else {
      this.header_row.appendChild(this.theme.getTableHeaderCell(this.item_title, this.isRequired()))
    }

    tmp.destroy()
    this.row_holder.innerHTML = ''

    /* Row Controls column */
    this.controls_header_cell = this.theme.getTableHeaderCell(' ', false)
    this.header_row.appendChild(this.controls_header_cell)

    /* Add controls */
    this.addControls()
  }

  onChildEditorChange (editor) {
    this.refreshValue()
    super.onChildEditorChange()
  }

  getItemDefault () {
    return extend({}, { default: this.item_default }).default
  }

  getItemTitle () {
    return this.item_title
  }

  getElementEditor (i, ignore) {
    const schemaCopy = extend({}, this.schema.items)
    const editor = this.jsoneditor.getEditorClass(schemaCopy, this.jsoneditor)
    const row = this.row_holder.appendChild(this.theme.getTableRow())
    let holder = row
    if (!this.item_has_child_editors) {
      holder = this.theme.getTableCell()
      row.appendChild(holder)
    }

    const ret = this.jsoneditor.createEditor(editor, {
      jsoneditor: this.jsoneditor,
      schema: schemaCopy,
      container: holder,
      path: `${this.path}.${i}`,
      parent: this,
      compact: true,
      table_row: true
    })

    ret.preBuild()
    if (!ignore) {
      ret.build()
      ret.postBuild()

      ret.controls_cell = row.appendChild(this.theme.getTableCell())
      ret.row = row
      ret.table_controls = this.theme.getButtonHolder()
      ret.controls_cell.appendChild(ret.table_controls)
      ret.table_controls.style.margin = 0
      ret.table_controls.style.padding = 0
    }

    return ret
  }

  destroy () {
    this.innerHTML = ''
    if (this.checkParent(this.title)) this.title.parentNode.removeChild(this.title)
    if (this.checkParent(this.description)) this.description.parentNode.removeChild(this.description)
    if (this.checkParent(this.row_holder)) this.row_holder.parentNode.removeChild(this.row_holder)
    if (this.checkParent(this.table)) this.table.parentNode.removeChild(this.table)
    if (this.checkParent(this.panel)) this.panel.parentNode.removeChild(this.panel)

    this.rows = this.title = this.description = this.row_holder = this.table = this.panel = null

    super.destroy()
  }

  ensureArraySize (value) {
    if (!(Array.isArray(value))) value = [value]

    if (this.schema.minItems) {
      while (value.length < this.schema.minItems) {
        value.push(this.getItemDefault())
      }
    }
    if (this.schema.maxItems && value.length > this.schema.maxItems) {
      value = value.slice(0, this.schema.maxItems)
    }
    return value
  }

  setValue (value = [], initial) {
    /* Make sure value has between minItems and maxItems items in it */
    value = this.ensureArraySize(value)

    const serialized = JSON.stringify(value)
    if (serialized === this.serialized) return

    let numrowsChanged = false

    value.forEach((val, i) => {
      if (this.rows[i]) {
        /* TODO: don't set the row's value if it hasn't changed */
        this.rows[i].setValue(val)
      } else {
        this.addRow(val)
        numrowsChanged = true
      }
    })

    for (let j = value.length; j < this.rows.length; j++) {
      const holder = this.rows[j].container
      if (!this.item_has_child_editors) {
        this.rows[j].row.parentNode.removeChild(this.rows[j].row)
      }
      this.rows[j].destroy()
      if (holder.parentNode) holder.parentNode.removeChild(holder)
      this.rows[j] = null
      numrowsChanged = true
    }
    this.rows = this.rows.slice(0, value.length)

    this.refreshValue()
    if (numrowsChanged || initial) this.refreshRowButtons()

    this.onChange()

    /* TODO: sortable */
  }

  refreshRowButtons () {
    /* If we currently have minItems items in the array */
    const minItems = this.schema.minItems && this.schema.minItems >= this.rows.length
    /* If we currently have maxItems items in the array */
    const maxItems = this.schema.maxItems && this.schema.maxItems <= this.rows.length

    const needRowButtons = []
    this.rows.forEach((editor, i) => {
      if (editor.delete_button) {
        /* Hide the delete button if we have minItems items */
        const display = !minItems
        this.setVisibility(editor.delete_button, display)
        needRowButtons.push(display)
      }

      if (editor.copy_button) {
        /* Hide the copy button if we have maxItems items */
        const display = !maxItems
        this.setVisibility(editor.copy_button, display)
        needRowButtons.push(display)
      }

      if (editor.moveup_button) {
        /* Hide the moveup button for the first row */
        const display = i !== 0
        this.setVisibility(editor.moveup_button, display)
        needRowButtons.push(display)
      }

      if (editor.movedown_button) {
        /* Hide the movedown button for the last row */
        const display = i !== this.rows.length - 1
        this.setVisibility(editor.movedown_button, display)
        needRowButtons.push(display)
      }
    })

    const need = needRowButtons.some(e => e)
    /* Show/hide controls column in table */
    this.rows.forEach((editor) =>
      this.setVisibility(editor.controls_cell, need)
    )
    this.setVisibility(this.controls_header_cell, need)

    this.setVisibility(this.table, this.value.length)

    /* If there are maxItems items in the array, or configured to hide the add_row_button button, hide the button beneath the rows */
    const display1 = !(maxItems || this.hide_add_button)
    this.setVisibility(this.add_row_button, display1)

    /* If there are minItems items in the array, or configured to hide the delete_last_row button, hide the button beneath the rows */
    const display2 = !(!this.value.length || minItems || this.hide_delete_last_row_buttons)
    this.setVisibility(this.delete_last_row_button, display2)

    /* If there are minItems items in the array, or configured to hide the remove_all_rows_button button, hide the button beneath the rows */
    const display3 = !(this.value.length <= 1 || minItems || this.hide_delete_all_rows_buttons)
    this.setVisibility(this.remove_all_rows_button, display3)

    const controlsNeeded = display1 || display2 || display3
    this.setVisibility(this.controls, controlsNeeded)
  }

  refreshValue () {
    this.value = []

    this.rows.forEach((editor, i) => {
      /* Get the value for this editor */
      this.value[i] = editor.getValue()
    })
    this.serialized = JSON.stringify(this.value)
  }

  addRow (value) {
    const i = this.rows.length

    this.rows[i] = this.getElementEditor(i)

    const controlsHolder = this.rows[i].table_controls

    /* Buttons to delete row, copy row, move row up, and move row down */
    if (!this.hide_delete_buttons) {
      this.rows[i].delete_button = this._createDeleteButton(i, controlsHolder)
    }

    if (this.show_copy_button) {
      this.rows[i].copy_button = this._createCopyButton(i, controlsHolder)
    }

    if (!this.hide_move_buttons) {
      this.rows[i].moveup_button = this._createMoveUpButton(i, controlsHolder)
    }

    if (!this.hide_move_buttons) {
      this.rows[i].movedown_button = this._createMoveDownButton(i, controlsHolder)
    }

    if (typeof value !== 'undefined') this.rows[i].setValue(value)
  }

  _createDeleteButton (i, holder) {
    const button = this.getButton('', 'delete', 'button_delete_row_title_short')
    button.classList.add('delete', 'json-editor-btntype-delete')
    button.setAttribute('data-i', i)
    button.addEventListener('click', e => {
      e.preventDefault()
      e.stopPropagation()

      if (!this.askConfirmation()) {
        return false
      }

      const j = e.currentTarget.getAttribute('data-i') * 1
      const value = this.getValue()

      value.splice(j, 1)

      this.setValue(value)
      this.onChange(true)
      this.jsoneditor.trigger('deleteRow', this.rows[j])
    })
    holder.appendChild(button)
    return button
  }

  _createCopyButton (i, holder) {
    const button = this.getButton('', 'copy', 'button_copy_row_title_short')
    button.classList.add('copy', 'json-editor-btntype-copy')
    button.setAttribute('data-i', i)
    button.addEventListener('click', e => {
      e.preventDefault()
      e.stopPropagation()
      const j = e.currentTarget.getAttribute('data-i') * 1
      const value = this.getValue()

      value.splice(j + 1, 0, value[j])

      this.setValue(value)
      this.onChange(true)
      this.jsoneditor.trigger('copyRow', this.rows[j + 1])
    })
    holder.appendChild(button)
    return button
  }

  _createMoveUpButton (i, holder) {
    const button = this.getButton('', 'moveup', 'button_move_up_title')
    button.classList.add('moveup', 'json-editor-btntype-move')
    button.setAttribute('data-i', i)
    button.addEventListener('click', e => {
      e.preventDefault()
      e.stopPropagation()

      const j = e.currentTarget.getAttribute('data-i') * 1
      const value = this.getValue()

      value.splice(j - 1, 0, value.splice(j, 1)[0])

      this.setValue(value)
      this.onChange(true)
      this.jsoneditor.trigger('moveRow', this.rows[j - 1])
    })
    holder.appendChild(button)
    return button
  }

  _createMoveDownButton (i, holder) {
    const button = this.getButton('', 'movedown', 'button_move_down_title')
    button.classList.add('movedown', 'json-editor-btntype-move')
    button.setAttribute('data-i', i)
    button.addEventListener('click', e => {
      e.preventDefault()
      e.stopPropagation()

      const j = e.currentTarget.getAttribute('data-i') * 1
      const value = this.getValue()

      value.splice(j + 1, 0, value.splice(j, 1)[0])

      this.setValue(value)
      this.onChange(true)
      this.jsoneditor.trigger('moveRow', this.rows[j + 1])
    })
    holder.appendChild(button)
    return button
  }

  addControls () {
    this.collapsed = false
    this.toggle_button = this._createToggleButton()
    if (this.title_controls) {
      this.title.insertBefore(this.toggle_button, this.title.childNodes[0])
      this.toggle_button.addEventListener('click', e => {
        e.preventDefault()
        e.stopPropagation()

        this.setVisibility(this.panel, this.collapsed)
        if (this.collapsed) {
          this.collapsed = false
          this.setButtonText(e.currentTarget, '', 'collapse', 'button_collapse')
        } else {
          this.collapsed = true
          this.setButtonText(e.currentTarget, '', 'expand', 'button_expand')
        }
      })

      /* If it should start collapsed */
      if (this.options.collapsed) {
        trigger(this.toggle_button, 'click')
      }

      /* Collapse button disabled */
      if (this.schema.options && typeof this.schema.options.disable_collapse !== 'undefined') {
        if (this.schema.options.disable_collapse) this.toggle_button.style.display = 'none'
      } else if (this.jsoneditor.options.disable_collapse) {
        this.toggle_button.style.display = 'none'
      }
    }

    /* Add "new row" and "delete last" buttons below editor */
    this.add_row_button = this._createAddRowButton()
    this.delete_last_row_button = this._createDeleteLastRowButton()
    this.remove_all_rows_button = this._createRemoveAllRowsButton()
  }

  _createToggleButton () {
    const button = this.getButton('', 'collapse', 'button_collapse')
    button.classList.add('json-editor-btntype-toggle')
    return button
  }

  _createAddRowButton () {
    const button = this.getButton(this.getItemTitle(), 'add', 'button_add_row_title', [this.getItemTitle()])
    button.classList.add('json-editor-btntype-add')
    button.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()

      const editor = this.addRow()
      this.refreshValue()
      this.refreshRowButtons()
      this.onChange(true)
      this.jsoneditor.trigger('addRow', editor)
    })
    this.controls.appendChild(button)
    return button
  }

  _createDeleteLastRowButton () {
    const button = this.getButton('button_delete_last', 'subtract', 'button_delete_last_title', [this.getItemTitle()])
    button.classList.add('json-editor-btntype-deletelast')
    button.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()

      if (!this.askConfirmation()) {
        return false
      }

      const rows = this.getValue()
      const editor = rows.pop()
      this.setValue(rows)
      this.onChange(true)
      this.jsoneditor.trigger('deleteRow', editor)
    })
    this.controls.appendChild(button)
    return button
  }

  _createRemoveAllRowsButton () {
    const button = this.getButton('button_delete_all', 'delete', 'button_delete_all_title')
    button.classList.add('json-editor-btntype-deleteall')
    button.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()

      if (!this.askConfirmation()) {
        return false
      }

      this.setValue([])
      this.onChange(true)
      this.jsoneditor.trigger('deleteAllRows')
    })
    this.controls.appendChild(button)
    return button
  }
}
