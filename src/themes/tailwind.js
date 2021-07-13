import { AbstractTheme } from '../theme.js'
import rules from './tailwind.css.js'

const options = {
  disable_theme_rules: false, /* Disable creation of Inline Style Rules */
  label_bold: false, /* Element labels bold */
  object_panel_default: true, /* Indicates whether to use rules as default or alternate style */
  object_indent: true, /* Indent nested object elements */
  object_border: false, /* Add border around object elements */
  table_border: false, /* Add border to array "table" row and cells */
  table_hdiv: false, /* Add bottom-border to array "table" cells */
  table_zebrastyle: false, /* Add "zebra style" to array "table" rows */
  input_size: 'small', /* Size of input and select elements. "small", "normal", "large" */
  enable_compact: false
}

export class tailwindTheme extends AbstractTheme {
  constructor (jsoneditor) {
    super(jsoneditor, options)
  }

  getGridContainer () {
    const el = document.createElement('div')
    el.classList.add('flex', 'flex-col', 'w-full')
    if (!this.options.object_indent) el.classList.add('je-noindent')
    return el
  }

  getGridRow () {
    const el = document.createElement('div')
    el.classList.add('flex', 'flex-wrap', 'w-full')
    return el
  }

  getGridColumn () {
    const el = document.createElement('div')
    el.classList.add('flex', 'flex-col')
    return el
  }

  setGridColumnSize (el, size, offset) {
    if (size > 0 && size < 12) { el.classList.add(`w-${size}/12`, 'px-1') } else el.classList.add('w-full', 'px-1')

    if (offset) el.style.marginLeft = `${(100 / 12) * offset}%`
  }

  getIndentedPanel () {
    const el = document.createElement('div')
    if (this.options.object_panel_default) { el.classList.add('w-full', 'p-1') } else { el.classList.add('relative', 'flex', 'flex-col', 'rounded', 'break-words', 'border', 'bg-white', 'border-0', 'border-blue-400', 'p-1', 'shadow-md') }
    if (this.options.object_border) el.classList.add('je-border')
    return el
  }

  /* Used for "type: array" with "format: tabs-top" */
  getTopIndentedPanel () {
    const el = document.createElement('div')
    if (this.options.object_panel_default) { el.classList.add('w-full', 'm-2') } else { el.classList.add('relative', 'flex', 'flex-col', 'rounded', 'break-words', 'border', 'bg-white', 'border-0', 'border-blue-400', 'p-1', 'shadow-md') }
    if (this.options.object_border) el.classList.add('je-border')
    return el
  }

  getTitle () {
    return this.translateProperty(this.schema.title)
  }

  getSelectInput (options, multiple) {
    const el = super.getSelectInput(options)
    if (multiple) el.classList.add('form-multiselect', 'block', 'py-0', 'h-auto', 'w-full', 'px-1', 'text-sm', 'text-black', 'leading-normal', 'bg-white', 'border', 'border-grey', 'rounded')
    else el.classList.add('form-select', 'block', 'py-0', 'h-6', 'w-full', 'px-1', 'text-sm', 'text-black', 'leading-normal', 'bg-white', 'border', 'border-grey', 'rounded')
    if (this.options.enable_compact) el.classList.add('compact')
    return el
  }

  afterInputReady (input) {
    if (input.controlgroup) return
    input.controlgroup = this.closest(input, '.form-group')
    if (this.closest(input, '.compact')) {
      input.controlgroup.style.marginBottom = 0
    }
  }

  getTextareaInput () {
    const el = super.getTextareaInput()
    el.classList.add('block', 'w-full', 'px-1', 'text-sm', 'leading-normal', 'bg-white', 'text-black', 'border', 'border-grey', 'rounded')
    if (this.options.enable_compact) el.classList.add('compact')
    el.style.height = 0
    return el
  }

