import { trigger } from './utilities'

const matchKey = [
  'matches',
  'webkitMatchesSelector',
  'mozMatchesSelector',
  'msMatchesSelector',
  'oMatchesSelector'].find(key => key in document.documentElement)

export class AbstractTheme {
  constructor (jsoneditor, options = { disable_theme_rules: false }) {
    this.jsoneditor = jsoneditor
    Object.keys(options).forEach(key => {
      if (typeof jsoneditor.options[key] !== 'undefined') {
        options[key] = jsoneditor.options[key]
      }
    })
    /* Theme config options that allows changing various aspects of the output */
    this.options = options
  }

  getContainer () {
    return document.createElement('div')
  }

  getFloatRightLinkHolder () {
    const el = document.createElement('div')
    el.classList.add('je-float-right-linkholder')
    return el
  }

  getModal () {
    const el = document.createElement('div')
    el.style.display = 'none'
    el.classList.add('je-modal')
    return el
  }

  getGridContainer () {
    const el = document.createElement('div')
    return el
  }

  getGridRow () {
    const el = document.createElement('div')
    el.classList.add('row')
    return el
  }

  getGridColumn () {
    const el = document.createElement('div')
    return el
  }

  setGridColumnSize (el, size) {
  }

  getLink (text) {
    const el = document.createElement('a')
    el.setAttribute('href', '#')
    el.appendChild(document.createTextNode(text))
    return el
  }

  disableHeader (header) {
    header.style.color = '#ccc'
  }

  disableLabel (label) {
    label.style.color = '#ccc'
  }

  enableHeader (header) {
    header.style.color = ''
  }

  enableLabel (label) {
    label.style.color = ''
  }

  getInfoButton (text) {
    const icon = document.createElement('span')
    icon.innerText = 'ⓘ'
    icon.classList.add('je-infobutton-icon')

    const tooltip = document.createElement('span')
    tooltip.classList.add('je-infobutton-tooltip')
    tooltip.innerText = text
    icon.onmouseover = () => {
      tooltip.style.visibility = 'visible'
    }
    icon.onmouseleave = () => {
      tooltip.style.visibility = 'hidden'
    }

    icon.appendChild(tooltip)

    return icon
  }

  getFormInputLabel (text, req) {
    const el = document.createElement('label')
    el.appendChild(document.createTextNode(text))
    if (req) el.classList.add('required')
    return el
  }

  getHeader (text, pathDepth) {
    const el = document.createElement('h3')
    if (typeof text === 'string') {
      el.textContent = text
    } else {
      el.appendChild(text)
    }
    el.classList.add('je-header')

    return el
  }

  getCheckbox () {
    const el = this.getFormInputField('checkbox')
    el.classList.add('je-checkbox')
    return el
  }

  getCheckboxLabel (text, req) {
    const el = document.createElement('label')
    el.appendChild(document.createTextNode(`\u00A0${text}`))
    if (req) el.classList.add('required')
    return el
  }

  getMultiCheckboxHolder (controls, label, description, infoText) {
    const el = document.createElement('div')
    el.classList.add('control-group')

    if (label) {
      label.style.display = 'block'
      el.appendChild(label)
      if (infoText) label.appendChild(infoText)
    }

    Object.values(controls).forEach(control => {
      control.style.display = 'inline-block'
      control.style.marginRight = '20px'
      el.appendChild(control)
    })

    if (description) el.appendChild(description)

    return el
  }

  getFormCheckboxControl (label, input, compact) {
    const el = document.createElement('div')
    el.appendChild(label)
    input.style.width = 'auto'
    label.insertBefore(input, label.firstChild)
    if (compact) {
      el.classList.add('je-checkbox-control--compact')
    }

    return el
  }

  getFormRadio (attributes) {
    const el = this.getFormInputField('radio')
    Object.keys(attributes).forEach(key => el.setAttribute(key, attributes[key]))
    el.classList.add('je-radio')
    return el
  }

