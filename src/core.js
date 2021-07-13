import { defaults } from './defaults.js'
import { Validator } from './validator.js'
import { SchemaLoader } from './schemaloader.js'
import { editors } from './editors/index.js'
import { templates } from './templates/index.js'
import { iconlibs } from './iconlibs/index.js'
import { themes } from './themes/index.js'
import { extend, getShadowParent, hasOwnProperty } from './utilities.js'
import { AbstractEditor } from './editor'
import { AbstractTheme } from './theme'
import { AbstractIconLib } from './iconlib'
import styleRules from './style.css.js'

export class JSONEditor {
  constructor (element, options = {}) {
    if (!(element instanceof Element)) throw new Error('element should be an instance of Element')

    this.element = element
    this.options = extend({}, JSONEditor.defaults.options, options)
    this.ready = false
    this.copyClipboard = null
    this.schema = this.options.schema
    this.template = this.options.template
    this.translate = this.options.translate || JSONEditor.defaults.translate
    this.translateProperty = this.options.translateProperty || JSONEditor.defaults.translateProperty
    this.uuid = 0
    this.__data = {}
    const themeName = this.options.theme || JSONEditor.defaults.theme
    const themeClass = JSONEditor.defaults.themes[themeName]

    /* Load editors and selected theme style rules */
    if (!themeClass) throw new Error(`Unknown theme ${themeName}`)
    this.element.setAttribute('data-theme', themeName)
    // eslint-disable-next-line new-cap
    this.theme = new themeClass(this)
    const rules = extend(styleRules, this.getEditorsRules())

    /* Call addNewStyleRulesToShadowRoot if shadowRoot is found, otherwise call addNewStyleRules */
    const addRules = (themeName, rules, shadowRoot) => shadowRoot
      ? this.addNewStyleRulesToShadowRoot(themeName, rules, shadowRoot)
      : this.addNewStyleRules(themeName, rules)

    if (!this.theme.options.disable_theme_rules) {
      /* Attempt to locate a shadowRoot parent (i.e. in Web Components) */
      const shadowRoot = getShadowParent(this.element)
      addRules('default', rules, shadowRoot)
      if (typeof themeClass.rules !== 'undefined') {
        addRules(themeName, themeClass.rules, shadowRoot)
      }
    }

    /* Init icon class */
    const iconClass = JSONEditor.defaults.iconlibs[this.options.iconlib || JSONEditor.defaults.iconlib]
    // eslint-disable-next-line new-cap
    if (iconClass) this.iconlib = new iconClass()

    this.root_container = this.theme.getContainer()
    this.element.appendChild(this.root_container)

    /* Fetch all external refs via ajax */
    const fetchUrl = document.location.origin + document.location.pathname
    const loader = new SchemaLoader(this.options)
    const location = document.location.toString()

    this.expandSchema = (schema, fileBase) => loader.expandSchema(schema, fileBase)
    this.expandRefs = (schema, fileBase) => loader.expandRefs(schema, fileBase)
    this.refs = loader.refs
    this.refs_with_info = loader.refs_with_info

    loader.load(this.schema, schema => {
      const validatorOptions = this.options.custom_validators ? { custom_validators: this.options.custom_validators } : {}

      this.validator = new Validator(this, null, validatorOptions, JSONEditor.defaults)

      const editorClass = this.getEditorClass(schema)

      this.root = this.createEditor(editorClass, {
        jsoneditor: this,
        schema,
        required: true,
        container: this.root_container
      })

      this.root.preBuild()
      this.root.build()
      this.root.postBuild()

      /* Starting data */
      if (hasOwnProperty(this.options, 'startval')) this.root.setValue(this.options.startval)

      this.validation_results = this.validator.validate(this.root.getValue())
      this.root.showValidationErrors(this.validation_results)
      this.ready = true

      /* Fire ready event asynchronously */
      window.requestAnimationFrame(() => {
        if (!this.ready) return
        this.validation_results = this.validator.validate(this.root.getValue())
        this.root.showValidationErrors(this.validation_results)
        this.trigger('ready')
        this.trigger('change')
      })
    }, fetchUrl, location)
  }

  getValue () {
    if (!this.ready) throw new Error("JSON Editor not ready yet.  Listen for 'ready' event before getting the value")

    return this.root.getValue()
  }

