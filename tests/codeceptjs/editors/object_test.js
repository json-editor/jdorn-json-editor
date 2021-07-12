/* global Feature Scenario */

const assert = require('assert')

Feature('object')

Scenario('should respect property orders', async (I) => {
  I.amOnPage('object.html')
  assert.equal(await I.grabAttributeFrom('[data-schemapath^="root"] .row:nth-of-type(1) [data-schemapath^="root."]', 'data-schemapath'), 'root.age')
  assert.equal(await I.grabAttributeFrom('[data-schemapath^="root"] .row:nth-of-type(2) [data-schemapath^="root."]', 'data-schemapath'), 'root.name')
  assert.equal(await I.grabAttributeFrom('[data-schemapath^="root"] .row:nth-of-type(3) [data-schemapath^="root."]', 'data-schemapath'), 'root.single')
  assert.equal(await I.grabAttributeFrom('[data-schemapath^="root"] .row:nth-of-type(4) [data-schemapath^="root."]', 'data-schemapath'), 'root.values')
  assert.equal(await I.grabAttributeFrom('[data-schemapath^="root"] .row:nth-of-type(5) [data-schemapath^="root."]', 'data-schemapath'), 'root.zodiac')
})

Scenario('should validate required properties', async (I) => {
  I.amOnPage('object.html')
  I.see('Value must be at least 18.')
})

Scenario('should validate also not required properties', async (I) => {
  I.amOnPage('object.html')
  I.see('Value must be at least 3 characters long.')
})

Scenario('grid-strict rows and columns', (I) => {
  I.amOnPage('grid-strict.html')
  I.seeNumberOfVisibleElements('.row', 13)
  I.seeElement('.col-md-1')
  I.seeElement('.col-md-2')
  I.seeElement('.col-md-3')
  I.seeElement('.col-md-4')
  I.seeElement('.col-md-5')
  I.seeElement('.col-md-6')
  I.seeElement('.col-md-7')
  I.seeElement('.col-md-8')
  I.seeElement('.col-md-9')
  I.seeElement('.col-md-10')
  I.seeElement('.col-md-11')
  I.seeElement('.col-md-12')
  I.seeElement('.col-md-1.offset-md-1')
  I.seeElement('.col-md-1.offset-md-2')
  I.seeElement('.col-md-1.offset-md-3')
  I.seeElement('.col-md-1.offset-md-4')
  I.seeElement('.col-md-1.offset-md-5')
  I.seeElement('.col-md-1.offset-md-6')
  I.seeElement('.col-md-1.offset-md-7')
  I.seeElement('.col-md-1.offset-md-8')
  I.seeElement('.col-md-1.offset-md-9')
  I.seeElement('.col-md-1.offset-md-10')
  I.seeElement('.col-md-1.offset-md-11')
})

Scenario('grid rows and columns', (I) => {
  I.amOnPage('grid.html')
  I.seeNumberOfVisibleElements('.row', 6)
  I.seeNumberOfVisibleElements('.col-md-12', 1)
  I.seeNumberOfVisibleElements('.col-md-6', 3)
  I.seeNumberOfVisibleElements('.col-md-4', 3)
  I.seeNumberOfVisibleElements('.col-md-3', 4)
  I.seeNumberOfVisibleElements('.col-md-2', 6)
  I.seeNumberOfVisibleElements('.col-md-1', 6)
})