  getFormRadioLabel (text, req) {
    const el = document.createElement('label')
    el.appendChild(document.createTextNode(`\u00A0${text}`))
    if (req) el.classList.add('required')
    return el
  }

  getFormRadioControl (label, input, compact) {
    const el = document.createElement('div')
    el.appendChild(label)
    input.style.width = 'auto'
    label.insertBefore(input, label.firstChild)
    if (compact) {
      el.classList.add('je-radio-control--compact')
    }

    return el
  }

  getSelectInput (options, multiple) {
    const select = document.createElement('select')
    if (options) this.setSelectOptions(select, options)
    return select
  }

  getSwitcher (options) {
    const switcher = this.getSelectInput(options, false)
    switcher.classList.add('je-switcher')
    return switcher
  }

  getSwitcherOptions (switcher) {
    return switcher.getElementsByTagName('option')
  }

  setSwitcherOptions (switcher, options, titles) {
    this.setSelectOptions(switcher, options, titles)
  }

  setSelectOptions (select, options, titles = []) {
    select.innerHTML = ''
    for (let i = 0; i < options.length; i++) {
      const option = document.createElement('option')
      option.setAttribute('value', options[i])
      option.textContent = titles[i] || options[i]
      select.appendChild(option)
    }
  }

  getTextareaInput () {
    const el = document.createElement('textarea')
    el.classList.add('je-textarea')
    return el
  }

  getRangeInput (min, max, step) {
    const el = this.getFormInputField('range')
    el.setAttribute('min', min)
    el.setAttribute('max', max)
    el.setAttribute('step', step)
    return el
  }

  getStepperButtons (input) {
    const div = document.createElement('div')

    const minusBtn = document.createElement('button')
    minusBtn.setAttribute('type', 'button')
    minusBtn.classList.add('stepper-down')

    const plusBtn = document.createElement('button')
    plusBtn.setAttribute('type', 'button')
    plusBtn.classList.add('stepper-up')

    const readonly = input.getAttribute('readonly')

    if (readonly) {
      minusBtn.setAttribute('disabled', true)
      plusBtn.setAttribute('disabled', true)
    }

    minusBtn.textContent = '-'
    plusBtn.textContent = '+'

    const initialize = (input, min) => {
      if (min) {
        input.value = Number(min)
      } else {
        input.value = Number(input.value)
      }
      input.setAttribute('initialized', '1')
    }

    const min = input.getAttribute('min')
    const max = input.getAttribute('max')

    minusBtn.addEventListener('click', () => {
      if (!input.getAttribute('initialized')) {
        initialize(input, min)
      } else if (min) {
        if (Number(input.value) > Number(min)) {
          input.stepDown()
        }
      } else {
        input.stepDown()
      }
      trigger(input, 'change')
    })

    plusBtn.addEventListener('click', () => {
      if (!input.getAttribute('initialized')) {
        initialize(input, min)
      } else if (max) {
        if (Number(input.value) < Number(max)) {
          input.stepUp()
        }
      } else {
        input.stepUp()
      }
      trigger(input, 'change')
    })

    div.appendChild(minusBtn)
    div.appendChild(plusBtn)
    return div
  }

  getRangeOutput (input, startvalue) {
    const output = document.createElement('output')
    output.value = startvalue || 0

    const updateOutput = e => { output.value = e.currentTarget.value }
    input.addEventListener('change', updateOutput, false)
    input.addEventListener('input', updateOutput, false)
    return output
  }

  getRangeControl (input, output) {
    const el = document.createElement('div')
    el.classList.add('je-range-control')
    if (output) el.appendChild(output)
    el.appendChild(input)
    return el
  }

  getFormInputField (type) {
    const el = document.createElement('input')
    el.setAttribute('type', type)
    return el
  }

  afterInputReady (input) {

  }

