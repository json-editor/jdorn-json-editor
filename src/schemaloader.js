import { extend, hasOwnProperty } from './utilities.js'

/**
 * Handles loading Schema and tracking references.
 */
export class SchemaLoader {
  constructor (options) {
    this.options = options || {}
    this.refs = this.options.refs || {}
    this.refs_with_info = {}
    this.refs_prefix = '#/counter/'
    this.refs_counter = 1

    this._subSchema1 = {
      /* Version 3 `type` */
      type (schema) {
        if (typeof schema.type === 'object') {
          schema.type = this._expandSubSchema(schema.type)
        }
      },
      /* Version 3 `disallow` */
      disallow (schema) {
        if (typeof schema.disallow === 'object') {
          schema.disallow = this._expandSubSchema(schema.disallow)
        }
      },
      /* Version 4 `anyOf` */
      anyOf (schema) {
        Object.entries(schema.anyOf).forEach(([key, value]) => {
          schema.anyOf[key] = this.expandSchema(value)
        })
      },
      /* Version 4 `dependencies` (schema dependencies) */
      dependencies (schema) {
        Object.entries(schema.dependencies).forEach(([key, value]) => {
          if (typeof value === 'object' && !(Array.isArray(value))) {
            schema.dependencies[key] = this.expandSchema(value)
          }
        })
      },
      /* Version 4 `not` */
      not (schema) {
        schema.not = this.expandSchema(schema.not)
      }
    }

    this._subSchema2 = {
      /* allOf schemas should be merged into the parent */
      allOf (schema, extended) {
        let _extended = extend({}, extended)
        Object.entries(schema.allOf).forEach(([key, value]) => {
          schema.allOf[key] = this.expandRefs(value, true)
          _extended = this.extendSchemas(_extended, this.expandSchema(value))
        })
        delete _extended.allOf
        return _extended
      },
      /* extends schemas should be merged into parent */
      extends (schema, extended) {
        let _extended
        /* If extends is a schema */
        if (!(Array.isArray(schema.extends))) {
          _extended = this.extendSchemas(extended, this.expandSchema(schema.extends))
        } else {
          /* If extends is an array of schemas */
          _extended = schema.extends.reduce((e, s, i) => {
            return this.extendSchemas(e, this.expandSchema(s))
          }, extended)
        }
        delete _extended.extends
        return _extended
      },
      /* parent should be merged into oneOf schemas */
      oneOf (schema, extended) {
        const tmp = extend({}, extended)
        delete tmp.oneOf
        schema.oneOf.reduce((e, s, i) => {
          e.oneOf[i] = this.extendSchemas(this.expandSchema(s), tmp)
          return e
        }, extended)
        return extended
      }
    }
  }

  /**
   * Fully loads and expands JSON schema for a provided schema object and URL.
   *
   * The callback receives a expanded JSON Schema object with references
   * replaced with loaded schemas.
   *
   * @param {object} schema - A JSON Schema.
   * @param {function} callback - A function that takes a JSON object argument.
   * @param {string} fetchUrl - Base path from which to store the definitions.
   *   Typically the URI of the schema.
   * @param {*} location - The base URL from which to load relative paths.
   */
  load (schema, callback, fetchUrl, location) {
    this._loadExternalRefs(schema, () => {
      this._getDefinitions(schema, `${fetchUrl}#/definitions/`)
      callback(this.expandRefs(schema))
    }, fetchUrl, this._getFileBase(location))
  }

  /**
   * Recursively expands loaded references in a provided schema.
   *
   * @param {object} schema - A JSON Schema with references already loaded.
   * @param {boolean} recurseAllOf - Set true to recurse allOf properties.
   * @returns {object} A JSON Schema with references expanded.
   */
  expandRefs (schema, recurseAllOf) {
    const _schema = extend({}, schema)
    if (!_schema.$ref) return _schema

    const refObj = this.refs_with_info[_schema.$ref]
    delete _schema.$ref
    let fetchUrl = refObj.$ref.startsWith('#')
      ? refObj.fetchUrl
      : ''
    /**
     * @todo 1. Strip JSON pointers
     * @todo 2. Path with pointer
     */
    if (fetchUrl.indexOf('#') > 0) fetchUrl = fetchUrl.substr(0, fetchUrl.indexOf('#'))
    const ref = this._getRef(fetchUrl, refObj)
    if (!this.refs[ref]) { /* if reference not found */
      // eslint-disable-next-line no-console
      console.warn(`reference:'${ref}' not found!`)
    } else if (recurseAllOf && hasOwnProperty(this.refs[ref], 'allOf')) {
      const allOf = this.refs[ref].allOf
      Object.keys(allOf).forEach(key => {
        allOf[key] = this.expandRefs(allOf[key], true)
      })
    }

    return this.extendSchemas(_schema, this.expandSchema(this.refs[ref]))
  }