Scenario('opt in optional properties @show_opt_in', async (I) => {
  I.amOnPage('object-required-properties.html')

  // if an editor type "object" is disabled, also the child editors opt-in controls will be disabled.
  I.seeDisabledAttribute('[data-schemapath="root.object.number"] .json-editor-opt-in')
  I.seeDisabledAttribute('[data-schemapath="root.object.boolean"] .json-editor-opt-in')
  I.seeDisabledAttribute('[data-schemapath="root.object.radio"] .json-editor-opt-in')

  // tests merged from master 17.9.2019
  I.dontSeeCheckedAttribute('[data-schemapath="root.string"] .json-editor-opt-in')
  I.dontSeeDisabledAttribute('[data-schemapath="root.string"] .json-editor-opt-in')
  I.seeDisabledAttribute('[name="root[string]"]')
  I.dontSeeCheckedAttribute('[data-schemapath="root.radio"] .json-editor-opt-in')
  I.dontSeeDisabledAttribute('[data-schemapath="root.radio"] .json-editor-opt-in')
  I.seeDisabledAttribute('[id="root[radio][0]"]')
  I.seeDisabledAttribute('[id="root[radio][1]"]')
  I.dontSeeCheckedAttribute('[data-schemapath="root.object.number"] .json-editor-opt-in')
  I.seeDisabledAttribute('[data-schemapath="root.object.number"] .json-editor-opt-in')
  I.seeDisabledAttribute('[name="root[object][number]"]')
  I.dontSeeCheckedAttribute('[data-schemapath="root.object.boolean"] .json-editor-opt-in')
  I.seeDisabledAttribute('[data-schemapath="root.object.boolean"] .json-editor-opt-in')
  I.dontSeeCheckedAttribute('[data-schemapath="root.object.radio"] .json-editor-opt-in')
  I.seeDisabledAttribute('[data-schemapath="root.object.radio"] .json-editor-opt-in')

  I.click('.get-value')
  assert.equal(await I.grabValueFrom('.value'), '{"number":0,"boolean":false}')

  // Opening and Closing "Edit JSON" should keep opt-in state.

  I.click('[data-schemapath="root"] .json-editor-btn-edit')
  I.click('[data-schemapath="root"] .json-editor-btn-edit')
  I.dontSeeCheckedAttribute('[data-schemapath="root.string"] .json-editor-opt-in')
  I.dontSeeDisabledAttribute('[data-schemapath="root.string"] .json-editor-opt-in')
  I.seeDisabledAttribute('[name="root[string]"]')
  I.dontSeeCheckedAttribute('[data-schemapath="root.radio"] .json-editor-opt-in')
  I.dontSeeDisabledAttribute('[data-schemapath="root.radio"] .json-editor-opt-in')
  I.seeDisabledAttribute('[id="root[radio][0]"]')
  I.seeDisabledAttribute('[id="root[radio][1]"]')
  I.dontSeeCheckedAttribute('[data-schemapath="root.object.number"] .json-editor-opt-in')
  I.seeDisabledAttribute('[data-schemapath="root.object.number"] .json-editor-opt-in')
  I.seeDisabledAttribute('[name="root[object][number]"]')
  I.dontSeeCheckedAttribute('[data-schemapath="root.object.boolean"] .json-editor-opt-in')
  I.seeDisabledAttribute('[data-schemapath="root.object.boolean"] .json-editor-opt-in')
  I.seeDisabledAttribute('[name="root[object][boolean]"]')
  I.seeDisabledAttribute('[data-schemapath="root.object.boolean"] .json-editor-opt-in')
  I.dontSeeCheckedAttribute('[data-schemapath="root.object.radio"] .json-editor-opt-in')
  I.seeDisabledAttribute('[data-schemapath="root.object.radio"] .json-editor-opt-in')

  I.click('.get-value')
  assert.equal(await I.grabValueFrom('.value'), '{"number":0,"boolean":false}')

  // opt-in string property

  I.click('[data-schemapath="root.string"] .json-editor-opt-in')
  I.click('[data-schemapath="root.radio"] .json-editor-opt-in')
  I.click('.get-value')
  assert.equal(await I.grabValueFrom('.value'), '{"string":"","number":0,"boolean":false,"radio":"Home"}')

  // opt-in array property

  I.click('[data-schemapath="root.array"] .json-editor-opt-in')
  I.click('.get-value')
  assert.equal(await I.grabValueFrom('.value'), '{"string":"","number":0,"boolean":false,"radio":"Home","array":[]}')

  // opt-in object property

  I.click('[data-schemapath="root.object"] .json-editor-opt-in')
  I.click('.get-value')
  assert.equal(await I.grabValueFrom('.value'), '{"string":"","number":0,"boolean":false,"radio":"Home","array":[],"object":{"string":"","array":[]}}')

  // if an editor type "object" is enabled, also the child editors opt-in controls will be enabled.
  I.dontSeeDisabledAttribute('[data-schemapath="root.object.number"] .json-editor-opt-in')
  I.dontSeeDisabledAttribute('[data-schemapath="root.object.boolean"] .json-editor-opt-in')
  I.dontSeeDisabledAttribute('[data-schemapath="root.object.radio"] .json-editor-opt-in')
})