  setValue (value) {
    if (!this.ready) throw new Error("JSON Editor not ready yet.  Listen for 'ready' event before setting the value")

    this.root.setValue(value)
    return this
  }

  validate (value) {
    if (!this.ready) throw new Error("JSON Editor not ready yet.  Listen for 'ready' event before validating")

    /* Custom value */
    if (arguments.length === 1) {
      return this.validator.validate(value)
      /* Current value (use cached result) */
    } else {
      return this.validation_results
    }
  }

  destroy () {
    if (this.destroyed) return
    if (!this.ready) return

    this.schema = null
    this.options = null
    this.root.destroy()
    this.root = null
    this.root_container = null
    this.validator = null
    this.validation_results = null
    this.theme = null
    this.iconlib = null
    this.template = null
    this.__data = null
    this.ready = false
    this.element.innerHTML = ''
    this.element.removeAttribute('data-theme')
    this.destroyed = true
  }

  on (event, callback) {
    this.callbacks = this.callbacks || {}
    this.callbacks[event] = this.callbacks[event] || []
    this.callbacks[event].push(callback)

    return this
  }

  off (event, callback) {
    /* Specific callback */
    if (event && callback) {
      this.callbacks = this.callbacks || {}
      this.callbacks[event] = this.callbacks[event] || []
      const newcallbacks = []
      for (let i = 0; i < this.callbacks[event].length; i++) {
        if (this.callbacks[event][i] === callback) continue
        newcallbacks.push(this.callbacks[event][i])
      }
      this.callbacks[event] = newcallbacks
    } else if (event) {
      /* All callbacks for a specific event */
      this.callbacks = this.callbacks || {}
      this.callbacks[event] = []
    } else {
      /* All callbacks for all events */
      this.callbacks = {}
    }

    return this
  }

  trigger (event, editor) {
    if (this.callbacks && this.callbacks[event] && this.callbacks[event].length) {
      for (let i = 0; i < this.callbacks[event].length; i++) {
        this.callbacks[event][i].apply(this, [editor])
      }
    }

    return this
  }

  setOption (option, value) {
    if (option === 'show_errors') {
      this.options.show_errors = value
      this.onChange()
    } else {
      /* Only the `show_errors` option is supported for now */
      throw new Error(`Option ${option} must be set during instantiation and cannot be changed later`)
    }

    return this
  }

  getEditorsRules () {
    const extendRule = (rules, editorClass) => editorClass.rules ? extend(rules, editorClass.rules) : rules
    return Object.values(JSONEditor.defaults.editors).reduce(extendRule, {})
  }

  getEditorClass (schema) {
    let classname

    schema = this.expandSchema(schema)

    JSONEditor.defaults.resolvers.find(resolver => {
      classname = resolver(schema)
      return classname && JSONEditor.defaults.editors[classname]
    })
    if (!classname) throw new Error(`Unknown editor for schema ${JSON.stringify(schema)}`)
    if (!JSONEditor.defaults.editors[classname]) throw new Error(`Unknown editor ${classname}`)
    return JSONEditor.defaults.editors[classname]
  }

  createEditor (editorClass, options, depthCounter = 1) {
    options = extend({}, editorClass.options || {}, options)
    // eslint-disable-next-line new-cap
    return new editorClass(options, JSONEditor.defaults, depthCounter)
  }

  onChange () {
    if (!this.ready) return

    if (this.firing_change) return
    this.firing_change = true

    window.requestAnimationFrame(() => {
      this.firing_change = false
      if (!this.ready) return

      /* Validate and cache results */
      this.validation_results = this.validator.validate(this.root.getValue())

      if (this.options.show_errors !== 'never') {
        this.root.showValidationErrors(this.validation_results)
      } else {
        this.root.showValidationErrors([])
      }

      /* Fire change event */
      this.trigger('change')
    })

    return this
  }

  compileTemplate (template, name = JSONEditor.defaults.template) {
    let engine

    /* Specifying a preset engine */
    if (typeof name === 'string') {
      if (!JSONEditor.defaults.templates[name]) throw new Error(`Unknown template engine ${name}`)
      engine = JSONEditor.defaults.templates[name]()

      if (!engine) throw new Error(`Template engine ${name} missing required library.`)
    } else {
      /* Specifying a custom engine */
      engine = name
    }

    if (!engine) throw new Error('No template engine set')
    if (!engine.compile) throw new Error('Invalid template engine set')

    return engine.compile(template)
  }

