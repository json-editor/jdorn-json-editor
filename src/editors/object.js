import { AbstractEditor } from '../editor.js'
import { extend, hasOwnProperty, trigger } from '../utilities.js'
import rules from './object.css.js'

export class ObjectEditor extends AbstractEditor {
  constructor (options, defaults, depth) {
    super(options, defaults)
    this.currentDepth = depth
  }

  getDefault () {
    return extend({}, this.schema.default || {})
  }

  getChildEditors () {
    return this.editors
  }

  register () {
    super.register()
    if (this.editors) {
      Object.values(this.editors).forEach(e => e.register())
    }
  }

  unregister () {
    super.unregister()
    if (this.editors) {
      Object.values(this.editors).forEach(e => e.unregister())
    }
  }

  getNumColumns () {
    return Math.max(Math.min(12, this.maxwidth), 3)
  }

  enable () {
    if (!this.always_disabled) {
      if (this.editjson_control) this.editjson_control.disabled = false
      if (this.addproperty_button) this.addproperty_button.disabled = false

      super.enable()
      if (this.editors) {
        Object.values(this.editors).forEach(e => {
          if (e.isActive()) {
            e.enable()
          }
          e.optInCheckbox.disabled = false
        })
      }
    }
  }

  disable (alwaysDisabled) {
    if (alwaysDisabled) this.always_disabled = true
    if (this.editjson_control) this.editjson_control.disabled = true
    if (this.addproperty_button) this.addproperty_button.disabled = true
    this.hideEditJSON()

    super.disable()
    if (this.editors) {
      Object.values(this.editors).forEach(e => {
        if (e.isActive()) {
          e.disable(alwaysDisabled)
        }
        e.optInCheckbox.disabled = true
      })
    }
  }

