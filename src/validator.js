import { ipValidator } from './validators/ip-validator.js'
import { extend, hasOwnProperty } from './utilities.js'

export class Validator {
  constructor (jsoneditor, schema, options, defaults) {
    this.jsoneditor = jsoneditor
    this.schema = schema || this.jsoneditor.schema
    this.options = options || {}
    this.translate = this.jsoneditor.translate || defaults.translate
    this.translateProperty = this.jsoneditor.translateProperty || defaults.translateProperty
    this.defaults = defaults

    this._validateSubSchema = {
      const (schema, value, path) {
        const valid = JSON.stringify(schema.const) === JSON.stringify(value) && !(Array.isArray(value) || typeof value === 'object')
        if (!valid) {
          return [{
            path,
            property: 'const',
            message: this.translate('error_const')
          }]
        }
        return []
      },
      enum (schema, value, path) {
        const stringified = JSON.stringify(value)
        const valid = schema.enum.some(e => stringified === JSON.stringify(e))
        if (!valid) {
          return [{
            path,
            property: 'enum',
            message: this.translate('error_enum')
          }]
        }
        return []
      },
      extends (schema, value, path) {
        const validate = (errors, e) => {
          errors.push(...this._validateSchema(e, value, path))
          return errors
        }
        return schema.extends.reduce(validate, [])
      },
      allOf (schema, value, path) {
        const validate = (errors, e) => {
          errors.push(...this._validateSchema(e, value, path))
          return errors
        }
        return schema.allOf.reduce(validate, [])
      },
      anyOf (schema, value, path) {
        const valid = schema.anyOf.some(e => !this._validateSchema(e, value, path).length)
        if (!valid) {
          return [{
            path,
            property: 'anyOf',
            message: this.translate('error_anyOf')
          }]
        }
        return []
      },
      oneOf (schema, value, path) {
        let valid = 0
        const oneofErrors = []
        schema.oneOf.forEach((o, i) => {
          /* Set the error paths to be path.oneOf[i].rest.of.path */
          const tmp = this._validateSchema(o, value, path)
          if (!tmp.length) {
            valid++
          }

          tmp.forEach(e => {
            e.path = `${path}.oneOf[${i}]${e.path.substr(path.length)}`
          })
          oneofErrors.push(...tmp)
        })
        const errors = []
        if (valid !== 1) {
          errors.push({
            path,
            property: 'oneOf',
            message: this.translate('error_oneOf', [valid])
          })
          errors.push(...oneofErrors)
        }
        return errors
      },
      not (schema, value, path) {
        if (!this._validateSchema(schema.not, value, path).length) {
          return [{
            path,
            property: 'not',
            message: this.translate('error_not')
          }]
        }
        return []
      },
      type (schema, value, path) {
        /* Union type */
        if (Array.isArray(schema.type)) {
          const valid = schema.type.some(e => this._checkType(e, value))
          if (!valid) {
            return [{
              path,
              property: 'type',
              message: this.translate('error_type_union')
            }]
          }
        } else {
          /* Simple type */
          if (['date', 'time', 'datetime-local'].includes(schema.format) && schema.type === 'integer') {
            /* Hack to get validator to validate as string even if value is integer */
            /* As validation of 'date', 'time', 'datetime-local' is done in separate validator */
            if (!this._checkType('string', `${value}`)) {
              return [{
                path,
                property: 'type',
                message: this.translate('error_type', [schema.format])
              }]
            }
          } else if (!this._checkType(schema.type, value)) {
            return [{
              path,
              property: 'type',
              message: this.translate('error_type', [schema.type])
            }]
          }
        }
        return []
      },
      disallow (schema, value, path) {
        /* Union type */
        if (Array.isArray(schema.disallow)) {
          const invalid = schema.disallow.some(e => this._checkType(e, value))
          if (invalid) {
            return [{
              path,
              property: 'disallow',
              message: this.translate('error_disallow_union')
            }]
          }
        } else {
          /* Simple type */
          if (this._checkType(schema.disallow, value)) {
            return [{
              path,
              property: 'disallow',
              message: this.translate('error_disallow', [schema.disallow])
            }]
          }
        }
        return []
      }
    }

    this._validateNumberSubSchema = {
      multipleOf (schema, value, path) { return this._validateNumberSubSchemaMultipleDivisible(schema, value, path) },
      divisibleBy (schema, value, path) { return this._validateNumberSubSchemaMultipleDivisible(schema, value, path) },
      maximum (schema, value, path) {
        /* Vanilla JS, prone to floating point rounding errors (e.g. .999999999999999 == 1) */
        let valid = schema.exclusiveMaximum ? (value < schema.maximum) : (value <= schema.maximum)

        /* Use math.js is available */
        if (window.math) {
          valid = window.math[schema.exclusiveMaximum ? 'smaller' : 'smallerEq'](
            window.math.bignumber(value),
            window.math.bignumber(schema.maximum)
          )
        } else if (window.Decimal) {
          /* Use Decimal.js if available */
          valid = (new window.Decimal(value))[schema.exclusiveMaximum ? 'lt' : 'lte'](new window.Decimal(schema.maximum))
        }

        if (!valid) {
          return [{
            path,
            property: 'maximum',
            message: this.translate(
              (schema.exclusiveMaximum ? 'error_maximum_excl' : 'error_maximum_incl'),
              [schema.maximum]
            )
          }]
        }
        return []
      },
      minimum (schema, value, path) {
        /* Vanilla JS, prone to floating point rounding errors (e.g. .999999999999999 == 1) */
        let valid = schema.exclusiveMinimum ? (value > schema.minimum) : (value >= schema.minimum)

        /* Use math.js is available */
        if (window.math) {
          valid = window.math[schema.exclusiveMinimum ? 'larger' : 'largerEq'](
            window.math.bignumber(value),
            window.math.bignumber(schema.minimum)
          )
          /* Use Decimal.js if available */
        } else if (window.Decimal) {
          valid = (new window.Decimal(value))[schema.exclusiveMinimum ? 'gt' : 'gte'](new window.Decimal(schema.minimum))
        }

        if (!valid) {
          return [{
            path,
            property: 'minimum',
            message: this.translate(
              (schema.exclusiveMinimum ? 'error_minimum_excl' : 'error_minimum_incl'),
              [schema.minimum]
            )
          }]
        }
        return []
      }
    }

    this._validateStringSubSchema = {
      maxLength (schema, value, path) {
        const errors = []
        if ((`${value}`).length > schema.maxLength) {
          errors.push({
            path,
            property: 'maxLength',
            message: this.translate('error_maxLength', [schema.maxLength])
          })
        }
        return errors
      },
      /* `minLength` */
      minLength (schema, value, path) {
        if ((`${value}`).length < schema.minLength) {
          return [{
            path,
            property: 'minLength',
            message: this.translate((schema.minLength === 1 ? 'error_notempty' : 'error_minLength'), [schema.minLength])
          }]
        }
        return []
      },
      /* `pattern` */
      pattern (schema, value, path) {
        if (!(new RegExp(schema.pattern)).test(value)) {
          return [{
            path,
            property: 'pattern',
            message: (schema.options && schema.options.patternmessage) ? schema.options.patternmessage : this.translate('error_pattern', [schema.pattern])
          }]
        }
        return []
      }
    }

    this._validateArraySubSchema = {
      items (schema, value, path) {
        const errors = []
        if (Array.isArray(schema.items)) {
          for (let i = 0; i < value.length; i++) {
            /* If this item has a specific schema tied to it */
            /* Validate against it */
            if (schema.items[i]) {
              errors.push(...this._validateSchema(schema.items[i], value[i], `${path}.${i}`))
              /* If all additional items are allowed */
            } else if (schema.additionalItems === true) {
              break
              /* If additional items is a schema */
              /* TODO: Incompatibility between version 3 and 4 of the spec */
            } else if (schema.additionalItems) {
              errors.push(...this._validateSchema(schema.additionalItems, value[i], `${path}.${i}`))
              /* If no additional items are allowed */
            } else if (schema.additionalItems === false) {
              errors.push({
                path,
                property: 'additionalItems',
                message: this.translate('error_additionalItems')
              })
              break
              /* Default for `additionalItems` is an empty schema */
            } else {
              break
            }
          }
          /* `items` is a schema */
        } else {
          /* Each item in the array must validate against the schema */
          value.forEach((e, i) => {
            errors.push(...this._validateSchema(schema.items, e, `${path}.${i}`))
          })
        }
        return errors
      },
      maxItems (schema, value, path) {
        if (value.length > schema.maxItems) {
          return [{
            path,
            property: 'maxItems',
            message: this.translate('error_maxItems', [schema.maxItems])
          }]
        }
        return []
      },
      minItems (schema, value, path) {
        if (value.length < schema.minItems) {
          return [{
            path,
            property: 'minItems',
            message: this.translate('error_minItems', [schema.minItems])
          }]
        }
        return []
      },
      uniqueItems (schema, value, path) {
        const seen = {}
        for (let i = 0; i < value.length; i++) {
          const valid = JSON.stringify(value[i])
          if (seen[valid]) {
            return [{
              path,
              property: 'uniqueItems',
              message: this.translate('error_uniqueItems')
            }]
          }
          seen[valid] = true
        }
        return []
      }
    }

    this._validateObjectSubSchema = {
      maxProperties (schema, value, path) {
        if (Object.keys(value).length > schema.maxProperties) {
          return [{
            path,
            property: 'maxProperties',
            message: this.translate('error_maxProperties', [schema.maxProperties])
          }]
        }
        return []
      },
      minProperties (schema, value, path) {
        if (Object.keys(value).length < schema.minProperties) {
          return [{
            path,
            property: 'minProperties',
            message: this.translate('error_minProperties', [schema.minProperties])
          }]
        }
        return []
      },
      required (schema, value, path) {
        const errors = []
        if (Array.isArray(schema.required)) {
          schema.required.forEach(e => {
            if (typeof value[e] !== 'undefined') return
            const editor = this.jsoneditor.getEditor(`${path}.${e}`)
            /* Ignore required error if editor is of type "button" or "info" */
            if (editor && ['button', 'info'].includes(editor.schema.format || editor.schema.type)) return
            errors.push({
              path,
              property: 'required',
              message: this.translate('error_required', [schema && schema.properties && schema.properties[e] && schema.properties[e].title ? schema.properties[e].title : e])
            })
          })
        }
        return errors
      },
      properties (schema, value, path, validatedProperties) {
        const errors = []
        Object.entries(schema.properties).forEach(([key, prop]) => {
          validatedProperties[key] = true
          errors.push(...this._validateSchema(prop, value[key], `${path}.${key}`))
        })
        return errors
      },
      patternProperties (schema, value, path, validatedProperties) {
        const errors = []
        Object.entries(schema.patternProperties).forEach(([i, prop]) => {
          const regex = new RegExp(i)
          /* Check which properties match */
          Object.entries(value).forEach(([j, v]) => {
            if (regex.test(j)) {
              validatedProperties[j] = true
              errors.push(...this._validateSchema(prop, v, `${path}.${j}`))
            }
          })
        })
        return errors
      }
    }

    this._validateObjectSubSchema2 = {
      propertyNames (schema, value, path, validatedProperties) {
        const errors = []
        const keys = Object.keys(value)
        let k = null
        for (let i = 0; i < keys.length; i++) {
          let msg = ''
          let truthy = false
          k = keys[i]
          /* Check property names that don't match */
          if (typeof schema.propertyNames === 'boolean') {
            if (schema.propertyNames === true) {
              continue
            }
            errors.push({
              path,
              property: 'propertyNames',
              message: this.translate('error_property_names_false', [k])
            })
            break
          }
          schema.propertyNames = extend({}, this.jsoneditor.expandRefs(schema.propertyNames))
          truthy = Object.entries(schema.propertyNames).every(([j, prop]) => {
            let match = false
            let regex = null
            switch (j) {
              case 'maxLength':
                if (typeof prop !== 'number') {
                  msg = 'error_property_names_maxlength'
                  break
                }
                if (k.length > prop) {
                  msg = 'error_property_names_exceeds_maxlength'
                  break
                }
                return true
              case 'const':
                if (prop !== k) {
                  msg = 'error_property_names_const_mismatch'
                  break
                }
                return true
              case 'enum':
                if (!Array.isArray(prop)) {
                  msg = 'error_property_names_enum'
                  break
                }
                prop.forEach(p => {
                  if (p === k) {
                    match = true
                  }
                })
                if (!match) {
                  msg = 'error_property_names_enum_mismatch'
                  break
                }
                return true
              case 'pattern':
                if (typeof prop !== 'string') {
                  msg = 'error_property_names_pattern'
                  break
                }
                regex = new RegExp(prop)
                if (!regex.test(k)) {
                  msg = 'error_property_names_pattern_mismatch'
                  break
                }
                return true
              default:
                errors.push({
                  path,
                  property: 'propertyNames',
                  message: this.translate('error_property_names_unsupported', [j])
                })
                return false
            }
            errors.push({
              path,
              property: 'propertyNames',
              message: this.translate(msg, [k])
            })
            return false
          })
          if (!truthy) break
        }
        return errors
      },
      additionalProperties (schema, value, path, validatedProperties) {
        const errors = []
        const keys = Object.keys(value)
        for (let i = 0; i < keys.length; i++) {
          const k = keys[i]
          if (validatedProperties[k]) continue
          /* No extra properties allowed */
          if (!schema.additionalProperties) {
            errors.push({
              path,
              property: 'additionalProperties',
              message: this.translate('error_additional_properties', [k])
            })
            break
            /* Allowed */
          } else if (schema.additionalProperties === true) {
            break
            /* Must match schema */
            /* TODO: incompatibility between version 3 and 4 of the spec */
          } else {
            errors.push(...this._validateSchema(schema.additionalProperties, value[k], `${path}.${k}`))
          }
        }
        return errors
      },
      dependencies (schema, value, path) {
        const errors = []
        Object.entries(schema.dependencies).forEach(([i, dep]) => {
          /* Doesn't need to meet the dependency */
          if (typeof value[i] === 'undefined') return

          /* Property dependency */
          if (Array.isArray(dep)) {
            dep.forEach(d => {
              if (typeof value[d] === 'undefined') {
                errors.push({
                  path,
                  property: 'dependencies',
                  message: this.translate('error_dependency', [d])
                })
              }
            })
            /* Schema dependency */
          } else {
            errors.push(...this._validateSchema(dep, value, path))
          }
        })
        return errors
      }
    }
  }

