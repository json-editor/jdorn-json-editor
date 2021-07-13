/* Spectre Theme using Spectre CSS framework. <https://picturepan2.github.io/spectre/index.html> */
import { AbstractTheme } from '../theme.js'
import rules from './spectre.css.js'

/* Config options that allows changing various aspects of the output */
const options = {
  disable_theme_rules: false, /* Disable creation of Inline Style Rules */
  label_bold: true, /* Element labels bold */
  align_bottom: false, /* Align elements to bottom of flex container */
  object_indent: false, /* Indent nested object elements */
  object_border: false, /* Add border around object elements */
  table_border: false, /* Add border to array "table" row and cells */
  table_zebrastyle: false, /* Add "zebra style" to array "table" rows */
  input_size: 'normal' /* Size of input and select elements. "small", "normal", "large" */
}

export class spectreTheme extends AbstractTheme {
  constructor (jsoneditor) {
    super(jsoneditor, options)
  }

  /* Functions for setting up the grid container, row and columns */
  setGridColumnSize (el, size, offset) {
    el.classList.add(`col-${size}`)
    if (offset) el.classList.add('col-mx-auto')
  }

  getGridContainer () {
    const el = document.createElement('div')
    el.classList.add('container')
    if (!this.options.object_indent) el.classList.add('je-noindent')
    return el
  }

  getGridRow () {
    const el = document.createElement('div')
    el.classList.add('columns')
    return el
  }

  getGridColumn () {
    const el = document.createElement('div')
    el.classList.add('column')
    if (this.options.align_bottom) el.classList.add('je-align-bottom')
    return el
  }

  /* Used for "type: object" or "type: array" (except if "format: tabs-top") */
  getIndentedPanel () {
    const el = document.createElement('div')
    el.classList.add('je-panel')
    if (this.options.object_border) el.classList.add('je-border')
    return el
  }

  /* Used for "type: array" with "format: tabs-top" */
  getTopIndentedPanel () {
    const el = document.createElement('div')
    el.classList.add('je-panel-top')
    if (this.options.object_border) el.classList.add('je-border')
    return el
  }

  /* Button functions */
  getHeaderButtonHolder () {
    const el = this.getButtonHolder()
    return el
  }

  /* Button holder for the buttons */
  getButtonHolder () {
    const el = super.getButtonHolder()
    el.classList.add('btn-group')
    return el
  }

  getFormButtonHolder (buttonAlign) {
    const el = super.getFormButtonHolder()
    el.classList.remove('btn-group')
    el.classList.add('d-block')
    if (buttonAlign === 'center') el.classList.add('text-center')
    else if (buttonAlign === 'right') el.classList.add('text-right')
    else el.classList.add('text-left')
    return el
  }

  getFormButton (text, icon, title) {
    const el = super.getFormButton(text, icon, title)
    el.classList.add('btn', 'btn-primary', 'mx-2', 'my-1')
    if (this.options.input_size !== 'small') el.classList.remove('btn-sm')
    if (this.options.input_size === 'large') el.classList.add('btn-lg')
    return el
  }

  getButton (text, icon, title) {
    const el = super.getButton(text, icon, title)
    el.classList.add('btn', 'btn-sm', 'btn-primary', 'mr-2', 'my-1')
    return el
  }

  getHeader (text, pathDepth) {
    const el = document.createElement('h4')
    if (typeof text === 'string') {
      el.textContent = text
    } else {
      el.appendChild(text)
    }

    el.style.display = 'inline-block'

    return el
  }

  getFormInputDescription (text) {
    const el = super.getFormInputDescription(text)
    el.classList.add('je-desc', 'hide-sm')
    return el
  }

  /* Label for all elements except checkbox and radio */
  getFormInputLabel (text, req) {
    const el = super.getFormInputLabel(text, req)
    if (this.options.label_bold) el.classList.add('je-label')
    return el
  }

  /* Checkbox elements */
  /* ToDo: Rename function names for consistency */
  getCheckbox () {
    const el = this.getFormInputField('checkbox')
    return el
  }