  layoutEditors () {
    let i; let j

    if (!this.row_container) return

    /* Sort editors by propertyOrder */
    this.property_order = Object.keys(this.editors)
    this.property_order = this.property_order.sort((a, b) => {
      let ordera = this.editors[a].schema.propertyOrder
      let orderb = this.editors[b].schema.propertyOrder
      if (typeof ordera !== 'number') ordera = 1000
      if (typeof orderb !== 'number') orderb = 1000

      return ordera - orderb
    })

    let container
    const isCategoriesFormat = (this.format === 'categories')
    const rows = []
    let key = null
    let editor = null
    let row

    if (this.format === 'grid-strict') {
      let rowIndex = 0
      row = []

      this.property_order.forEach(key => {
        const editor = this.editors[key]
        if (editor.property_removed) {
          return
        }
        const width = editor.options.hidden ? 0 : (editor.options.grid_columns || editor.getNumColumns())
        const offset = editor.options.hidden ? 0 : (editor.options.grid_offset || 0)
        const gridBreak = editor.options.hidden ? false : (editor.options.grid_break || false)
        const height = editor.options.hidden ? 0 : editor.container.offsetHeight

        const column = {
          key,
          width,
          offset,
          height
        }

        row.push(column)

        rows[rowIndex] = row

        if (gridBreak) {
          rowIndex++
          row = []
        }
      })

      /* layout hasn't changed */
      if (this.layout === JSON.stringify(rows)) return false
      this.layout = JSON.stringify(rows)

      /* Layout the form */
      container = document.createElement('div')
      for (i = 0; i < rows.length; i++) {
        row = this.theme.getGridRow()
        container.appendChild(row)
        for (j = 0; j < rows[i].length; j++) {
          key = rows[i][j].key
          editor = this.editors[key]
          if (editor.options.hidden) {
            editor.container.style.display = 'none'
          } else {
            this.theme.setGridColumnSize(editor.container, rows[i][j].width, rows[i][j].offset)
          }
          row.appendChild(editor.container)
        }
      }
    } else if (this.format === 'grid') {
      this.property_order.forEach(key => {
        const editor = this.editors[key]
        if (editor.property_removed) return
        let found = false
        const width = editor.options.hidden ? 0 : (editor.options.grid_columns || editor.getNumColumns())
        const height = editor.options.hidden ? 0 : editor.container.offsetHeight
        /* See if the editor will fit in any of the existing rows first */
        for (let i = 0; i < rows.length; i++) {
          /* If the editor will fit in the row horizontally */
          if (rows[i].width + width <= 12) {
            /* If the editor is close to the other elements in height */
            /* i.e. Don't put a really tall editor in an otherwise short row or vice versa */
            if (!height || (rows[i].minh * 0.5 < height && rows[i].maxh * 2 > height)) {
              found = i
            }
          }
        }

        /* If there isn't a spot in any of the existing rows, start a new row */
        if (found === false) {
          rows.push({
            width: 0,
            minh: 999999,
            maxh: 0,
            editors: []
          })
          found = rows.length - 1
        }

        rows[found].editors.push({
          key,
          /* editor: editor, */
          width,
          height
        })
        rows[found].width += width
        rows[found].minh = Math.min(rows[found].minh, height)
        rows[found].maxh = Math.max(rows[found].maxh, height)
      })

      /* Make almost full rows width 12 */
      /* Do this by increasing all editors' sizes proprotionately */
      /* Any left over space goes to the biggest editor */
      /* Don't touch rows with a width of 6 or less */
      for (i = 0; i < rows.length; i++) {
        if (rows[i].width < 12) {
          let biggest = false
          let newWidth = 0
          for (j = 0; j < rows[i].editors.length; j++) {
            if (biggest === false) biggest = j
            else if (rows[i].editors[j].width > rows[i].editors[biggest].width) biggest = j
            rows[i].editors[j].width *= 12 / rows[i].width
            rows[i].editors[j].width = Math.floor(rows[i].editors[j].width)
            newWidth += rows[i].editors[j].width
          }
          if (newWidth < 12) rows[i].editors[biggest].width += 12 - newWidth
          rows[i].width = 12
        }
      }

      /* layout hasn't changed */
      if (this.layout === JSON.stringify(rows)) return false
      this.layout = JSON.stringify(rows)

      /* Layout the form */
      container = document.createElement('div')
      for (i = 0; i < rows.length; i++) {
        row = this.theme.getGridRow()
        container.appendChild(row)
        for (j = 0; j < rows[i].editors.length; j++) {
          key = rows[i].editors[j].key
          editor = this.editors[key]

          if (editor.options.hidden) editor.container.style.display = 'none'
          else this.theme.setGridColumnSize(editor.container, rows[i].editors[j].width)
          row.appendChild(editor.container)
        }
      }
      /* Normal layout */
    } else {
      container = document.createElement('div')

      if (isCategoriesFormat) {
        /* A container for properties not object nor arrays */
        const containerSimple = document.createElement('div')
        /* This will be the place to (re)build tabs and panes */
        /* tabs_holder has 2 childs, [0]: ul.nav.nav-tabs and [1]: div.tab-content */
        const newTabsHolder = this.theme.getTopTabHolder(this.translateProperty(this.schema.title))
        /* child [1] of previous, stores panes */
        const newTabPanesContainer = this.theme.getTopTabContentHolder(newTabsHolder)

        this.property_order.forEach(key => {
          const editor = this.editors[key]
          if (editor.property_removed) return
          const aPane = this.theme.getTabContent()
          const isObjOrArray = editor.schema && (editor.schema.type === 'object' || editor.schema.type === 'array')
          /* mark the pane */
          aPane.isObjOrArray = isObjOrArray
          const gridRow = this.theme.getGridRow()

          /* this happens with added properties, they don't have a tab */
          if (!editor.tab) {
            /* Pass the pane which holds the editor */
            if (typeof this.basicPane === 'undefined') {
              /* There is no basicPane yet, so aPane will be it */
              this.addRow(editor, newTabsHolder, aPane)
            } else {
              this.addRow(editor, newTabsHolder, this.basicPane)
            }
          }

          aPane.id = this.getValidId(editor.tab_text.textContent)

          /* For simple properties, add them on the same panel (Basic) */
          if (!isObjOrArray) {
            containerSimple.appendChild(gridRow)
            /* There are already some panes */
            if (newTabPanesContainer.childElementCount > 0) {
              /* If first pane is object or array, insert before a simple pane */
              if (newTabPanesContainer.firstChild.isObjOrArray) {
                /* Append pane for simple properties */
                aPane.appendChild(containerSimple)
                newTabPanesContainer.insertBefore(aPane, newTabPanesContainer.firstChild)
                /* Add "Basic" tab */
                this.theme.insertBasicTopTab(editor.tab, newTabsHolder)
                /* newTabs_holder.firstChild.insertBefore(editor.tab,newTabs_holder.firstChild.firstChild); */
                /* Update the basicPane */
                editor.basicPane = aPane
              } else {
                /* We already have a first "Basic" pane, just add the new property to it, so */
                /* do nothing; */
              }
              /* There is no pane, so add the first (simple) pane */
            } else {
              /* Append pane for simple properties */
              aPane.appendChild(containerSimple)
              newTabPanesContainer.appendChild(aPane)
              /* Add "Basic" tab */
              /* newTabs_holder.firstChild.appendChild(editor.tab); */
              this.theme.addTopTab(newTabsHolder, editor.tab)
              /* Update the basicPane */
              editor.basicPane = aPane
            }
            /* Objects and arrays earn their own panes */
          } else {
            aPane.appendChild(gridRow)
            newTabPanesContainer.appendChild(aPane)
            /* newTabs_holder.firstChild.appendChild(editor.tab); */
            this.theme.addTopTab(newTabsHolder, editor.tab)
          }

          if (editor.options.hidden) editor.container.style.display = 'none'
          else this.theme.setGridColumnSize(editor.container, 12)
          /* Now, add the property editor to the row */
          gridRow.appendChild(editor.container)
          /* Update the rowPane (same as this.rows[x].rowPane) */
          editor.rowPane = aPane
        })

        /* Erase old panes */
        while (this.tabPanesContainer.firstChild) {
          this.tabPanesContainer.removeChild(this.tabPanesContainer.firstChild)
        }

        /* Erase old tabs and set the new ones */
        const parentTabsHolder = this.tabs_holder.parentNode
        parentTabsHolder.removeChild(parentTabsHolder.firstChild)
        parentTabsHolder.appendChild(newTabsHolder)

        this.tabPanesContainer = newTabPanesContainer
        this.tabs_holder = newTabsHolder

        /* Activate the first tab */
        const firstTab = this.theme.getFirstTab(this.tabs_holder)
        if (firstTab) {
          trigger(firstTab, 'click')
        }
        return
        /* Normal layout */
      }
      this.property_order.forEach(key => {
        const editor = this.editors[key]
        if (editor.property_removed) return
        row = this.theme.getGridRow()
        container.appendChild(row)

        if (editor.options.hidden) editor.container.style.display = 'none'
        else this.theme.setGridColumnSize(editor.container, 12)
        row.appendChild(editor.container)
      })
    }
    /* for grid and normal layout */
    while (this.row_container.firstChild) {
      this.row_container.removeChild(this.row_container.firstChild)
    }
    this.row_container.appendChild(container)
  }