  fitTest (value, givenSchema, weight = 10000000) {
    const fit = { match: 0, extra: 0 }
    if (typeof value === 'object' && value !== null) {
      /* Work on a copy of the schema */
      const properties = this._getSchema(givenSchema).properties

      for (const i in properties) {
        if (!hasOwnProperty(properties, i)) {
          fit.extra += weight
          continue
        }
        if (typeof value[i] === 'object' && typeof properties[i] === 'object' && typeof properties[i].properties === 'object') {
          const result = this.fitTest(value[i], properties[i], weight / 100)
          fit.match += result.match
          fit.extra += result.extra
        }
        if (typeof value[i] !== 'undefined') {
          fit.match += weight
        }
      }
    }
    return fit
  }

  _getSchema (schema) {
    return typeof schema === 'undefined' ? extend({}, this.jsoneditor.expandRefs(this.schema)) : schema
  }

  validate (value) {
    return this._validateSchema(this.schema, value)
  }

  _validateSchema (schema, value, path) {
    const errors = []
    path = path || this.jsoneditor.root.formname

    /* Work on a copy of the schema */
    schema = extend({}, this.jsoneditor.expandRefs(schema))

    /*
     * Type Agnostic Validation
     */
    /* Version 3 `required` and `required_by_default` */
    if (typeof value === 'undefined') {
      return this._validateV3Required(schema, value, path)
    }

    Object.keys(schema).forEach(key => {
      if (this._validateSubSchema[key]) {
        errors.push(...this._validateSubSchema[key].call(this, schema, value, path))
      }
    })

    /*
     * Type Specific Validation
     */
    errors.push(...this._validateByValueType(schema, value, path))

    if (schema.links) {
      schema.links.forEach((s, m) => {
        if (s.rel && s.rel.toLowerCase() === 'describedby') {
          schema = this._expandSchemaLink(schema, m)
          errors.push(...this._validateSchema(schema, value, path, this.translate))
        }
      })
    }

    /* date, time and datetime-local validation */
    if (['date', 'time', 'datetime-local'].includes(schema.format)) {
      errors.push(...this._validateDateTimeSubSchema(schema, value, path))
    }

    /* uuid validation */
    if (['uuid'].includes(schema.format)) {
      errors.push(...this._validateUUIDSchema(schema, value, path))
    }

    /* custom validator */
    errors.push(...this._validateCustomValidator(schema, value, path))

    /* Remove duplicate errors and add "errorcount" property */
    return this._removeDuplicateErrors(errors)
  }