  getCheckboxLabel (text, req) {
    const el = super.getCheckboxLabel(text, req); const icon = document.createElement('i')
    icon.classList.add('form-icon')
    el.classList.add('form-checkbox', 'mr-5')
    el.insertBefore(icon, el.firstChild)
    return el
  }

  getFormCheckboxControl (label, input, compact) {
    label.insertBefore(input, label.firstChild) /* Move input into label element */
    if (compact) label.classList.add('form-inline')
    return label
  }

  getMultiCheckboxHolder (controls, label, description, infoText) {
    return super.getMultiCheckboxHolder(controls, label, description, infoText)
  }

  /* Radio elements */
  getFormRadio (attributes) {
    const el = this.getFormInputField('radio')
    for (const key in attributes) {
      el.setAttribute(key, attributes[key])
    }
    return el
  }

  getFormRadioLabel (text, req) {
    const el = super.getFormRadioLabel(text, req); const icon = document.createElement('i')
    icon.classList.add('form-icon')
    el.classList.add('form-radio')
    el.insertBefore(icon, el.firstChild)
    return el
  }

  getFormRadioControl (label, input, compact) {
    label.insertBefore(input, label.firstChild) /* Move input into label element */
    if (compact) label.classList.add('form-inline')
    return label
  }

  /* Create input field */
  getFormInputField (type) {
    const el = super.getFormInputField(type)
    if (!['checkbox', 'radio'].includes(type)) {
      el.classList.add('form-input')
    }
    return el
  }

  /* Create input field for type="range" */
  getRangeInput (min, max, step) {
    const el = this.getFormInputField('range')
    el.classList.add('slider')
    el.classList.remove('form-input')
    el.setAttribute('oninput', 'this.setAttribute("value", this.value)')
    el.setAttribute('min', min)
    el.setAttribute('max', max)
    el.setAttribute('step', step)
    return el
  }

  getRangeControl (input, output) {
    const el = super.getRangeControl(input, output)
    el.classList.add('text-center')
    return el
  }

  /* Create select box field */
  getSelectInput (options, multiple) {
    const el = super.getSelectInput(options)
    el.classList.add('form-select')
    return el
  }

  /* Create textarea field */
  getTextareaInput () {
    const el = document.createElement('textarea')
    el.classList.add('form-input')
    return el
  }

  getFormControl (label, input, description, infoText) {
    const group = document.createElement('div')
    group.classList.add('form-group')

    if (label && (input.type === 'checkbox' || input.type === 'radio')) {
      group.classList.add(input.type)
      label.insertBefore(input, label.firstChild)
      group.appendChild(label)
    } else {
      if (label) {
        label.classList.add('form-label')
        group.appendChild(label)
        if (infoText) label.appendChild(infoText)
      }
      group.appendChild(input)
    }

    if (this.options.input_size === 'small') input.classList.add('input-sm', 'select-sm')
    else if (this.options.input_size === 'large') input.classList.add('input-lg', 'select-lg')
    if (input.type !== 'checkbox') group.appendChild(input)

    if (description) group.appendChild(description)

    return group
  }