  /* Create input field for type="range" */
  getRangeInput (min, max, step) {
    const el = this.getFormInputField('range')
    el.classList.add('slider')
    if (this.options.enable_compact) el.classList.add('compact')
    el.setAttribute('oninput', 'this.setAttribute("value", this.value)')
    el.setAttribute('min', min)
    el.setAttribute('max', max)
    el.setAttribute('step', step)
    return el
  }

  getRangeControl (input, output) {
    const el = super.getRangeControl(input, output)
    el.classList.add('text-center', 'text-black')
    return el
  }

  /* Checkbox elements */
  getCheckbox () {
    const el = this.getFormInputField('checkbox')
    el.classList.add('form-checkbox', 'text-red-600')
    return el
  }

  getCheckboxLabel (text, req) {
    const el = super.getCheckboxLabel(text, req)
    el.classList.add('inline-flex', 'items-center')
    return el
  }

  getFormCheckboxControl (label, input, compact) {
    label.insertBefore(input, label.firstChild) /* Move input into label element */
    if (compact) label.classList.add('inline-flex flex-row')
    return label
  }

  getMultiCheckboxHolder (controls, label, description, infoText) {
    const el = super.getMultiCheckboxHolder(controls, label, description, infoText)
    el.classList.add('inline-flex', 'flex-col')
    return el
  }

  /* Radio elements */
  getFormRadio (attributes) {
    const el = this.getFormInputField('radio')
    el.classList.add('form-radio', 'text-red-600')
    for (const key in attributes) {
      el.setAttribute(key, attributes[key])
    }
    return el
  }

  getFormRadioLabel (text, req) {
    const el = super.getFormRadioLabel(text, req)
    el.classList.add('inline-flex', 'items-center', 'mr-2')
    return el
  }

  getFormRadioControl (label, input, compact) {
    label.insertBefore(input, label.firstChild) /* Move input into label element */
    if (compact) label.classList.add('form-radio')
    return label
  }

  getRadioHolder (schema, controls, label, description, infoText) {
    const el = super.getRadioHolder(controls, label, description, infoText)
    if (schema.options.layout === 'h') el.classList.add('inline-flex', 'flex-row')
    else el.classList.add('inline-flex', 'flex-col')
    return el
  }

  getFormInputLabel (text, req) {
    const el = super.getFormInputLabel(text, req)
    if (this.options.label_bold) el.classList.add('font-bold')
    else el.classList.add('required')
    return el
  }

  getFormInputField (type) {
    const el = super.getFormInputField(type)
    if (!['checkbox', 'radio'].includes(type)) el.classList.add('block', 'w-full', 'px-1', 'text-black', 'text-sm', 'leading-normal', 'bg-white', 'border', 'border-grey', 'rounded')
    if (this.options.enable_compact) el.classList.add('compact')
    return el
  }

  getFormInputDescription (text) {
    const el = document.createElement('p')
    el.classList.add('block', 'mt-1', 'text-xs')
    if (window.DOMPurify) el.innerHTML = window.DOMPurify.sanitize(text)
    else el.textContent = this.cleanText(text)
    return el
  }

  getFormControl (label, input, description, infoText) {
    const group = document.createElement('div')
    group.classList.add('form-group', 'mb-1', 'w-full')
    if (label) {
      label.classList.add('text-xs')

      if (input.type === 'checkbox') {
        input.classList.add('form-checkbox', 'text-xs', 'text-red-600', 'mr-1')
        label.classList.add('items-center', 'flex')
        label = this.getFormCheckboxControl(label, input, false, infoText)
      }

      if (input.type === 'radio') {
        input.classList.add('form-radio', 'text-red-600', 'mr-1')
        label.classList.add('items-center', 'flex')
        label = this.getFormRadioControl(label, input, false, infoText)
      }
      group.appendChild(label)

      if (!['checkbox', 'radio'].includes(input.type) && infoText) group.appendChild(infoText)
    }
    if (!['checkbox', 'radio'].includes(input.type)) {
      if (this.options.input_size === 'small') input.classList.add('text-xs')
      else if (this.options.input_size === 'normal') input.classList.add('text-base')
      else if (this.options.input_size === 'large') input.classList.add('text-xl')
      group.appendChild(input)
    }

    if (description) group.appendChild(description)

    return group
  }