  _expandSchemaLink (schema, m) {
    const href = schema.links[m].href
    const data = this.jsoneditor.root.getValue()
    const template = this.jsoneditor.compileTemplate(href, this.jsoneditor.template)
    const ref = document.location.origin + document.location.pathname + template(data)

    schema.links = schema.links.slice(0, m).concat(schema.links.slice(m + 1))
    return extend({}, schema, this.jsoneditor.refs[ref])
  }

  _validateV3Required (schema, value, path) {
    if (((typeof schema.required !== 'undefined' && schema.required === true) || (typeof schema.required === 'undefined' && this.jsoneditor.options.required_by_default === true)) && (schema.type !== 'info')) {
      return [{
        path,
        property: 'required',
        message: this.translate('error_notset')
      }]
    }
    return []
  }

  _validateByValueType (schema, value, path) {
    const errors = []
    if (value === null) return errors
    /* Number Specific Validation */
    if (typeof value === 'number') {
      /* `multipleOf` and `divisibleBy` */
      /* `maximum` */
      /* `minimum` */
      Object.keys(schema).forEach(key => {
        if (this._validateNumberSubSchema[key]) {
          errors.push(...this._validateNumberSubSchema[key].call(this, schema, value, path))
        }
      })
      /* String specific validation */
    } else if (typeof value === 'string') {
      /* `maxLength` */
      /* `minLength` */
      /* `pattern` */
      Object.keys(schema).forEach(key => {
        if (this._validateStringSubSchema[key]) {
          errors.push(...this._validateStringSubSchema[key].call(this, schema, value, path))
        }
      })
      /* Array specific validation */
    } else if (Array.isArray(value)) {
      /* `items` and `additionalItems`
      /* `maxItems`
      /* `minItems`
      /* `uniqueItems` */
      Object.keys(schema).forEach(key => {
        if (this._validateArraySubSchema[key]) {
          errors.push(...this._validateArraySubSchema[key].call(this, schema, value, path))
        }
      })
      /* Object specific validation */
    } else if (typeof value === 'object') {
      const validatedProperties = {}
      /* `maxProperties`
      /* `minProperties`
      /*  Version 4 `required`
      /* `properties`
      /* `patternProperties` */
      Object.keys(schema).forEach(key => {
        if (this._validateObjectSubSchema[key]) {
          errors.push(...this._validateObjectSubSchema[key].call(this, schema, value, path, validatedProperties))
        }
      })

      /* The no_additional_properties option currently doesn't work with extended schemas that use oneOf or anyOf or allOf */
      if (typeof schema.additionalProperties === 'undefined' && this.jsoneditor.options.no_additional_properties && !schema.oneOf && !schema.anyOf && !schema.allOf) {
        schema.additionalProperties = false
      }

      /* `propertyNames` */
      /* `additionalProperties` */
      /* `dependencies` */
      Object.keys(schema).forEach(key => {
        if (typeof this._validateObjectSubSchema2[key] !== 'undefined') {
          errors.push(...this._validateObjectSubSchema2[key].call(this, schema, value, path, validatedProperties))
        }
      })
    }
    return errors
  }