  getFormControl (label, input, description, infoText, formName) {
    const el = document.createElement('div')
    el.classList.add('form-control')
    if (label) {
      el.appendChild(label)
      if (formName) label.setAttribute('for', formName)
    }
    if ((input.type === 'checkbox' || input.type === 'radio') && label) {
      input.style.width = 'auto'
      label.insertBefore(input, label.firstChild)
      if (infoText) label.appendChild(infoText)
    } else {
      if (infoText && label) label.appendChild(infoText)
      el.appendChild(input)
    }

    if (description) el.appendChild(description)
    return el
  }

  getIndentedPanel () {
    const el = document.createElement('div')
    el.classList.add('je-indented-panel')
    return el
  }

  getTopIndentedPanel () {
    const el = document.createElement('div')
    el.classList.add('je-indented-panel--top')
    return el
  }

  getChildEditorHolder () {
    return document.createElement('div')
  }

  getDescription (text) {
    const el = document.createElement('p')
    if (window.DOMPurify) el.innerHTML = window.DOMPurify.sanitize(text)
    else el.textContent = this.cleanText(text)
    return el
  }

  getCheckboxDescription (text) {
    return this.getDescription(text)
  }

  getFormInputDescription (text) {
    return this.getDescription(text)
  }

  getButtonHolder () {
    return document.createElement('span')
  }

  getHeaderButtonHolder () {
    return this.getButtonHolder()
  }

  getFormButtonHolder (buttonAlign) {
    return this.getButtonHolder()
  }

  getButton (text, icon, title) {
    const el = document.createElement('button')
    el.type = 'button'
    this.setButtonText(el, text, icon, title)
    return el
  }

  getFormButton (text, icon, title) {
    return this.getButton(text, icon, title)
  }

  setButtonText (button, text, icon, title) {
    /* Clear previous contents. https://jsperf.com/innerhtml-vs-removechild/37 */
    while (button.firstChild) {
      button.removeChild(button.firstChild)
    }
    if (icon) {
      button.appendChild(icon)
      text = ` ${text}`
    }
    if (!this.jsoneditor.options.iconlib || !this.jsoneditor.options.remove_button_labels || !icon) {
      const spanEl = document.createElement('span')
      spanEl.appendChild(document.createTextNode(text))
      button.appendChild(spanEl)
    }
    if (title) button.setAttribute('title', title)
  }

  /* Table functions */
  getTable () {
    return document.createElement('table')
  }

  getTableRow () {
    return document.createElement('tr')
  }

  getTableHead () {
    return document.createElement('thead')
  }

  getTableBody () {
    return document.createElement('tbody')
  }

  getTableHeaderCell (text, required) {
    const el = document.createElement('th')
    el.textContent = text
    return el
  }

  getTableCell () {
    const el = document.createElement('td')
    return el
  }

  getErrorMessage (text) {
    const el = document.createElement('p')
    el.style = el.style || {}
    el.style.color = 'red'
    el.appendChild(document.createTextNode(text))
    return el
  }

  addInputError (input, text) {
  }

  removeInputError (input) {
  }

  addTableRowError (row) {
  }

  removeTableRowError (row) {
  }

  getTabHolder (propertyName) {
    const pName = (typeof propertyName === 'undefined') ? '' : propertyName
    const el = document.createElement('div')
    el.innerHTML = `<div class='je-tabholder tabs'></div><div class='content' id='${pName}'></div><div class='je-tabholder--clear'></div>`
    return el
  }

  getTopTabHolder (propertyName) {
    const pName = (typeof propertyName === 'undefined') ? '' : propertyName
    const el = document.createElement('div')
    el.innerHTML = `<div class='tabs je-tabholder--top'></div><div class='je-tabholder--clear'></div><div class='content' id='${pName}'></div>`
    return el
  }

  applyStyles (el, styles) {
    Object.keys(styles).forEach(i => (el.style[i] = styles[i]))
  }

  closest (elem, selector) {
    while (elem && elem !== document) {
      if (elem[matchKey]) {
        if (elem[matchKey](selector)) {
          return elem
        } else {
          elem = elem.parentNode
        }
      } else {
        return false
      }
    }
    return false
  }