  /* Create input group (input field with buttons) */
  getInputGroup (input, buttons) {
    if (!input) return

    const inputGroup = document.createElement('div')
    inputGroup.classList.add('input-group')
    inputGroup.appendChild(input)
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].classList.add('input-group-btn')
      buttons[i].classList.remove('btn-sm', 'mr-2', 'my-1')
      inputGroup.appendChild(buttons[i])
    }

    return inputGroup
  }

  /* Create button for displaying infotext tooltip */
  getInfoButton (text) {
    const popover = document.createElement('div')
    popover.classList.add('popover', 'popover-left', 'float-right')

    const button = document.createElement('button')
    button.classList.add('btn', 'btn-secondary', 'btn-info', 'btn-action', 's-circle')
    button.setAttribute('tabindex', '-1') /* exclude element from tab order */
    popover.appendChild(button)

    const icon = document.createTextNode('I')
    button.appendChild(icon)

    const container = document.createElement('div')
    container.classList.add('popover-container')
    popover.appendChild(container)

    const card = document.createElement('div')
    card.classList.add('card')
    container.appendChild(card)

    const cardbody = document.createElement('div')
    cardbody.classList.add('card-body')
    cardbody.innerHTML = text
    card.appendChild(cardbody)

    return popover
  }

  /* Functions for rendering array with format: "table" */
  getTable () {
    const el = super.getTable()
    el.classList.add('table', 'table-scroll')
    if (this.options.table_border) el.classList.add('je-table-border')
    if (this.options.table_zebrastyle) el.classList.add('table-striped')
    return el
  }

  getTableHeaderCell (text, required) {
    const el = document.createElement('th')
    if (required) el.classList.add('required')
    el.textContent = text
    return el
  }

  /* Function for rendering progressbar */
  getProgressBar () {
    const progressBar = super.getProgressBar()
    progressBar.classList.add('progress')
    return progressBar
  }

  /* Containers for array with format: "tab" */
  getTabHolder (propertyName) {
    const pName = typeof propertyName === 'undefined' ? '' : propertyName
    const el = document.createElement('div')
    el.classList.add('columns')
    el.innerHTML = `<div class="column col-2"></div><div class="column col-10 content" id="${pName}"></div>`
    return el
  }

  /* Containers for array with format: "tab-top" */
  getTopTabHolder (propertyName) {
    const pName = typeof propertyName === 'undefined' ? '' : propertyName
    const el = document.createElement('div')
    el.innerHTML = `<ul class="tab"></ul><div class="content" id="${pName}"></div>`
    return el
  }

  /* Tab button for array with format: "tab" */
  getTab (span, tabId) {
    const el = document.createElement('a')
    el.classList.add('btn', 'btn-secondary', 'btn-block')
    el.setAttribute('href', `#${tabId}`)
    el.appendChild(span)
    return el
  }

  /* Tab button for array with format: "tab-top" */
  getTopTab (span, tabId) {
    const el = document.createElement('li')
    el.id = tabId
    el.classList.add('tab-item')

    /* Spectre needs an a tag inside the tab item, not a span */
    const a = document.createElement('a')
    a.setAttribute('href', `#${tabId}`)
    a.appendChild(span)

    el.appendChild(a)
    return el
  }

  markTabActive (row) {
    row.tab.classList.add('active')
    if (typeof row.rowPane !== 'undefined') row.rowPane.style.display = ''
    else row.container.style.display = ''
  }

  markTabInactive (row) {
    row.tab.classList.remove('active')
    if (typeof row.rowPane !== 'undefined') row.rowPane.style.display = 'none'
    else row.container.style.display = 'none'
  }

  afterInputReady (input) {
    if (input.localName === 'select') {
      /* Selectize adjustments */
      if (input.classList.contains('selectized')) {
        const selectized = input.nextSibling
        if (selectized) {
          /* Remove Spectre class 'form-select' as this conflicts with Selectize styling */
          selectized.classList.remove('form-select')
          Array.from(selectized.querySelectorAll('.form-select')).forEach(el => {
            el.classList.remove('form-select')
          })
        }
        /* Select2 ajustments */
      } else if (input.classList.contains('select2-hidden-accessible')) {
        const select2 = input.nextSibling
        const single = select2 && select2.querySelector('.select2-selection--single')
        /* Add Spectre 'form-select' to single-select2 elements */
        if (single) select2.classList.add('form-select')
      }
    }

    if (input.controlgroup) return
    input.controlgroup = this.closest(input, '.form-group')
    if (this.closest(input, '.compact')) {
      input.controlgroup.style.marginBottom = 0
    }
  }

  /* Controls output of errormessages displayed in form */
  addInputError (input, text) {
    if (!input.controlgroup) return
    input.controlgroup.classList.add('has-error')
    if (!input.errmsg) {
      input.errmsg = document.createElement('p')
      input.errmsg.classList.add('form-input-hint')
      input.controlgroup.appendChild(input.errmsg)
    }
    input.errmsg.classList.remove('d-hide')
    input.errmsg.textContent = text
  }

  removeInputError (input) {
    if (!input.errmsg) return
    input.errmsg.classList.add('d-hide')
    input.controlgroup.classList.remove('has-error')
  }
}

/* Custom stylesheet rules. (Does not support comma separated selectors) */
/*  Will create a stylesheet in document head with the id "theme-spectre" if not exists. */
spectreTheme.rules = rules