  getPropertySchema (key) {
    /* Schema declared directly in properties */
    let schema = this.schema.properties[key] || {}
    schema = extend({}, schema)
    let matched = !!this.schema.properties[key]

    /* Any matching patternProperties should be merged in */
    if (this.schema.patternProperties) {
      Object.keys(this.schema.patternProperties).forEach(i => {
        const regex = new RegExp(i)
        if (regex.test(key)) {
          schema.allOf = schema.allOf || []
          schema.allOf.push(this.schema.patternProperties[i])
          matched = true
        }
      })
    }

    /* Hasn't matched other rules, use additionalProperties schema */
    if (!matched && this.schema.additionalProperties && typeof this.schema.additionalProperties === 'object') {
      schema = extend({}, this.schema.additionalProperties)
    }

    return schema
  }

  preBuild () {
    super.preBuild()

    this.editors = {}
    this.cached_editors = {}

    this.format = this.options.layout || this.options.object_layout || this.schema.format || this.jsoneditor.options.object_layout || 'normal'

    this.schema.properties = this.schema.properties || {}

    this.minwidth = 0
    this.maxwidth = 0

    /* If the object should be rendered as a table row */
    if (this.options.table_row) {
      Object.entries(this.schema.properties).forEach(([key, schema]) => {
        const editor = this.jsoneditor.getEditorClass(schema)
        this.editors[key] = this.jsoneditor.createEditor(editor, {
          jsoneditor: this.jsoneditor,
          schema,
          path: `${this.path}.${key}`,
          parent: this,
          compact: true,
          required: true
        }, this.currentDepth + 1)
        this.editors[key].preBuild()

        const width = this.editors[key].options.hidden ? 0 : (this.editors[key].options.grid_columns || this.editors[key].getNumColumns())

        this.minwidth += width
        this.maxwidth += width
      })
      this.no_link_holder = true
      /* If the object should be rendered as a table */
    } else if (this.options.table) {
      /* TODO: table display format */
      throw new Error('Not supported yet')
      /* If the object should be rendered as a div */
    } else {
      if (!this.schema.defaultProperties) {
        if (this.jsoneditor.options.display_required_only || this.options.display_required_only) {
          this.schema.defaultProperties = Object.keys(this.schema.properties).filter(k => this.isRequiredObject({ key: k, schema: this.schema.properties[k] }))
        } else {
          this.schema.defaultProperties = Object.keys(this.schema.properties)
        }
      }

      /* Increase the grid width to account for padding */
      this.maxwidth += 1

      /* Check for array (eg. meta-schema options is an object) */
      if (Array.isArray(this.schema.defaultProperties)) {
        this.schema.defaultProperties.forEach(key => {
          this.addObjectProperty(key, true)

          if (this.editors[key]) {
            this.minwidth = Math.max(this.minwidth, (this.editors[key].options.grid_columns || this.editors[key].getNumColumns()))
            this.maxwidth += (this.editors[key].options.grid_columns || this.editors[key].getNumColumns())
          }
        })
      }
    }

    /* Sort editors by propertyOrder */
    this.property_order = Object.keys(this.editors)
    this.property_order = this.property_order.sort((a, b) => {
      let ordera = this.editors[a].schema.propertyOrder
      let orderb = this.editors[b].schema.propertyOrder
      if (typeof ordera !== 'number') ordera = 1000
      if (typeof orderb !== 'number') orderb = 1000

      return ordera - orderb
    })
  }

  /* "Borrow" from arrays code */
  addTab (idx) {
    const isObjOrArray = this.rows[idx].schema && (this.rows[idx].schema.type === 'object' || this.rows[idx].schema.type === 'array')
    if (this.tabs_holder) {
      this.rows[idx].tab_text = document.createElement('span')

      if (!isObjOrArray) {
        this.rows[idx].tab_text.textContent = (typeof this.schema.basicCategoryTitle === 'undefined') ? 'Basic' : this.schema.basicCategoryTitle
      } else {
        this.rows[idx].tab_text.textContent = this.rows[idx].getHeaderText()
      }
      this.rows[idx].tab = this.theme.getTopTab(this.rows[idx].tab_text, this.getValidId(this.rows[idx].tab_text.textContent))
      this.rows[idx].tab.addEventListener('click', (e) => {
        this.active_tab = this.rows[idx].tab
        this.refreshTabs()
        e.preventDefault()
        e.stopPropagation()
      })
    }
  }