  /**
   * Expands a JSON schema and its references.
   *
   * @param {object} schema - A JSON Schema with references already loaded.
   * @returns {object} A JSON Schema with references expanded.
   */
  expandSchema (schema) {
    Object.entries(this._subSchema1).forEach(([key, func]) => {
      if (schema[key]) {
        func.call(this, schema)
      }
    })

    let extended = extend({}, schema)

    Object.entries(this._subSchema2).forEach(([key, func]) => {
      if (schema[key]) {
        extended = func.call(this, schema, extended)
      }
    })

    return this.expandRefs(extended)
  }

  _getRef (fetchUrl, refObj) {
    const ref = fetchUrl + refObj

    return this.refs[ref] ? ref : fetchUrl + decodeURIComponent(refObj.$ref)
  }

  _expandSubSchema (subschema) {
    /* Array of types */
    if (Array.isArray(subschema)) return subschema.map(m => typeof m === 'object' ? this.expandSchema(m) : m)

    /* Schema */
    return this.expandSchema(subschema)
  }

  /**
   * Populates the refs object from provided schema definitions.
   *
   * @param {object} schema - A JSON Schema with the definitions key present.
   * @param {string} path - Base path from which to store the definitions in refs.
   *   Typically the URI of the schema.
   */
  _getDefinitions (schema, path) {
    if (schema.definitions) {
      Object.keys(schema.definitions).forEach(i => {
        this.refs[path + i] = schema.definitions[i]
        if (schema.definitions[i].definitions) {
          this._getDefinitions(schema.definitions[i], `${path + i}/definitions/`)
        }
      })
    }
  }

  _getExternalRefs (schema, fetchUrl) {
    const refs = {}
    const mergeRefs = newrefs => Object.keys(newrefs).forEach(i => { refs[i] = true })

    if (schema.$ref && typeof schema.$ref !== 'object') {
      let refBase = schema.$ref
      let pointer = ''
      // Strip any JSON pointers found for external refs.
      if (refBase.indexOf('#') > 0) refBase = refBase.substr(0, refBase.indexOf('#'))
      if (refBase !== schema.$ref) pointer = schema.$ref.substr(schema.$ref.indexOf('#') + 1)
      const refCounter = this.refs_prefix + this.refs_counter++ + pointer
      if (schema.$ref.substr(0, 1) !== '#' && !this.refs[schema.$ref]) {
        refs[refBase] = true
      }
      this.refs_with_info[refCounter] = { fetchUrl, $ref: refBase }
      schema.$ref = refCounter
    }

    Object.values(schema).forEach(value => {
      if (!value || typeof value !== 'object') return
      if (Array.isArray(value)) {
        Object.values(value).forEach(e => {
          if (e && typeof e === 'object') {
            mergeRefs(this._getExternalRefs(e, fetchUrl))
          }
        })
      } else {
        mergeRefs(this._getExternalRefs(value, fetchUrl))
      }
    })

    if (schema.id && typeof schema.id === 'string' && schema.id.substr(0, 4) === 'urn:') {
      this.refs[schema.id] = schema
    } else if (schema.$id && typeof schema.$id === 'string' && schema.$id.substr(0, 4) === 'urn:') {
      this.refs[schema.$id] = schema
    }

    return refs
  }

  _getFileBase (location) {
    if (!location) return '/'

    const { ajaxBase } = this.options

    return typeof ajaxBase === 'undefined' ? this._getFileBaseFromFileLocation(location) : ajaxBase
  }

  _getFileBaseFromFileLocation (fileLocationString) {
    const pathItems = fileLocationString.split('/')
    pathItems.pop()
    return `${pathItems.join('/')}/`
  }

  _joinUrl (url, fileBase) {
    var fetchUrl = url

    if (url.substr(0, 7) !== 'http://' &&
      url.substr(0, 8) !== 'https://' &&
      url.substr(0, 5) !== 'blob:' &&
      url.substr(0, 5) !== 'data:' &&
      url.substr(0, 1) !== '#' &&
      url.substr(0, 1) !== '/'
    ) {
      fetchUrl = fileBase + url
    }

    // strip #fragment from URI, so json pointers resolve correctly #928
    if (fetchUrl.indexOf('#') > 0) fetchUrl = fetchUrl.substr(0, fetchUrl.indexOf('#'))

    return fetchUrl
  }

  _isUniformResourceName (uri) {
    return uri.substr(0, 4) === 'urn:'
  }