  insertBasicTopTab (tab, newTabsHolder) {
    newTabsHolder.firstChild.insertBefore(tab, newTabsHolder.firstChild.firstChild)
  }

  getTab (span, tabId) {
    const el = document.createElement('div')
    el.appendChild(span)
    el.id = tabId
    el.classList.add('je-tab')
    return el
  }

  getTopTab (span, tabId) {
    const el = document.createElement('div')
    el.appendChild(span)
    el.id = tabId
    el.classList.add('je-tab--top')
    return el
  }

  getTabContentHolder (tabHolder) {
    return tabHolder.children[1]
  }

  getTopTabContentHolder (tabHolder) {
    return tabHolder.children[1]
  }

  getTabContent () {
    return this.getIndentedPanel()
  }

  getTopTabContent () {
    return this.getTopIndentedPanel()
  }

  markTabActive (row) {
    this.applyStyles(row.tab, {
      opacity: 1,
      background: 'white'
    })
    if (typeof row.rowPane !== 'undefined') {
      row.rowPane.style.display = ''
    } else {
      row.container.style.display = ''
    }
  }

  markTabInactive (row) {
    this.applyStyles(row.tab, {
      opacity: 0.5,
      background: ''
    })
    if (typeof row.rowPane !== 'undefined') {
      row.rowPane.style.display = 'none'
    } else {
      row.container.style.display = 'none'
    }
  }

  addTab (holder, tab) {
    holder.children[0].appendChild(tab)
  }

  addTopTab (holder, tab) {
    holder.children[0].appendChild(tab)
  }

  getBlockLink () {
    const link = document.createElement('a')
    link.classList.add('je-block-link')
    return link
  }

  getBlockLinkHolder () {
    const el = document.createElement('div')
    return el
  }

  getLinksHolder () {
    const el = document.createElement('div')
    return el
  }

  createMediaLink (holder, link, media) {
    holder.appendChild(link)
    media.classList.add('je-media')
    holder.appendChild(media)
  }

  createImageLink (holder, link, image) {
    holder.appendChild(link)
    link.appendChild(image)
  }

  getFirstTab (holder) {
    return holder.firstChild.firstChild
  }

  getInputGroup (input, buttons) {
    return undefined
  }

  cleanText (txt) {
    /* Clean out HTML tags from txt */
    const tmp = document.createElement('div')
    tmp.innerHTML = txt
    return (tmp.textContent || tmp.innerText)
  }

  getDropZone (text) {
    const el = document.createElement('div')
    el.setAttribute('data-text', text)
    el.classList.add('je-dropzone')
    return el
  }

  /* file is an object with properties: name, type, mimeType, size amd formattedSize */
  getUploadPreview (file, uploadButton, data) {
    const preview = document.createElement('div')
    preview.classList.add('je-upload-preview')

    if (file.mimeType.substr(0, 5) === 'image') {
      const img = document.createElement('img')
      img.src = data
      preview.appendChild(img)
    }
    const info = document.createElement('div')
    info.innerHTML += `<strong>Name:</strong> ${file.name}<br><strong>Type:</strong> ${file.type}<br><strong>Size:</strong> ${file.formattedSize}`
    preview.appendChild(info)

    preview.appendChild(uploadButton)

    const clear = document.createElement('div')
    clear.style.clear = 'left'
    preview.appendChild(clear)

    return preview
  }

  getProgressBar () {
    const max = 100; const start = 0

    const progressBar = document.createElement('progress')
    progressBar.setAttribute('max', max)
    progressBar.setAttribute('value', start)
    return progressBar
  }

  updateProgressBar (progressBar, progress) {
    if (!progressBar) return
    progressBar.setAttribute('value', progress)
  }

  updateProgressBarUnknown (progressBar) {
    if (!progressBar) return
    progressBar.removeAttribute('value')
  }
}