  _data (el, key, value) {
    /* Setting data */
    if (arguments.length === 3) {
      let uuid
      if (el.hasAttribute(`data-jsoneditor-${key}`)) {
        uuid = el.getAttribute(`data-jsoneditor-${key}`)
      } else {
        uuid = this.uuid++
        el.setAttribute(`data-jsoneditor-${key}`, uuid)
      }

      this.__data[uuid] = value
    } else {
      /* Getting data */
      /* No data stored */
      if (!el.hasAttribute(`data-jsoneditor-${key}`)) return null

      return this.__data[el.getAttribute(`data-jsoneditor-${key}`)]
    }
  }

  registerEditor (editor) {
    this.editors = this.editors || {}
    this.editors[editor.path] = editor
    return this
  }

  unregisterEditor (editor) {
    this.editors = this.editors || {}
    this.editors[editor.path] = null
    return this
  }

  getEditor (path) {
    if (!this.editors) return
    return this.editors[path]
  }

  watch (path, callback) {
    this.watchlist = this.watchlist || {}
    this.watchlist[path] = this.watchlist[path] || []
    this.watchlist[path].push(callback)

    return this
  }

  unwatch (path, callback) {
    if (!this.watchlist || !this.watchlist[path]) return this
    /* If removing all callbacks for a path */
    if (!callback) {
      this.watchlist[path] = null
      return this
    }

    const newlist = []
    for (let i = 0; i < this.watchlist[path].length; i++) {
      if (this.watchlist[path][i] === callback) continue
      else newlist.push(this.watchlist[path][i])
    }
    this.watchlist[path] = newlist.length ? newlist : null
    return this
  }

  notifyWatchers (path) {
    if (!this.watchlist || !this.watchlist[path]) return this
    for (let i = 0; i < this.watchlist[path].length; i++) {
      this.watchlist[path][i]()
    }
  }

  isEnabled () {
    return !this.root || this.root.isEnabled()
  }

  enable () {
    this.root.enable()
  }

  disable () {
    this.root.disable()
  }

  setCopyClipboardContents (value) {
    this.copyClipboard = value
  }

  getCopyClipboardContents () {
    return this.copyClipboard
  }

  addNewStyleRules (themeName, rules) {
    let styleTag = document.querySelector(`#theme-${themeName}`)

    if (!styleTag) {
      styleTag = document.createElement('style')
      styleTag.setAttribute('id', `theme-${themeName}`)
      styleTag.appendChild(document.createTextNode(''))
      document.head.appendChild(styleTag)
    }

    const sheet = styleTag.sheet ? styleTag.sheet : styleTag.styleSheet
    const qualifier = this.element.nodeName.toLowerCase()
    while (sheet.cssRules.length > 0) {
      sheet.deleteRule(0)
    }
    Object.keys(rules).forEach(selector => {
      const sel = themeName === 'default' ? selector : `${qualifier}[data-theme="${themeName}"] ${selector}`

      // all browsers, except IE before version 9
      if (sheet.insertRule) sheet.insertRule(sel + ' {' + decodeURIComponent(rules[selector]) + '}', 0)
      // Internet Explorer before version 9
      else if (sheet.addRule) sheet.addRule(sel, decodeURIComponent(rules[selector]), 0)
    })
  }

  addNewStyleRulesToShadowRoot (themeName, rules, shadowRoot) {
    const qualifier = this.element.nodeName.toLowerCase()
    let cssText = ''

    Object.keys(rules).forEach(selector => {
      const sel = themeName === 'default' ? selector : `${qualifier}[data-theme="${themeName}"] ${selector}`
      cssText += sel + ' {' + decodeURIComponent(rules[selector]) + '}' + '\n'
    })
    const styleSheet = new CSSStyleSheet()
    styleSheet.replaceSync(cssText)
    shadowRoot.adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets, styleSheet]
  }
}

JSONEditor.defaults = defaults
JSONEditor.AbstractEditor = AbstractEditor
JSONEditor.AbstractTheme = AbstractTheme
JSONEditor.AbstractIconLib = AbstractIconLib

Object.assign(JSONEditor.defaults.themes, themes)
Object.assign(JSONEditor.defaults.editors, editors)
Object.assign(JSONEditor.defaults.templates, templates)
Object.assign(JSONEditor.defaults.iconlibs, iconlibs)