  getHeaderButtonHolder () {
    const el = this.getButtonHolder()
    el.classList.add('text-sm')
    return el
  }

  getButtonHolder () {
    const el = document.createElement('div')
    el.classList.add('flex', 'relative', 'inline-flex', 'align-middle')
    return el
  }

  getButton (text, icon, title) {
    const el = super.getButton(text, icon, title)
    el.classList.add('inline-block', 'align-middle', 'text-center', 'text-sm', 'bg-blue-700', 'text-white', 'py-1', 'pr-1', 'm-2', 'shadow', 'select-none', 'whitespace-no-wrap', 'rounded')
    return el
  }

  /* Button for displaying infotext tooltip */
  getInfoButton (text) {
    const tooltip = document.createElement('a')
    tooltip.classList.add('tooltips', 'float-right')
    tooltip.innerHTML = 'ⓘ'
    const span = document.createElement('span')
    span.innerHTML = text
    tooltip.appendChild(span)

    return tooltip
  }

  getTable () {
    const el = super.getTable()
    if (this.options.table_border) el.classList.add('je-table-border')
    else el.classList.add('table', 'border', 'p-0')
    return el
  }

  getTableRow () {
    const el = super.getTableRow()
    if (this.options.table_border) el.classList.add('je-table-border')
    if (this.options.table_zebrastyle) el.classList.add('je-table-zebra')
    return el
  }

  getTableHeaderCell (text, required) {
    const el = super.getTableHeaderCell(text, required)
    if (this.options.table_border) el.classList.add('je-table-border')
    else if (this.options.table_hdiv) el.classList.add('je-table-hdiv')
    else el.classList.add('text-xs', 'border', 'p-0', 'm-0')
    return el
  }

  getTableCell () {
    const el = super.getTableCell()
    if (this.options.table_border) el.classList.add('je-table-border')
    else if (this.options.table_hdiv) el.classList.add('je-table-hdiv')
    else el.classList.add('border-0', 'p-0', 'm-0')
    return el
  }

  addInputError (input, text) {
    if (!input.controlgroup) return
    input.controlgroup.classList.add('has-error')
    input.classList.add('bg-red-600')
    if (!input.errmsg) {
      input.errmsg = document.createElement('p')
      input.errmsg.classList.add('block', 'mt-1', 'text-xs', 'text-red')
      input.controlgroup.appendChild(input.errmsg)
    } else {
      input.errmsg.style.display = ''
    }
    input.errmsg.textContent = text
  }

  removeInputError (input) {
    if (!input.errmsg) return
    input.errmsg.style.display = 'none'
    input.classList.remove('bg-red-600')
    input.controlgroup.classList.remove('has-error')
  }

  getTabHolder (propertyName) {
    const el = document.createElement('div')
    const pName = typeof propertyName === 'undefined' ? '' : propertyName
    el.innerHTML = `<div class='w-2/12' id='${pName}'><ul class='list-reset pl-0 mb-0'></ul></div><div class='w-10/12' id='${pName}'></div>`
    el.classList.add('flex')
    return el
  }

  addTab (holder, tab) {
    holder.children[0].children[0].appendChild(tab)
  }

  getTopTabHolder (propertyName) {
    const pName = typeof propertyName === 'undefined' ? '' : propertyName
    const el = document.createElement('div')
    el.innerHTML = `<ul class='nav-tabs flex list-reset pl-0 mb-0 border-b border-grey-light' id='${pName}'></ul><div class='p-6 block' id='${pName}'></div>`
    return el
  }

  getTab (text, tabId) {
    const liel = document.createElement('li')
    liel.classList.add('nav-item', 'flex-col', 'text-center', 'text-white', 'bg-blue-500', 'shadow-md', 'border', 'p-2', 'mb-2', 'mr-2', 'hover:bg-blue-400', 'rounded')
    const ael = document.createElement('a')
    ael.classList.add('nav-link', 'text-center')
    ael.setAttribute('href', `#${tabId}`)
    ael.setAttribute('data-toggle', 'tab')
    ael.appendChild(text)
    liel.appendChild(ael)
    return liel
  }