  _loadExternalRefs (schema, callback, fetchUrl, fileBase) {
    const refs = this._getExternalRefs(schema, fetchUrl)
    let done = false; let waiting = 0

    Object.keys(refs).forEach(uri => {
      if (this.refs[uri]) return

      if (this._isUniformResourceName(uri)) {
        this.refs[uri] = 'loading'
        waiting++

        const urnResolver = this.options.urn_resolver
        let urn = uri
        if (typeof urnResolver !== 'function') {
          // eslint-disable-next-line no-console
          console.log(`No "urn_resolver" callback defined to resolve "${urn}"`)
          throw new Error(`Must set urn_resolver option to a callback to resolve ${urn}`)
        }
        // theoretically a URN can contain a JSON pointer
        if (urn.indexOf('#') > 0) urn = urn.substr(0, urn.indexOf('#'))
        let response
        try {
          response = urnResolver(urn, responseText => {
            try {
              schema = JSON.parse(responseText)
            } catch (e) {
              // eslint-disable-next-line no-console
              console.log(e)
              throw new Error(`Failed to parse external ref ${urn}`)
            }
            if (!(typeof schema === 'boolean' || typeof schema === 'object') || schema === null || Array.isArray(schema)) {
              throw new Error(`External ref does not contain a valid schema - ${urn}`)
            }
            this.refs[uri] = schema
            this._getDefinitions(schema, `${urn}#/definitions/`)
            this._loadExternalRefs(schema, () => {
              waiting--
              if (done && !waiting) {
                callback()
              }
            }, uri, '/')
          })
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log(e)
          throw new Error(`Failed to parse external ref ${urn}`)
        }

        if (typeof response !== 'boolean') {
          throw new Error(`External ref does not contain a valid schema - ${urn}`)
        } else if (response !== true) {
          throw new Error(`External ref did not resolve - ${urn}`)
        }

        return
      }

      if (!this.options.ajax) throw new Error(`Must set ajax option to true to load external ref ${uri}`)
      this.refs[uri] = 'loading'
      waiting++
      let url = this._joinUrl(uri, fileBase)

      const r = new XMLHttpRequest()
      r.overrideMimeType('application/json')
      r.open('GET', url, true)
      if (this.options.ajaxCredentials) r.withCredentials = this.options.ajaxCredentials
      r.onreadystatechange = () => {
        if (r.readyState !== 4) return
        /* Request succeeded */
        if (r.status === 200) {
          let schema
          try {
            schema = JSON.parse(r.responseText)
          } catch (e) {
            // eslint-disable-next-line no-console
            console.log(e)
            throw new Error(`Failed to parse external ref ${url}`)
          }
          if (!(typeof schema === 'boolean' || typeof schema === 'object') || schema === null || Array.isArray(schema)) {
            throw new Error(`External ref does not contain a valid schema - ${url}`)
          }

          this.refs[uri] = schema
          const fileBase = this._getFileBaseFromFileLocation(url)

          // add leading slash
          if (url !== uri) {
            const pathItems = url.split('/')
            url = (uri.substr(0, 1) === '/' ? '/' : '') + pathItems.pop()
          }

          this._getDefinitions(schema, `${url}#/definitions/`)
          this._loadExternalRefs(schema, () => {
            waiting--
            if (done && !waiting) {
              callback()
            }
          }, url, fileBase)
        } else {
          /* Request failed */
          // eslint-disable-next-line no-console
          console.log(r)
          throw new Error(`Failed to fetch ref via ajax - ${uri}`)
        }
      }
      r.send()
    })

    done = true
    if (!waiting) {
      callback()
    }
  }

  extendSchemas (obj1, obj2) {
    obj1 = extend({}, obj1)
    obj2 = extend({}, obj2)

    const extended = {}
    const isRequiredOrDefaultProperties = (prop, val) => (prop === 'required' || prop === 'defaultProperties') && typeof val === 'object' && Array.isArray(val)
    const merge = (prop, val) => {
      /* Required and defaultProperties arrays should be unioned together */
      if (isRequiredOrDefaultProperties(prop, val)) {
        /* Union arrays and unique */
        extended[prop] = val.concat(obj2[prop]).reduce((p, c) => {
          if (!p.includes(c)) p.push(c)
          return p
        }, [])
      } else if (prop === 'type' && (typeof val === 'string' || Array.isArray(val))) {
        mergeType(val)
      } else if (typeof val === 'object' && !Array.isArray(val) && val !== null) {
        /* Objects should be recursively merged */
        extended[prop] = this.extendSchemas(val, obj2[prop])
      } else {
        /* Otherwise, use the first value */
        extended[prop] = val
      }
    }

    const mergeType = (val) => {
      /* Type should be intersected and is either an array or string */
      /* Make sure we're dealing with arrays */
      if (typeof val === 'string') val = [val]
      if (typeof obj2.type === 'string') obj2.type = [obj2.type]

      /* If type is only defined in the first schema, keep it */
      if (!obj2.type || !obj2.type.length) {
        extended.type = val
      } else {
        /* If type is defined in both schemas, do an intersect */
        extended.type = val.filter(n => obj2.type.includes(n))
      }

      /* If there's only 1 type and it's a primitive, use a string instead of array */
      if (extended.type.length === 1 && typeof extended.type[0] === 'string') {
        extended.type = extended.type[0]
      } else if (extended.type.length === 0) {
        /* Remove the type property if it's empty */
        delete extended.type
      }
    }

    Object.entries(obj1).forEach(([prop, val]) => {
      /* If this key is also defined in obj2, merge them */
      if (typeof obj2[prop] !== 'undefined') {
        merge(prop, val)
      } else {
        /* Otherwise, just use the one in obj1 */
        extended[prop] = val
      }
    })

    /* Properties in obj2 that aren't in obj1 */
    Object.entries(obj2).forEach(([prop, val]) => {
      if (typeof obj1[prop] === 'undefined') {
        extended[prop] = val
      }
    })
    return extended
  }
}