  addRow (editor, tabHolder, aPane) {
    const rowsLen = this.rows.length
    const isObjOrArray = editor.schema.type === 'object' || editor.schema.type === 'array'

    /* Add a row */
    this.rows[rowsLen] = editor
    /* rowPane stores the editor corresponding pane to set the display style when refreshing Tabs */
    this.rows[rowsLen].rowPane = aPane

    if (!isObjOrArray) {
      /* This is the first simple property to be added, */
      /* add a ("Basic") tab for it and save it's row number */
      if (typeof this.basicTab === 'undefined') {
        this.addTab(rowsLen)
        /* Store the index row of the first simple property added */
        this.basicTab = rowsLen
        this.basicPane = aPane
        this.theme.addTopTab(tabHolder, this.rows[rowsLen].tab)
      } else {
        /* Any other simple property gets the same tab (and the same pane) as the first one, */
        /* so, when 'click' event is fired from a row, it gets the correct ("Basic") tab */
        this.rows[rowsLen].tab = this.rows[this.basicTab].tab
        this.rows[rowsLen].tab_text = this.rows[this.basicTab].tab_text
        this.rows[rowsLen].rowPane = this.rows[this.basicTab].rowPane
      }
    } else {
      this.addTab(rowsLen)
      this.theme.addTopTab(tabHolder, this.rows[rowsLen].tab)
    }
  }

  /* Mark the active tab and make visible the corresponding pane, hide others */
  refreshTabs (refreshHeaders) {
    const basicTabPresent = typeof this.basicTab !== 'undefined'
    let basicTabRefreshed = false

    this.rows.forEach(row => {
      /* If it's an orphan row (some property which has been deleted), return */
      if (!row.tab || !row.rowPane || !row.rowPane.parentNode) return

      if (basicTabPresent && row.tab === this.rows[this.basicTab].tab && basicTabRefreshed) return

      if (refreshHeaders) {
        row.tab_text.textContent = row.getHeaderText()
      } else {
        /* All rows of simple properties point to the same tab, so refresh just once */
        if (basicTabPresent && row.tab === this.rows[this.basicTab].tab) basicTabRefreshed = true

        if (row.tab === this.active_tab) {
          this.theme.markTabActive(row)
        } else {
          this.theme.markTabInactive(row)
        }
      }
    })
  }