  _validateUUIDSchema (schema, value, path) {
    if (!(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value))) {
      return [{
        path,
        property: 'format',
        message: this.translate('error_pattern', ['^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$'])
      }]
    }
    return []
  }

  _validateNumberSubSchemaMultipleDivisible (schema, value, path) {
    const divisor = schema.multipleOf || schema.divisibleBy
    /* Vanilla JS, prone to floating point rounding errors (e.g. 1.14 / .01 == 113.99999) */
    let valid = (value / divisor === Math.floor(value / divisor))

    /* Use math.js is available */
    if (window.math) {
      valid = window.math.mod(window.math.bignumber(value), window.math.bignumber(divisor)).equals(0)
    } else if (window.Decimal) {
      /* Use decimal.js is available */
      valid = (new window.Decimal(value)).mod(new window.Decimal(divisor)).equals(0)
    }

    if (!valid) {
      return [{
        path,
        property: schema.multipleOf ? 'multipleOf' : 'divisibleBy',
        message: this.translate('error_multipleOf', [divisor])
      }]
    }
    return []
  }

  _validateDateTimeSubSchema (schema, value, path) {
    const _validateInteger = (schema, value, path) => {
      /* The value is a timestamp */
      if (value * 1 < 1) {
        /* If value is less than 1, then it's an invalid epoch date before 00:00:00 UTC Thursday, 1 January 1970 */
        return [{
          path,
          property: 'format',
          message: this.translate('error_invalid_epoch')
        }]
      } else if (value !== Math.abs(parseInt(value))) {
        /* not much to check for, so we assume value is ok if it's a positive number */
        return [{
          path,
          property: 'format',
          message: this.translate(`error_${schema.format.replace(/-/g, '_')}`, [dateFormat])
        }]
      }
      return []
    }
    const _validateFlatPicker = (schema, value, path, editor) => {
      if (value !== '') {
        let compareValue
        if (editor.flatpickr.config.mode !== 'single') {
          const seperator = editor.flatpickr.config.mode === 'range' ? editor.flatpickr.l10n.rangeSeparator : ', '
          const selectedDates = editor.flatpickr.selectedDates.map(val =>
            editor.flatpickr.formatDate(val, editor.flatpickr.config.dateFormat)
          )
          compareValue = selectedDates.join(seperator)
        }

        try {
          if (compareValue) {
            /* Not the best validation method, but range and multiple mode are special */
            /* Optimal solution would be if it is possible to change the return format from string/integer to array */
            if (compareValue !== value) throw new Error(`${editor.flatpickr.config.mode} mismatch`)
          } else if (editor.flatpickr.formatDate(editor.flatpickr.parseDate(value, editor.flatpickr.config.dateFormat), editor.flatpickr.config.dateFormat) !== value) {
            throw new Error('mismatch')
          }
        } catch (err) {
          const errorDateFormat = editor.flatpickr.config.errorDateFormat !== undefined ? editor.flatpickr.config.errorDateFormat : editor.flatpickr.config.dateFormat
          return [{
            path,
            property: 'format',
            message: this.translate(`error_${editor.format.replace(/-/g, '_')}`, [errorDateFormat])
          }]
        }
      }
      return []
    }

    const validatorRx = {
      date: /^(\d{4}\D\d{2}\D\d{2})?$/,
      time: /^(\d{2}:\d{2}(?::\d{2})?)?$/,
      'datetime-local': /^(\d{4}\D\d{2}\D\d{2}[ T]\d{2}:\d{2}(?::\d{2})?)?$/
    }
    const format = {
      date: '"YYYY-MM-DD"',
      time: '"HH:MM"',
      'datetime-local': '"YYYY-MM-DD HH:MM"'
    }

    const editor = this.jsoneditor.getEditor(path)
    const dateFormat = (editor && editor.flatpickr) ? editor.flatpickr.config.dateFormat : format[schema.format]

    if (schema.type === 'integer') {
      return _validateInteger(schema, value, path)
    } else if (!editor || !editor.flatpickr) {
      /* Standard string input, without flatpickr */
      if (!validatorRx[schema.format].test(value)) {
        return [{
          path,
          property: 'format',
          message: this.translate(`error_${schema.format.replace(/-/g, '_')}`, [dateFormat])
        }]
      }
    } else if (editor) {
      /* Flatpickr validation */
      return _validateFlatPicker(schema, value, path, editor)
    }
    return []
  }

  _validateCustomValidator (schema, value, path) {
    const errors = []
    /* Internal validators using the custom validator format */
    errors.push(...ipValidator.call(this, schema, value, path, this.translate))

    const validate = validator => {
      errors.push(...validator.call(this, schema, value, path))
    }
    /* Custom type validation (global) */
    this.defaults.custom_validators.forEach(validate)
    /* Custom type validation (instance specific) */
    if (this.options.custom_validators) {
      this.options.custom_validators.forEach(validate)
    }
    return errors
  }

  _removeDuplicateErrors (errors) {
    return errors.reduce((err, obj) => {
      let first = true
      if (!err) err = []
      err.forEach(a => {
        if (a.message === obj.message && a.path === obj.path && a.property === obj.property) {
          a.errorcount++
          first = false
        }
      })
      if (first) {
        obj.errorcount = 1
        err.push(obj)
      }
      return err
    }, [])
  }

  _checkType (type, value) {
    const types = {
      string: value => typeof value === 'string',
      number: value => typeof value === 'number',
      integer: value => typeof value === 'number' && value === Math.floor(value),
      boolean: value => typeof value === 'boolean',
      array: value => Array.isArray(value),
      object: value => value !== null && !(Array.isArray(value)) && typeof value === 'object',
      null: value => value === null
    }
    /* Simple types */
    if (typeof type === 'string') {
      if (types[type]) {
        return types[type](value)
      } else return true
      /* Schema */
    } else {
      return !this._validateSchema(type, value).length
    }
  }
}