  getTopTab (text, tabId) {
    const el = document.createElement('li')
    el.classList.add('nav-item', 'flex', 'border-l', 'border-t', 'border-r')
    const a = document.createElement('a')
    a.classList.add('nav-link', '-mb-px', 'flex-row', 'text-center', 'bg-white', 'p-2', 'hover:bg-blue-400', 'rounded-t')
    a.setAttribute('href', `#${tabId}`)
    a.setAttribute('data-toggle', 'tab')
    a.appendChild(text)
    el.appendChild(a)
    return el
  }

  getTabContent () {
    const el = document.createElement('div')
    el.setAttribute('role', 'tabpanel')
    return el
  }

  getTopTabContent () {
    const el = document.createElement('div')
    el.setAttribute('role', 'tabpanel')
    return el
  }

  markTabActive (row) {
    row.tab.firstChild.classList.add('block')
    if (row.tab.firstChild.classList.contains('border-b') === true) {
      row.tab.firstChild.classList.add('border-b-0')
      row.tab.firstChild.classList.remove('border-b')
    } else {
      row.tab.firstChild.classList.add('border-b-0')
    }
    if (row.container.classList.contains('hidden') === true) {
      row.container.classList.remove('hidden')
      row.container.classList.add('block')
    } else {
      row.container.classList.add('block')
    }
  }

  markTabInactive (row) {
    if (row.tab.firstChild.classList.contains('border-b-0') === true) {
      row.tab.firstChild.classList.add('border-b')
      row.tab.firstChild.classList.remove('border-b-0')
    } else {
      row.tab.firstChild.classList.add('border-b')
    }
    if (row.container.classList.contains('block') === true) {
      row.container.classList.remove('block')
      row.container.classList.add('hidden')
    }
  }

  getProgressBar () {
    const min = 0
    const max = 100
    const start = 0

    const container = document.createElement('div')
    container.classList.add('progress')

    const bar = document.createElement('div')
    bar.classList.add('bg-blue', 'leading-none', 'py-1', 'text-xs', 'text-center', 'text-white')
    bar.setAttribute('role', 'progressbar')
    bar.setAttribute('aria-valuenow', start)
    bar.setAttribute('aria-valuemin', min)
    bar.setAttribute('aria-valuenax', max)
    bar.innerHTML = `${start}%`
    container.appendChild(bar)

    return container
  }

  updateProgressBar (progressBar, progress) {
    if (!progressBar) return

    const bar = progressBar.firstChild
    const percentage = `${progress}%`
    bar.setAttribute('aria-valuenow', progress)
    bar.style.width = percentage
    bar.innerHTML = percentage
  }

  updateProgressBarUnknown (progressBar) {
    if (!progressBar) return

    const bar = progressBar.firstChild
    progressBar.classList.add('progress', 'bg-blue', 'leading-none', 'py-1', 'text-xs', 'text-center', 'text-white', 'block')
    bar.removeAttribute('aria-valuenow')
    bar.classList.add('w-full')
    bar.innerHTML = ''
  }

  getInputGroup (input, buttons) {
    if (!input) return

    const inputGroupContainer = document.createElement('div')
    inputGroupContainer.classList.add('relative', 'items-stretch', 'w-full')
    inputGroupContainer.appendChild(input)

    const inputGroup = document.createElement('div')
    inputGroup.classList.add('-mr-1')
    inputGroupContainer.appendChild(inputGroup)

    for (let i = 0; i < buttons.length; i++) {
      inputGroup.appendChild(buttons[i])
    }

    return inputGroupContainer
  }
}

/* Custom stylesheet rules. (Does not support comma separated selectors) */
/*  Will create a stylesheet in document head with the id "theme-spectre" if not exists. */
tailwindTheme.rules = rules