  build () {
    const isCategoriesFormat = (this.format === 'categories')
    this.rows = []
    this.active_tab = null

    /* If the object should be rendered as a table row */
    if (this.options.table_row) {
      this.editor_holder = this.container
      Object.entries(this.editors).forEach(([key, editor]) => {
        const holder = this.theme.getTableCell()
        this.editor_holder.appendChild(holder)

        editor.setContainer(holder)
        editor.build()
        editor.postBuild()
        editor.setOptInCheckbox(editor.header)

        if (this.editors[key].options.hidden) {
          holder.style.display = 'none'
        }
        if (this.editors[key].options.input_width) {
          holder.style.width = this.editors[key].options.input_width
        }
      })
      /* If the object should be rendered as a table */
    } else if (this.options.table) {
      /* TODO: table display format */
      throw new Error('Not supported yet')
      /* If the object should be rendered as a div */
    } else {
      this.header = ''
      if (!this.options.compact) {
        this.header = document.createElement('label')
        this.header.textContent = this.getTitle()
      }
      this.title = this.theme.getHeader(this.header, this.getPathDepth())
      this.title.classList.add('je-object__title')
      this.controls = this.theme.getButtonHolder()
      this.controls.classList.add('je-object__controls')

      this.container.appendChild(this.title)
      this.container.appendChild(this.controls)
      this.container.classList.add('je-object__container')

      /* Edit JSON modal */
      this.editjson_holder = this.theme.getModal()
      this.editjson_textarea = this.theme.getTextareaInput()
      this.editjson_textarea.classList.add('je-edit-json--textarea')
      this.editjson_save = this.getButton('button_save', 'save', 'button_save')
      this.editjson_save.classList.add('json-editor-btntype-save')
      this.editjson_save.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.saveJSON()
      })
      this.editjson_copy = this.getButton('button_copy', 'copy', 'button_copy')
      this.editjson_copy.classList.add('json-editor-btntype-copy')
      this.editjson_copy.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.copyJSON()
      })
      this.editjson_cancel = this.getButton('button_cancel', 'cancel', 'button_cancel')
      this.editjson_cancel.classList.add('json-editor-btntype-cancel')
      this.editjson_cancel.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.hideEditJSON()
      })
      this.editjson_holder.appendChild(this.editjson_textarea)
      this.editjson_holder.appendChild(this.editjson_save)
      this.editjson_holder.appendChild(this.editjson_copy)
      this.editjson_holder.appendChild(this.editjson_cancel)

      /* Manage Properties modal */
      this.addproperty_holder = this.theme.getModal()
      this.addproperty_list = document.createElement('div')
      this.addproperty_list.classList.add('property-selector')
      this.addproperty_add = this.getButton('button_add', 'add', 'button_add')
      this.addproperty_add.classList.add('json-editor-btntype-add')

      this.addproperty_input = this.theme.getFormInputField('text')
      this.addproperty_input.setAttribute('placeholder', 'Property name...')
      this.addproperty_input.classList.add('property-selector-input')
      this.addproperty_add.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (this.addproperty_input.value) {
          if (this.editors[this.addproperty_input.value]) {
            window.alert('there is already a property with that name')
            return
          }

          this.addObjectProperty(this.addproperty_input.value)
          if (this.editors[this.addproperty_input.value]) {
            this.editors[this.addproperty_input.value].disable()
          }
          this.onChange(true)
        }
      })
      this.addproperty_input.addEventListener('input', (e) => {
        e.target.previousSibling.childNodes.forEach((value) => {
          if (value.innerText.includes(e.target.value)) {
            value.style.display = ''
          } else {
            value.style.display = 'none'
          }
        })
      })
      this.addproperty_holder.appendChild(this.addproperty_list)
      this.addproperty_holder.appendChild(this.addproperty_input)
      this.addproperty_holder.appendChild(this.addproperty_add)
      const spacer = document.createElement('div')
      spacer.style.clear = 'both'
      this.addproperty_holder.appendChild(spacer)

      /* Close properties modal if clicked outside modal */
      document.addEventListener('click', this.onOutsideModalClick)

      /* Description */
      if (this.schema.description) {
        this.description = this.theme.getDescription(this.translateProperty(this.schema.description))
        this.container.appendChild(this.description)
      }

      /* Validation error placeholder area */
      this.error_holder = document.createElement('div')
      this.container.appendChild(this.error_holder)

      /* Container for child editor area */
      this.editor_holder = this.theme.getIndentedPanel()
      this.container.appendChild(this.editor_holder)

      /* Container for rows of child editors */
      this.row_container = this.theme.getGridContainer()

      if (isCategoriesFormat) {
        this.tabs_holder = this.theme.getTopTabHolder(this.getValidId(this.translateProperty(this.schema.title)))
        this.tabPanesContainer = this.theme.getTopTabContentHolder(this.tabs_holder)
        this.editor_holder.appendChild(this.tabs_holder)
      } else {
        this.tabs_holder = this.theme.getTabHolder(this.getValidId(this.translateProperty(this.schema.title)))
        this.tabPanesContainer = this.theme.getTabContentHolder(this.tabs_holder)
        this.editor_holder.appendChild(this.row_container)
      }

      Object.values(this.editors).forEach(editor => {
        const aPane = this.theme.getTabContent()
        const holder = this.theme.getGridColumn()
        const isObjOrArray = !!((editor.schema && (editor.schema.type === 'object' || editor.schema.type === 'array')))
        aPane.isObjOrArray = isObjOrArray

        if (isCategoriesFormat) {
          if (isObjOrArray) {
            const singleRowContainer = this.theme.getGridContainer()
            singleRowContainer.appendChild(holder)
            aPane.appendChild(singleRowContainer)
            this.tabPanesContainer.appendChild(aPane)
            this.row_container = singleRowContainer
          } else {
            if (typeof this.row_container_basic === 'undefined') {
              this.row_container_basic = this.theme.getGridContainer()
              aPane.appendChild(this.row_container_basic)
              if (this.tabPanesContainer.childElementCount === 0) {
                this.tabPanesContainer.appendChild(aPane)
              } else {
                this.tabPanesContainer.insertBefore(aPane, this.tabPanesContainer.childNodes[1])
              }
            }
            this.row_container_basic.appendChild(holder)
          }

          this.addRow(editor, this.tabs_holder, aPane)

          aPane.id = this.getValidId(editor.schema.title) /* editor.schema.path//tab_text.textContent */
        } else {
          this.row_container.appendChild(holder)
        }

        editor.setContainer(holder)
        editor.build()
        editor.postBuild()
        editor.setOptInCheckbox(editor.header)
      })

      if (this.rows[0]) {
        trigger(this.rows[0].tab, 'click')
      }

      /* Show/Hide button */
      this.collapsed = false
      this.collapse_control = this.getButton('', 'collapse', 'button_collapse')
      this.collapse_control.classList.add('json-editor-btntype-toggle')
      this.title.insertBefore(this.collapse_control, this.title.childNodes[0])

      this.collapse_control.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (this.collapsed) {
          this.editor_holder.style.display = ''
          this.collapsed = false
          this.setButtonText(this.collapse_control, '', 'collapse', 'button_collapse')
        } else {
          this.editor_holder.style.display = 'none'
          this.collapsed = true
          this.setButtonText(this.collapse_control, '', 'expand', 'button_expand')
        }
      })

      /* If it should start collapsed */
      if (this.options.collapsed) {
        trigger(this.collapse_control, 'click')
      }

      /* Collapse button disabled */
      if (this.schema.options && typeof this.schema.options.disable_collapse !== 'undefined') {
        if (this.schema.options.disable_collapse) this.collapse_control.style.display = 'none'
      } else if (this.jsoneditor.options.disable_collapse) {
        this.collapse_control.style.display = 'none'
      }

      /* Edit JSON Button */
      this.editjson_control = this.getButton('JSON', 'edit', 'button_edit_json')
      this.editjson_control.classList.add('json-editor-btntype-editjson')
      this.editjson_control.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.toggleEditJSON()
      })
      this.controls.appendChild(this.editjson_control)
      this.controls.insertBefore(this.editjson_holder, this.controls.childNodes[0])

      /* Edit JSON Buttton disabled */
      if (this.schema.options && typeof this.schema.options.disable_edit_json !== 'undefined') {
        if (this.schema.options.disable_edit_json) this.editjson_control.style.display = 'none'
      } else if (this.jsoneditor.options.disable_edit_json) {
        this.editjson_control.style.display = 'none'
      }

      /* Object Properties Button */
      this.addproperty_button = this.getButton('properties', 'edit_properties', 'button_object_properties')
      this.addproperty_button.classList.add('json-editor-btntype-properties')
      this.addproperty_button.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.toggleAddProperty()
      })
      this.controls.appendChild(this.addproperty_button)
      this.controls.insertBefore(this.addproperty_holder, this.controls.childNodes[1])

      this.refreshAddProperties()

      /* non required properties start deactivated */
      this.deactivateNonRequiredProperties()
    }

    /* Fix table cell ordering */
    if (this.options.table_row) {
      this.editor_holder = this.container
      this.property_order.forEach(key => {
        this.editor_holder.appendChild(this.editors[key].container)
      })
      /* Layout object editors in grid if needed */
    } else {
      /* Initial layout */
      this.layoutEditors()
      /* Do it again now that we know the approximate heights of elements */
      this.layoutEditors()
    }
  }

  deactivateNonRequiredProperties () {
    /* the show_opt_in editor option is for backward compatibility */
    if (this.jsoneditor.options.show_opt_in || this.options.show_opt_in) {
      Object.entries(this.editors).forEach(([key, editor]) => {
        if (!this.isRequiredObject(editor)) {
          this.editors[key].deactivate()
        }
      })
    }
  }

  showEditJSON () {
    if (!this.editjson_holder) return
    this.hideAddProperty()

    /* Position the form directly beneath the button */
    /* TODO: edge detection */
    this.editjson_holder.style.left = `${this.editjson_control.offsetLeft}px`
    this.editjson_holder.style.top = `${this.editjson_control.offsetTop + this.editjson_control.offsetHeight}px`

    /* Start the textarea with the current value */
    this.editjson_textarea.value = JSON.stringify(this.getValue(), null, 2)

    /* Disable the rest of the form while editing JSON */
    this.disable()

    this.editjson_holder.style.display = ''
    this.editjson_control.disabled = false
    this.editing_json = true
  }

  hideEditJSON () {
    if (!this.editjson_holder) return
    if (!this.editing_json) return

    this.editjson_holder.style.display = 'none'
    this.enable()
    this.editing_json = false
  }

  copyJSON () {
    if (!this.editjson_holder) return
    const ta = document.createElement('textarea')
    ta.value = this.editjson_textarea.value
    ta.setAttribute('readonly', '')
    ta.style.position = 'absolute'
    ta.style.left = '-9999px'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }

  saveJSON () {
    if (!this.editjson_holder) return

    try {
      const json = JSON.parse(this.editjson_textarea.value)
      this.setValue(json)
      this.hideEditJSON()
      this.onChange(true)
    } catch (e) {
      window.alert('invalid JSON')
      throw e
    }
  }

  toggleEditJSON () {
    if (this.editing_json) this.hideEditJSON()
    else this.showEditJSON()
  }

  insertPropertyControlUsingPropertyOrder (property, control, container) {
    let propertyOrder
    if (this.schema.properties[property]) { propertyOrder = this.schema.properties[property].propertyOrder }
    if (typeof propertyOrder !== 'number') propertyOrder = 1000
    control.propertyOrder = propertyOrder

    for (let i = 0; i < container.childNodes.length; i++) {
      const child = container.childNodes[i]
      if (control.propertyOrder < child.propertyOrder) {
        this.addproperty_list.insertBefore(control, child)
        control = null
        break
      }
    }
    if (control) {
      this.addproperty_list.appendChild(control)
    }
  }

  addPropertyCheckbox (key) {
    let labelText

    const checkbox = this.theme.getCheckbox()
    checkbox.style.width = 'auto'

    if (this.schema.properties[key] && this.schema.properties[key].title) { labelText = this.schema.properties[key].title } else { labelText = key }

    const label = this.theme.getCheckboxLabel(labelText)

    const control = this.theme.getFormControl(label, checkbox)
    control.style.paddingBottom = control.style.marginBottom = control.style.paddingTop = control.style.marginTop = 0
    control.style.height = 'auto'
    /* control.style.overflowY = 'hidden'; */

    this.insertPropertyControlUsingPropertyOrder(key, control, this.addproperty_list)

    checkbox.checked = key in this.editors
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        this.addObjectProperty(key)
      } else {
        this.removeObjectProperty(key)
      }
      this.onChange(true)
    })
    this.addproperty_checkboxes[key] = checkbox

    return checkbox
  }

  showAddProperty () {
    if (!this.addproperty_holder) return
    this.hideEditJSON()

    /* Position the form directly beneath the button */
    /* TODO: edge detection */
    this.addproperty_holder.style.left = `${this.addproperty_button.offsetLeft}px`
    this.addproperty_holder.style.top = `${this.addproperty_button.offsetTop + this.addproperty_button.offsetHeight}px`

    /* Disable the rest of the form while editing JSON */
    this.disable()

    this.adding_property = true
    this.addproperty_button.disabled = false
    this.addproperty_holder.style.display = ''
    this.refreshAddProperties()
  }

  hideAddProperty () {
    if (!this.addproperty_holder) return
    if (!this.adding_property) return

    this.addproperty_holder.style.display = 'none'
    this.enable()

    this.adding_property = false
  }

  toggleAddProperty () {
    if (this.adding_property) this.hideAddProperty()
    else this.showAddProperty()
  }

  removeObjectProperty (property) {
    if (this.editors[property]) {
      this.editors[property].unregister()
      delete this.editors[property]

      this.refreshValue()
      this.layoutEditors()
    }
  }

  getSchemaOnMaxDepth (schema) {
    return Object.keys(schema).reduce((acc, key) => {
      switch (key) {
        case '$ref':
          return acc
        case 'properties':
        case 'items':
          return {
            ...acc,
            [key]: {}
          }
        case 'additionalProperties':
        case 'propertyNames':
          return {
            ...acc,
            [key]: true
          }
        default:
          return {
            ...acc,
            [key]: schema[key]
          }
      }
    }, {})
  }

  addObjectProperty (name, prebuildOnly) {
    /* Property is already added */
    if (this.editors[name]) return

    /* Property was added before and is cached */
    if (this.cached_editors[name]) {
      this.editors[name] = this.cached_editors[name]
      if (prebuildOnly) return
      this.editors[name].register()
      /* New property */
    } else {
      if (!this.canHaveAdditionalProperties() && (!this.schema.properties || !this.schema.properties[name])) {
        return
      }

      const schema = this.getPropertySchema(name)
      if (typeof schema.propertyOrder !== 'number') {
        /* if the propertyOrder undefined, then set a smart default value. */
        schema.propertyOrder = Object.keys(this.editors).length + 1000
      }

      /* Add the property */
      const editor = this.jsoneditor.getEditorClass(schema)

      const { max_depth: maxDepth } = this.jsoneditor.options

      this.editors[name] = this.jsoneditor.createEditor(editor, {
        jsoneditor: this.jsoneditor,
        schema: !!maxDepth && this.currentDepth >= maxDepth ? this.getSchemaOnMaxDepth(schema) : schema,
        path: `${this.path}.${name}`,
        parent: this
      }, this.currentDepth + 1)
      this.editors[name].preBuild()

      if (!prebuildOnly) {
        const holder = this.theme.getChildEditorHolder()
        this.editor_holder.appendChild(holder)
        this.editors[name].setContainer(holder)
        this.editors[name].build()
        this.editors[name].postBuild()
        this.editors[name].setOptInCheckbox(editor.header)
        this.editors[name].activate()
      }

      this.cached_editors[name] = this.editors[name]
    }

    /* If we're only prebuilding the editors, don't refresh values */
    if (!prebuildOnly) {
      this.refreshValue()
      this.layoutEditors()
    }
  }

  onOutsideModalClick (e) {
    if (this.addproperty_holder &&
      !this.addproperty_holder.contains(e.path[0] || e.composedPath()[0]) &&
      this.adding_property) {
      e.preventDefault()
      e.stopPropagation()
      this.toggleAddProperty()
    }
  }

  onChildEditorChange (editor) {
    this.refreshValue()
    super.onChildEditorChange(editor)
  }

  canHaveAdditionalProperties () {
    if (typeof this.schema.additionalProperties === 'boolean') {
      return this.schema.additionalProperties
    }
    return !this.jsoneditor.options.no_additional_properties
  }

  destroy () {
    Object.values(this.cached_editors).forEach(el => el.destroy())
    if (this.editor_holder) this.editor_holder.innerHTML = ''
    if (this.title && this.title.parentNode) this.title.parentNode.removeChild(this.title)
    if (this.error_holder && this.error_holder.parentNode) this.error_holder.parentNode.removeChild(this.error_holder)

    this.editors = null
    this.cached_editors = null
    if (this.editor_holder && this.editor_holder.parentNode) this.editor_holder.parentNode.removeChild(this.editor_holder)
    this.editor_holder = null
    document.removeEventListener('click', this.onOutsideModalClick)

    super.destroy()
  }

  getValue () {
    if (!this.dependenciesFulfilled) {
      return undefined
    }
    const result = super.getValue()
    const isEmpty = obj => typeof obj === 'undefined' || obj === '' ||
    (
      obj === Object(obj) &&
      Object.keys(obj).length === 0 &&
      obj.constructor === Object
    )
    if (result && (this.jsoneditor.options.remove_empty_properties || this.options.remove_empty_properties)) {
      Object.keys(result).forEach(key => {
        if (isEmpty(result[key])) {
          delete result[key]
        }
      })
    }
    return result
  }

  refreshValue () {
    this.value = {}

    if (!this.editors) {
      return
    }

    Object.keys(this.editors).forEach(i => {
      if (this.editors[i].isActive()) {
        this.value[i] = this.editors[i].getValue()
      }
    })

    if (this.adding_property) this.refreshAddProperties()
  }

  refreshAddProperties () {
    if (this.options.disable_properties || (this.options.disable_properties !== false && this.jsoneditor.options.disable_properties)) {
      this.addproperty_button.style.display = 'none'
      return
    }

    let canAdd = false; let numProps = 0; let showModal = false

    /* Get number of editors */
    Object.keys(this.editors).forEach(i => numProps++)

    /* Determine if we can add back removed properties */
    canAdd = this.canHaveAdditionalProperties() && !(typeof this.schema.maxProperties !== 'undefined' && numProps >= this.schema.maxProperties)

    if (this.addproperty_checkboxes) {
      this.addproperty_list.innerHTML = ''
    }
    this.addproperty_checkboxes = {}

    /* Check for which editors can't be removed or added back */
    Object.keys(this.cached_editors).forEach(i => {
      this.addPropertyCheckbox(i)

      if (this.isRequiredObject(this.cached_editors[i]) && i in this.editors) {
        this.addproperty_checkboxes[i].disabled = true
      }

      if (typeof this.schema.minProperties !== 'undefined' && numProps <= this.schema.minProperties) {
        this.addproperty_checkboxes[i].disabled = this.addproperty_checkboxes[i].checked
        if (!this.addproperty_checkboxes[i].checked) showModal = true
      } else if (!(i in this.editors)) {
        if (!canAdd && !hasOwnProperty(this.schema.properties, i)) {
          this.addproperty_checkboxes[i].disabled = true
        } else {
          this.addproperty_checkboxes[i].disabled = false
          showModal = true
        }
      } else {
        showModal = true
      }
    })

    if (this.canHaveAdditionalProperties()) {
      showModal = true
    }

    /* Additional addproperty checkboxes not tied to a current editor */
    Object.keys(this.schema.properties).forEach(i => {
      if (this.cached_editors[i]) return
      showModal = true
      this.addPropertyCheckbox(i)
    })

    /* If no editors can be added or removed, hide the modal button */
    if (!showModal) {
      this.hideAddProperty()
      this.addproperty_button.style.display = 'none'
      /* If additional properties are disabled */
    } else if (!this.canHaveAdditionalProperties()) {
      this.addproperty_add.style.display = 'none'
      this.addproperty_input.style.display = 'none'
      /* If no new properties can be added */
    } else if (!canAdd) {
      this.addproperty_add.disabled = true
      /* If new properties can be added */
    } else {
      this.addproperty_add.disabled = false
    }
  }

  isRequiredObject (editor) {
    if (!editor) {
      return
    }
    if (typeof editor.schema.required === 'boolean') return editor.schema.required
    else if (Array.isArray(this.schema.required)) return this.schema.required.includes(editor.key)
    else if (this.jsoneditor.options.required_by_default) return true
    return false
  }

  setValue (value, initial) {
    value = value || {}

    if (typeof value !== 'object' || Array.isArray(value)) value = {}

    /* First, set the values for all of the defined properties */
    Object.entries(this.cached_editors).forEach(([i, editor]) => {
      /* Value explicitly set */
      if (typeof value[i] !== 'undefined') {
        this.addObjectProperty(i)
        editor.setValue(value[i], initial)
        editor.activate()
        /* Otherwise, remove value unless this is the initial set or it's required */
      } else if (!initial && !this.isRequiredObject(editor) && !this.options.show_non_required_editors) {
        if (this.jsoneditor.options.show_opt_in || this.options.show_opt_in) {
          editor.deactivate()
        } else {
          this.removeObjectProperty(i)
        }
        /* Otherwise, set the value to the default */
      } else {
        editor.setValue(editor.getDefault(), initial)
      }
    })

    Object.entries(value).forEach(([i, val]) => {
      if (!this.cached_editors[i]) {
        this.addObjectProperty(i)
        if (this.editors[i]) this.editors[i].setValue(val, initial, !!this.editors[i].template)
      }
    })

    this.refreshValue()
    this.layoutEditors()
    this.onChange()
  }

  showValidationErrors (errors) {
    /* Get all the errors that pertain to this editor */
    const myErrors = []
    const otherErrors = []
    errors.forEach(error => {
      if (error.path === this.path) {
        myErrors.push(error)
      } else {
        otherErrors.push(error)
      }
    })

    /* Show errors for this editor */
    if (this.error_holder) {
      if (myErrors.length) {
        this.error_holder.innerHTML = ''
        this.error_holder.style.display = ''
        myErrors.forEach(error => {
          if (error.errorcount && error.errorcount > 1) error.message += ` (${error.errorcount} errors)`
          this.error_holder.appendChild(this.theme.getErrorMessage(error.message))
        })
        /* Hide error area */
      } else {
        this.error_holder.style.display = 'none'
      }
    }

    /* Show error for the table row if this is inside a table */
    if (this.options.table_row) {
      if (myErrors.length) {
        this.theme.addTableRowError(this.container)
      } else {
        this.theme.removeTableRowError(this.container)
      }
    }

    /* Show errors for child editors */
    Object.values(this.editors).forEach(editor => {
      editor.showValidationErrors(otherErrors)
    })
  }
}

ObjectEditor.rules = rules