Scenario('set value opt in optional properties @show_opt_in', async (I) => {
  I.amOnPage('object-required-properties.html')

  // all editors visible
  I.waitForElement('[data-schemapath="root.string"]', 5)
  I.waitForElement('[data-schemapath="root.number"]', 5)
  I.waitForElement('[data-schemapath="root.boolean"]', 5)
  I.waitForElement('[data-schemapath="root.radio"]', 5)
  I.waitForElement('[data-schemapath="root.array"]', 5)
  I.waitForElement('[data-schemapath="root.object"]', 5)
  I.waitForElement('[data-schemapath="root.object.string"]', 5)
  I.waitForElement('[data-schemapath="root.object.number"]', 5)
  I.waitForElement('[data-schemapath="root.object.boolean"]', 5)
  I.waitForElement('[data-schemapath="root.object.radio"]', 5)

  // set values
  I.click('.set-value')
  I.click('.get-value')
  assert.equal(await I.grabValueFrom('.value'), '{"string":"test","number":0,"boolean":false,"array":["test"],"object":{"string":"","number":10,"boolean":true,"array":[]}}')

  // set empty values
  I.click('.set-empty-value')
  I.click('.get-value')
  assert.equal(await I.grabValueFrom('.value'), '{"number":0,"boolean":false}')

  // all editorsstill visible
  I.waitForElement('[data-schemapath="root.string"]', 5)
  I.waitForElement('[data-schemapath="root.number"]', 5)
  I.waitForElement('[data-schemapath="root.boolean"]', 5)
  I.waitForElement('[data-schemapath="root.radio"]', 5)
  I.waitForElement('[data-schemapath="root.array"]', 5)
  I.waitForElement('[data-schemapath="root.object"]', 5)
  I.waitForElement('[data-schemapath="root.object.string"]', 5)
  I.waitForElement('[data-schemapath="root.object.number"]', 5)
  I.waitForElement('[data-schemapath="root.object.boolean"]', 5)
  I.waitForElement('[data-schemapath="root.object.radio"]', 5)
})

Scenario('objects should contain properties defined with the properties keyword unless the property "additionalProperties: true" is specified in the object schema @additional-properties', async (I) => {
  I.amOnPage('object-no-additional-properties.html')
  I.seeElement('[data-schemapath="root.aptrue.name"] input')
  I.seeElement('[data-schemapath="root.aptrue.age"] input')
  I.seeElement('[data-schemapath="root.apfalse.name"] input')
  I.dontSeeElement('[data-schemapath="root.apfalse.age"] input')
  I.click('.get-value')
  assert.equal(await I.grabValueFrom('.value'), '{"aptrue":{"name":"Albert","age":0},"apfalse":{"name":"Albert"}}')
})

Scenario('should have unique ids', (I) => {
  I.amOnPage('object-no-duplicated-id.html')
  I.donSeeDuplicatedIds()
  I.waitForText('i am actually a cat')
  I.waitForText('i am actually a dog')
  I.click('.json-editor-btn-edit_properties')
  I.click('.form-group:nth-child(1) .form-check-input')
  I.waitForText('i am actually a dog')
  I.click('.form-group:nth-child(1) .form-check-input')
  I.click('.form-group:nth-child(2) .form-check-input')
  I.waitForText('i am actually a cat')
})

Scenario('should hide properties with unfulfilled dependencies', (I) => {
  I.amOnPage('object-with-dependencies.html')
  I.seeElement('[data-schemapath="root.enable_option"] input')
  I.dontSeeElement('[data-schemapath="root.make_new"] input')
  I.dontSeeElement('[data-schemapath="root.existing_name"] input')

  I.click('[data-schemapath="root.enable_option"] input')
  I.seeElement('[data-schemapath="root.enable_option"] input')
  I.seeElement('[data-schemapath="root.make_new"] input')
  I.dontSeeElement('[data-schemapath="root.existing_name"] input')
})

Scenario('should respect multiple dependency values', (I) => {
  I.amOnPage('object-with-dependencies-array.html')
  I.waitForVisible('[data-schemapath="root.answerB"] input', 5)
  I.selectOption('[name="root[answerA]"]', 'C')
  I.waitForInvisible('[data-schemapath="root.answerB"] input', 5)
  I.selectOption('[name="root[answerA]"]', 'B')
  I.waitForVisible('[data-schemapath="root.answerB"] input', 5)
  I.selectOption('[name="root[answerA]"]', 'A')
  I.waitForVisible('[data-schemapath="root.answerB"] input', 5)
})

Scenario('should show editors for empty optional fields if show_non_required_editors options is true', (I) => {
  I.amOnPage('object-show-non-required-editors--true.html')
  I.seeElement('[name="root[0][dayCode]"]')
  I.seeElement('[name="root[0][startTime]"]')
})

Scenario('should NOT show editors for empty optional fields if show_non_required_editors options is false', (I) => {
  I.amOnPage('object-show-non-required-editors--false.html')
  I.seeElement('[name="root[0][dayCode]"]')
  I.dontSeeElement('[name="root[0][startTime]"]')
})
