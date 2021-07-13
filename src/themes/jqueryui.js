import { AbstractTheme } from '../theme.js'

export class jqueryuiTheme extends AbstractTheme {
  getTable () {
    const el = super.getTable()
    el.setAttribute('cellpadding', 5)
    el.setAttribute('cellspacing', 0)
    return el
  }

  getTableHeaderCell (text, required) {
    const el = super.getTableHeaderCell(text, required)
    el.classList.add('ui-state-active')
    el.style.fontWeight = 'bold'
    return el
  }

  getTableCell () {
    const el = super.getTableCell()
    el.classList.add('ui-widget-content')
    return el
  }

  getHeaderButtonHolder () {
    const el = this.getButtonHolder()
    el.style.marginLeft = '10px'
    el.style.fontSize = '.6em'
    el.style.display = 'inline-block'
    return el
  }

  getFormInputDescription (text) {
    const el = this.getDescription(text)
    el.style.marginLeft = '10px'
    el.style.display = 'inline-block'
    return el
  }

  getFormControl (label, input, description, infoText) {
    const el = super.getFormControl(label, input, description, infoText)
    if (input.type === 'checkbox') {
      el.style.lineHeight = '25px'

      el.style.padding = '3px 0'
    } else {
      el.style.padding = '4px 0 8px 0'
    }
    return el
  }

  getDescription (text) {
    const el = document.createElement('span')
    el.style.fontSize = '.8em'
    el.style.fontStyle = 'italic'
    if (window.DOMPurify) el.innerHTML = window.DOMPurify.sanitize(text)
    else el.textContent = this.cleanText(text)
    return el
  }

  getButtonHolder () {
    const el = document.createElement('div')
    el.classList.add('ui-buttonset')
    el.style.fontSize = '.7em'
    return el
  }

  getFormInputLabel (text, req) {
    const el = document.createElement('label')
    el.style.fontWeight = 'bold'
    el.style.display = 'block'
    el.textContent = text
    if (req) el.classList.add('required')
    return el
  }

  getButton (text, icon, title) {
    const button = document.createElement('button')
    button.classList.add('ui-button', 'ui-widget', 'ui-state-default', 'ui-corner-all')

    /* Icon only */
    if (icon && !text) {
      button.classList.add('ui-button-icon-only')
      icon.classList.add('ui-button-icon-primary', 'ui-icon-primary')
      button.appendChild(icon)
      /* Icon and Text */
    } else if (icon) {
      button.classList.add('ui-button-text-icon-primary')
      icon.classList.add('ui-button-icon-primary', 'ui-icon-primary')
      button.appendChild(icon)
      /* Text only */
    } else {
      button.classList.add('ui-button-text-only')
    }

    const el = document.createElement('span')
    el.classList.add('ui-button-text')
    el.textContent = text || title || '.'
    button.appendChild(el)

    button.setAttribute('title', title)

    return button
  }

  setButtonText (button, text, icon, title) {
    button.innerHTML = ''
    button.classList.add('ui-button', 'ui-widget', 'ui-state-default', 'ui-corner-all')

    /* Icon only */
    if (icon && !text) {
      button.classList.add('ui-button-icon-only')
      icon.classList.add('ui-button-icon-primary', 'ui-icon-primary')
      button.appendChild(icon)
      /* Icon and Text */
    } else if (icon) {
      button.classList.add('ui-button-text-icon-primary')
      icon.classList.add('ui-button-icon-primary', 'ui-icon-primary')
      button.appendChild(icon)
      /* Text only */
    } else {
      button.classList.add('ui-button-text-only')
    }

    const el = document.createElement('span')
    el.classList.add('ui-button-text')
    el.textContent = text || title || '.'
    button.appendChild(el)

    button.setAttribute('title', title)
  }

  getIndentedPanel () {
    const el = document.createElement('div')
    el.classList.add('ui-widget-content', 'ui-corner-all')
    el.style.padding = '1em 1.4em'
    el.style.marginBottom = '20px'
    return el
  }

  afterInputReady (input) {
    if (input.controls) return
    input.controls = this.closest(input, '.form-control')
    if (this.queuedInputErrorText) {
      const text = this.queuedInputErrorText
      delete this.queuedInputErrorText
      this.addInputError(input, text)
    }
  }

  addInputError (input, text) {
    if (!input.controls) {
      this.queuedInputErrorText = text
      return
    }
    if (!input.errmsg) {
      input.errmsg = document.createElement('div')
      input.errmsg.classList.add('ui-state-error')
      input.controls.appendChild(input.errmsg)
    } else {
      input.errmsg.style.display = ''
    }

    input.errmsg.textContent = text
  }

  removeInputError (input) {
    if (!input.controls) {
      delete this.queuedInputErrorText
    }
    if (!input.errmsg) return
    input.errmsg.style.display = 'none'
  }

  markTabActive (row) {
    row.tab.classList.remove('ui-widget-header')
    row.tab.classList.add('ui-state-active')

    if (typeof row.rowPane !== 'undefined') {
      row.rowPane.style.display = ''
    } else {
      row.container.style.display = ''
    }
  }

  markTabInactive (row) {
    row.tab.classList.add('ui-widget-header')
    row.tab.classList.remove('ui-state-active')

    if (typeof row.rowPane !== 'undefined') {
      row.rowPane.style.display = 'none'
    } else {
      row.container.style.display = 'none'
    }
  }
}

/* Custom stylesheet rules. format: "selector" : "CSS rules" */
jqueryuiTheme.rules = { 'div[data-schemaid="root"]:after': 'position:relative;color:red;margin:10px 0;font-weight:600;display:block;width:100%;text-align:center;content:"This is an old JSON-Editor 1.x Theme and might not display elements correctly when used with the 2.x version"' }
