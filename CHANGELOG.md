### Unreleased

- pass additional pathDepth parameter to getHeader() to allow themes to render headings hierarchically
- add Open Iconic iconlib
- switched CI to Github Actions
- read-only base64 editors respect enum values when calling setValue()

### 2.5.4

- fixes #997 add accessibility support for string input types
- fix bug in validator.fitTest where anyOf schemata were not handled correctly

### 2.5.3

- fix oneOf and anyOf error messages
- fix 159 set value
- Added more read-only tests for #831
- Update PULL_REQUEST_TEMPLATE.md
- fixes #922 - translate all buttons; translator no longer throws error
- fixes #159, #285, #820 - setting array with 0, false, or ""
- fixes #379 and #923 - strip #fragment from URI so json pointers resolve correctly
- add Open Iconic iconlib
- fix for #811 Property names

### 2.5.2

- Fixed stepper editor safari bug
- Added release notes
- Fixed form_name_root option behaviour

### 2.5.1

- Fix for #837 and chekboxes not displaying error messages #843

### 2.5.0

- added new stepper editor (with default HTML & Bootstrap 4 Theme)
- fixed babel transpiling bug
- updated docs

### 2.4.0

- added option `max_depth` used to specify the maximum depth of level's schema that have to be rendered
- added option `use_default_values` used to specify if default values based on the "type" of the property have to be used
- when `use_default_values` is false, number and integer fields have undefined value when input is empty
- when `use_default_values` is false, string fields have undefined value at the beginning. After that user edit the field, empty input is threated as an empty string
- Fixed using multiple dependencies for an editor. Fix #703
- Evaluate all dependencies for an editor to determine visibility
- Fixed meta-schema usage
- Added `min`, `max` for `dateTime`

### 2.3.0

- Removed codeception container, use `codeceptjs` as node-dev module
- Enabled Bootstrap 3 theme/icons

### 2.2.1-current

- AbstractEditor, AbstractTheme, AbstractIconlib had been removed, re-expose them
- fix static property #724 #723
- fix option remove_empty_properties #725 #728

### 2.2.0

- Removed Class.js in favour Javascript class declaration.
- Ability to add style rules for editors (i.e. StarratingEditor)
- Modified build/CSSToJson.js to generate Javascript modules instead of Json files. This is helpful when importing JSONEditor directly as Javascript module without a build step.
- Unified how styles are loaded for themes and editors,
	- Style rules are stored in class static property ‘rules’
	- Rules are loaded as ESM Module,
    - Generated @ build stage (stylesheet-filename.css.js) or
    - Written manually.
- Cleaned src/defaults.js and move resolvers to a separate module, src/resolvers.js
- Cleaned how default themes, iconlibs, editors and templates are imported to JSONEditor
- Added ability to attache editors and themes style rules to the shadowRoot if the editor is inside a Web Component.
- Fix of #701 - editors/number.js and editors/integer.js don't change values when validation is failed
- Fix of #716 - add ignore for allOf to fall in line with existing ignores of anyOf/oneOf for additionalProperties validation
- Fix of #714 - Checkboxes inside object tables duplicate labels from heading
- Added copy button to arrays in table format 

### 2.1.0
 - fixed vulnerability in "http-server" package (origin/feature/merges-20200227, feature/merges-20200227) - using latest node LTS
 - extract css
 - Add webpack plugin to support theme development
 - css-loader can be omitted
 - Fix some eslint warnings
 - Remove comments from css in production mode (germanbisurgi-master) - updated readme
 - lib loader
 - better interactive page
 - codeceptjs output directory added to npm ignore list

### 2.0.0
  - Fix of #643 - Allow use of themes not compiled directly into the build
  - Removed Themes and IconSets that have not been updated to 2.0 format.
  - Fix of #618 - links are placed AFTER the description. Now places the link BEFORE description (if available) or at bottom of container
  - Changes to Vallilla Colorpicker editor.
  - Added support for 'setValue'
  - Added better enable/disable methods.
  - Removed "onChange" function from list of required options so it can be overidden using schema options.
  - Changed the update method (Otherwise buttons have no meaning). Now updating is done in "onDone" function, except if inline element. Then updating is done using "onChange" function.
  - Fix of #629 - BS4 theme bug where basic tab was placed outside tabs container.
  - Improved IMask support for `Date`, `Number`, `IMask.MaskedEnum`, `IMask.MaskedRange` and regular expression masks. #591
  - Added support for recursive callback options.
  - Fix of #692 - Resolves an issue where modal click detection was not working when the editor is attached inside a shadow DOM by changing the event target to use the path.

### 2.0.0-alpha-1

  - Added remove_button_labels option.
  - Added Spectre Theme styling for `anyOf`, `oneOf` and `allOf` selectbox.
  - Added filter to remove duplicate error messages. Duplicate error messages are now displayed as single error message with error count. (Duplicate error messages can occur when using `not`, `anyOf`, `oneOf` and `allOf` due to these are **conditions**, not properties.)
  - Added new 2.x Theme "Spectre".
  - Updated Theme "Tailwind" to 2.x format.
  - Added sort option for dynamic enumSource.
  - Added JavaScript callback templating support for enumSource: filter, title and value properties.
  - Fix of #470 - Constant enumSource value specified as array of strings causes a template compilation error.
  - Fix of #467 - child watches parent = infinite recursion.
  - Select and Multiselect now uses requestAnimationFrame when applying special editor code to select field in order to prevent delays.
  - Added missing validation messages and support for options infoText an compact in Multiselect editor.
  - Refactored src/editors/multiselect.js and moved hardcoded support for Select2 into seperate editor files which then extends src/editors/multiselect.js
  - Refactored src/editors/select.js and moved hardcoded support for special editors (Select2 and Selecttize) into seperate editor files which then extends src/editors/select.js
  - Added new WYSIWYG editor [Jodit](https://xdsoft.net/jodit/) as a replacement for SCEditor.
  - Jodit, Ace Editor, SimpleMDE and SCEditor can now be configured using global config options which can be overridden for single properties using schema options.
  - Refactored src/editors/string.js and moved hardcoded support for special editors (Ace Editor, SimpleMDE and SCEditor) into seperate editor files which then extends src/editors/string.js.
  - Fixed #408 - Now upload editor should be working again.
  - Added Array events for table format, tests
  - Fixed #408 - Now upload editor should be working again.
  - Added [Choices.js](https://github.com/jshjohnson/Choices) support for array and select editors.
  - Added 2 new config options: "disable_select2" and "disable_selectize" which can be used to disable select2/selectize on a specific property/field.
  - Removed "rating" editor and updated "starrating" editor to accept/emulate "rating" editor options.
  - Fixed #392 - Now setting checkbox value programmatically will trigger onchange correctly. (src/editors/checkbox.js)
  - Fixed #231 - Now it is possible to use dots in field names (src/editor.js)
  - Added new editor for uuid. If no uuid is supplied (startval), a random generated V4 uuid is created.
  - Added support for compact option in src/objects.js to hide title.
  - Added missing buttons to enable/disable state (src/array.js)
  - Fixed problems with dependencies option not working with Boolean format (src/editor.js).
  - Fixed problem with JSON and collapse buttons setting display: none; on button and not container. (src/object.js) So now compact in combination with hiding the buttons, will remove the "empty gap" in the layout.


### 1.4.0-beta.0

 - Updated docs
 - cleanText function for theme descriptions
 - Make sure array buttons are displayed without HTML
 - Allow HTML in header if DOMPurify is loaded
 - added link about ajaxCredentials
 - Added missing options ajaxBase and ajaxCredentials
 - #222 added enum support for selectize arrays, tests
 - fix apply global selectize options to arraySelectize
 - Added link to playground page
 - Fix of #365
 - Fix of #361
 - link to radio button example
 - Fix of #326
 - add posibility to use radios instead of dropdown for enums + example
 - Fixes for foundation 3 and 4 grids offsets
 - changed “opt_in_optional_properties” to “show_opt_in”. When a property is added the property will be initially active and can be deactivated afterwards
 - added documentation for show_opt_in
 - added grid-strict documentation
 - use label instead of span for labels
 - Rows wraps columns if necessary; Added test for row_break, grid_columns (1-12) grid_offset (1-11); Added support for bootstrap 3, 4 and foundation.
 - format grid-strict for objects (grid_columns, grid_offset, grid_break)
 - DescribedBy Editor
 - changed example from string to enum
 - Added missing dependencies info
 - Fix of #312 and #323
 - Fix of #324
 - Support underscore 1.7 and newer
 - added missing Object Properties Translation
 - DOMPurify support for description text #329
 - updated packages (#339)

---

> TODO: The changelog below is autogenerated and needs manual cleanup

### (tag: 1.3.5)
 - 1.3.5
 - array editor editing events triggers (#317)
 - Update issue_template (#316)
 - json editor move event where child editors can subscribe (#315)
 - Added link to ACE example and changed example options
 - ACE Editor Example
 - fixes ACE editor problems
 - Fix of #309
 - Make style uniform
 - Move additionalProperties: false from schemaBase to each branch of schema.oneOf
 - Use tabs format when items' value is an array of schemas, this improves readability
 - Use the table format for arrays to make the editor layout more dense
 - Remove duplicate keys in boolean and string schema properties
 - Allow array of schemas in items keyword for arrays
 - Fix default value in object and don't add default properties in options property
 - Make Object the default JSON Schema selected, since it's the most used when getting started
 - Remove the No Type schema to avoid ambiguities
 - Make default require the correct value for any type
 - Add properties section to null type definition
 - Fix schemaBase definition
 - Move schemaBase after all base data type definitions
 - Added default upload handler (#301)

### (tag: 1.3.4)
 - 1.3.4
 - on move event for editors that are moved within an array (and test) (#303)
 - Add sqlserver editor format.
 - Update README: introduce options.ace variable.
 - Accept schema.options.ace for Ace Editor.
 - Added CopyToClipboard in JSON Modal
 - Added Cleave global instance + destroy
 - Fix of #290
 (origin/schmunk42-patch-1) - added link to issue template
 - nonlocal #/definition/<something> refs support

### (tag: 1.3.3)
 - 1.3.3
 - Fix of #162 (#282)
 - Revert "Fix of #277"
 - Revert "Fix of #277"
 - Revert "Delete bootstrap4.js"
 - Delete bootstrap4.js
 - Fix of #277
 - Fix of #277
 - Fix of #276
 - Update bootstrap4.js
 - Fix bootstrap4 theme so errors are colored
 - Close properties modal if clicked outside modal
 - Fix of #262
 - Added info on how to style buttons
 - Fix of #270
 - Revert fix of #270
 - added typecasting on return value
 - button title wrapped in span #148 - added classnames
 - button title wrapped in span #148
 - Revert "Set theme jekyll-theme-hacker"
 - Revert "Set theme jekyll-theme-hacker"
 - removed placeholder option in favour of inputAttributes
 - fix of #270
 - corrected uglify preserveComments
 - Set theme jekyll-theme-hacker
 - Set theme jekyll-theme-hacker
 - Material Icons | Adding missed uploads icon
 - Update CONTRIBUTING.md
 - Rename function variable "protected"
 - Added cleave lib to demo
 - Updated CDN links

### (tag: 1.3.2)
 - 1.3.2
 - fixed string-replace task

### (tag: 1.3.1)
 - 1.3.1
 - fixed version bump

### (tag: 1.3.0)
 - 1.3.0
 - fixed javascript path
 - Moved function to editor.js + support for number and select
 - Added support for cleave.js
 - Added support for cleave.js
 - Support fontawesome 5
 - Merge remote-tracking branch 'json-editor/master'
 - Revert commits to solve categories problems, simple fix to materialize.
 - Improve performance of theme.setButtonText
 - modified travis test
 - Update string.js
 - Update README.md
 - upd
 - Added documentation of inputAttributes option
 - Modified inputAttributes format
 - Actually run the version string replacement
 - minor fixes to demo.html
 - Updated interactive demo and replaced EpicEditor info with simpleMDE info i docs
 - Remove deprecation notice from intro
 - datetime update
 - Fix of js link in signature editor example
 - Updated links in README.MD
 - Updated links in README.MD
 - Added enable_array_copy to README.md
 - Fixed setValue in datetime
 - Fix of #169
 - Fixed small bug in Foundation theme
 - Fix of Tabs not working in Bootstrap4
 - Added editor function to create valid ID values and fixed array.js + object.js
 - Fix adding classes to DOMTokenList (#213)
 - Refactoring className into classList (#210)
 - Fixed bug: when no options are present the base64 editor will not load (#202)
 - Fix of #140 - pattern of greater than 35 chars doesn't display properly

### (tag: 1.2.1)
 - 1.2.1
 - added "Contributing Use-cases" (#199)
 - Input custom attributes (#200)
 - added wiki link (#198)
 - Release 1.2.0 (#197)

### (tag: 1.2.0)
 - 1.2.0
 - fixed vulnerability warnings
 - updated build task (added "src/editors/signature.js" & code formatting) (#196)
 - Added signature (canvas draw) editor using SignaturePad (#193)
 - Improved base64.js editor to be able to upload multiple files to multiple array items (#183)
 - Pmk65 matfix (#191)
 - Added validation support for select (#190)
 - fix of #131 (#189)
 - fix of issues #30 and #185 (#186)
 - Updated README.md & examples + starrating bugfix (#181)
 - Pmk65 datetime (#176)
 - Release (#174)

### (tag: 1.1.0)
 - 1.1.0
 - updated lock file
 - Pmk65 starrating (#173)
 - Better comply with Bootstrap 4 grid columns spec (#164)
 - Export as a UMD module (#161)
 - Release 1.1.0-beta.4 (#153)

### (tag: 1.1.0-beta.4)
 - 1.1.0-beta.4
 - Fixed array active tabs. Fixed reload image path bug (#152)
 - Release 1.1.0-beta.3 (#151)

### (tag: 1.1.0-beta.3)
 - 1.1.0-beta.3
 - fix refresh preview in array of update editors (#150)
 - Array tests (#147)
 - Read only fields and fix for issue #143 (#145)
 - Fix categories format on bootstrap 3 (#101) (#103)
 - relative filepaths + extended testsuite (#141)
 - refactored tests. Added object tests. Added core tests. (#125)
 - Added output element to display range values. Added tests for integers and numbers with default, number and range formats (#124)
 - Confirm delete for table editors. Updated confirm messages. Renamed t… (#122)
 - fix boolean bug + tests (#118)
 - Release (#115)

### (tag: 1.1.0-beta.2)
 - 1.1.0-beta.2
 - updated "docker-test" script
 - prompt before delete + tests + read (#109)
 - updated docs pages json-editor cdn from unplug to jsdelivr (#114)
 - removed mocha testing packages, added standard js (#100)
 - marked sceeditor array test as optional (#106)
 - Hardened string-sceditor test (#104)
 - step support  for numbers, integers and numeric ranges (#99)
 - Ace editor tests  (#98)
 - 1.1.0-beta.1 (#97)

### (tag: 1.1.0-beta.1)
 - 1.1.0-beta.1
 - Update README.md (#95)
 - Feature/bump version (#94)
 - wysiwyg-sceditor tests (#93)
 - Cleanup (#90)
 (origin/marc7000-patch-1) - Update README.md

### (tag: 1.1.0-beta.0)
 - 1.1.0-beta.0
 - Fix missing comma in resources list
 (origin/feature/docker-test) - fixed npm script "docker-test"
 - add prepare script; useful for e.g. git linking, see: https://docs.npmjs.com/misc/scripts#description (#75)
 - Call event handlers with context
 - Create issue_template
 - Murb heatdutton changes cleaned (#85)
 - added "password" into the format list in README
 - Update README.md (#60)
 - checkboxes display validation errors
 - enum vs default bug fix

### (tag: 1.0.0)
 - 1.0.0
 - added version & dockerized test scripts, cleanup
 - added ".npmrc"
 - added caching option for volume mounts
 (feature/moved-example, develop) - moved example to docs
 - Added missing var keyword
 - Remove ECMAScript 6 for...of loop
 - Allow required to overwrite required_by_default
 - added "auto_upload" feature
 - merged latest changes from dmstr-forks
 - added .npmignore
 - Fixed multiselect v4 detection
 - Select2v4 API update w/ backwards compatibility
 - debugging tests
- updated travis testing
 - Merge remote-tracking branch 'pberger/develop' into develop
 - Fixed linting error.
 - Added color picker support, updated demo page.
 - Tabbing support, added tabbed Cars section to source schema.
 - Error messages support, styles fine tuning.
 - Added select, checkboxes and modal support.
 - Added support for Material Icons and Materialize CSS framework.
 - Merge remote-tracking branch 'sk8/master' into develop
 - Fixed multiselect v4 detection
 - Select2v4 API update w/ backwards compatibility
 - Fix: problem with Select2 v4
 - ignored dist folder
 - Merge remote-tracking branch 'm7000/feature/fixes' into develop
 - updated repository info / url
 - updated dist sources
 - replaced deprecated "select2('val')" method
 - updated dist sources
 - fixed bracket
 - added change handler
 - updated test
 - updated package.json; removed dist
 - Merge remote-tracking branch 'sk8/v1.0.0' into develop
 (origin/v1.0.0) - LV: Added travis badge. First steps toward #5
 - LV: Added Travis CI build
 - LV: Removed bower support. Updated build process
 - LV: New namespace editor
 (feature/testing) - updated testing setup
 - updated packages (#28)
 - Corrected borken Selectize link in README.md (#33)
 - Develop -> Master (#27)
 - Updated Readme
 - Docs folder (#6)
 - Clean up package.json
 - Update README.md
 - Added selenium tests with mocha
 - Add dependency system
 - Add empty object deletion
 - fix for sending 0 and false with remove_empty_properties=true
 - Added functionality to copy/paste objects from/to an array. The object will have a copy button and the array a paste button. It is not checking that the types match.
 - Select editor onInputChange was not casting the input value, which caused the value not being found when the type was not a string.
 - Casting more values to make the select editor safer.
 - The select editor values type is not very consistent. The getValue function will cast it so that at least when saving the values the proper type will be used.
 - Update theme.js
 - Added hidden input support.
 - Using strict comparison checks instead of type-converting comparison checks
 - Resolved conflicts
 - - better way to do it ...
 - - added option ajaxCredentials to enable cors with credentials; set to true if ajax calls shall send credentials - added option ajaxBase to enable schema references to work eigther with or without cors; set to protocoll://host:port when api is served by different host
 - Include expanded schemas options to include refs (#27)
 - Add option to have info buttons (#24)
 - Implemented template support for 'rel' property on href's schema #606 (#17)
 - Update multiple.js (#21)
 - Fixed to expand refs before creating root editor (#18)
 - fix for issue 627 - selectize dropdown causes prop to dissapear - and issue 538 - create hardcoded to true (#19)
 - Issue 488 fix disabled fields get enabled when using properties dropdown (#22)
 - Resolved merge conflicts
 - update submitted json when editing select fields via json manually to (#29)
 - Copy Array Element Button (#4)
 - Fixed #656; 2ndTime checked property not displayed in IE
 - Fixed #656;2ndTime checked property not displayed in IE
 - Cleaning with innerHTML='' causes issues on IE. So clean children one by one with removeChild (#11)
 - proposed fixes for #391, #392
 - proposed fix for #392
 - proposed fix for #391
 - :star::star::star::star::star: FEATURE: star rating editor
 - Update with latest upstream
 - Fix comment
 - Support readonly option
 - Do not use multiline strings
 - Add editor for integer rating
 - use hasOwnProperty instead of requiring a "true" value for startval (#30)
 - added check for whether label is defined for checkbox (#8)
 - Respect "minimum"/"maximum" and "exclusiveMinimum/Maximum" (#7)
 - Undefined variable issue when using template (#15)
 - Fix typo (#31)
 - Fix for crash given schema {"enum":[null]} (#26)
 - add option for lodash templates (#5)
 - Add remove_empty_properties option in objects from pull request #565; fixes issue #450/#451; original pr repository is missing
 - Changed grunt task name, serving files is also needed for the examples
 - added minified files
 - Changed tests to work with new grunt task
 - Fix disappearing text when moving block, credit @xmiao
 - Replace EpicEditor with SimpleMDE
 - Added bootstrap 4 theme and option for it in demo.html
 - Quickfix for Error "Cannot read property 'notifyWatchers' of null"

### (tag: v0.7.28)
 - Bump version to 0.7.28
 - Add enum_titles support for multiselect editor. Closes #583 Closes #585
 - Merge remote-tracking branch 'origin/pr/639' Closes #639
 - Fix JS error "this.translate is not a function" (issue #637)
 - Merge remote-tracking branch 'origin/pr/642' Closes #642
 - fixes certain properties not showing up after delete row then add row

### (tag: v0.7.27)
 - Bump version to 0.7.27 Closes #605
 - Merge remote-tracking branch 'origin/pr/605'
 - make jsoneditor strict mode compliant
 - Make JSONEditor strict mode compliant
 - Update grunt, add reference meta schema, preliminary anyOf support, jshint fixes

### (tag: v0.7.26)
 - Version bump to 0.7.26
 - Add option to set css classes for hyper schema links.
 - Fix bugs - error when watch path is an empty array, keep values wasn't working as expected.
 - Closes #611 - add display_required_only option
 - Cleaned up display_required_only code, add option to demo.html.
 - Add display_required_only option to editor
 - Closes #600 - Add button translation for collapse and expand
 - Add Expand translation & fix Collapse translation
 - Closes #530 - fix for undefined matchKey on element Merge remote-tracking branch 'origin/pr/530'
 - Fixed per feedback on PR
 - fixed #522; broken check in theme processing
 - Update docs to remove math.js as a required dependency

### (tag: v0.7.25)
 - Version bump to 0.7.25
 - JSLint fixes, documentation updates.
 - Undo dist file changes.
 - fix removeInputError for foundation6 theme
 - add foundation6 theme
 - Remove redundant "disable_add_properties" option, clean up code, add to demo.html
 - Add new options: * disable_array_delete_all_rows: hides the button to delete all rows in an   array. Note that "disable_array_delete:true" over-rides   "disable_array_delete_all_rows:false". * disable_array_delete_last_row: hides the button to delete the last row in an   array. Note that "disable_array_delete:true" over-rides   "disable_array_delete_last_rows:false". * disable_add_properties: hides the button to add properties.
 - Cleanup download code, improve documentation.
 - Add download attribute for link tag to transfer downloaded filename
 - Merge remote-tracking branch 'origin/pr/574' Closes #574
 - Add groovy support for editors
 - Create jsoneditor.barebones-theme.js

### (tag: v0.7.24)
 - Version bump to 0.7.24
 - Enhance regex error to show expected pattern
 - proposed fix for #388 using math.js
 - - added translation support for buttons shown by array editors

### (tag: v0.7.23)
 - Version bump to 0.7.23
 - Add custom_validators option to set instance-specific custom validators. Fixes #503
 - Move inline style to themes so it can be overridden. Fixes #509
 - Infers that when type is not set but properties are defined, we can infer that type is actually object
 - Fix gramatical error in validation message.  Fixes #511
 - Fire select2 change event on change instead of blur, reduce duplicate change firing for select editor. Closes #501
 - Remove selectize from demo.html, tighten up resolver rules for selectizeArray
 - Uses resolver for Selectize array editor
 - Improved Selectize demo
 - Avoid issue with splitting on commas
 - Adds Selectize support for array and select editors

### (tag: v0.7.22)
 - Version bump to 0.7.22
 - Allow spaces in template variables
 - Avoid displaying string "undefined" when value is `undefined`
 - Move switcher styles to theme.
 - Check that regex matching template vars is not null
 - Added the possibility filter on watched variables
 - jslint fix
 - optimize a few utility functions
 - required as property list
 - jshint
 - optional select option on bool and enumerated properties
 - Add documentation for `keep_oneof_values` option

### (tag: v0.7.21)
 - Version bump to 0.7.21
 - Fix bug with enumSource
 - Add class to property selector.
 - Fixes #292
 - Fix disabling additional properties per object
 - Allow static items for enumSource
 - Merge remote-tracking branch 'origin/pr/429'
 - Remove moot `version` property from bower.json
 - Update README

### (tag: v0.7.20)
 - Version bump to 0.7.20
 - Fix vertical tabs in Foundation 5 theme. Fixes #401
 - Allow url encoded $ref pointers. Fixes #402
 - Fix oneOf bug with object length. Fixes #423
 - Fix grunt watch to work with concat_sourcemap

### (tag: v0.7.19)
 - Bump version to 0.7.19
 - Remove "container-{{key}}" class from object property editors. Fixes #419
 - Drastic speed improvements for default template engine (up to 30x faster). Fixes #418. Alternative approach to #420.
 - bugfix: schema with length field of integer type
 - Generate sourcemap back to the original pre-concatenated files.
 - No exceptions when adding unconstrained properties. Fixes #409.
 - Fixed typo in CONTRIBUTING.md

### (tag: v0.7.18)
 - Version bump to 0.7.18
 - Add support for additionalProperties schema. Fixes #285 #383
 - Use window.jQuery instead of '$'. Add select2 multiselect example.
 - Update multiselect.js
 - Add validator context to custom_validators so that for example the this.translate method is usable within custom validators
 - made IE9 compatible ; also works (sic) in IE8  - reserved keywords  - jquery $isplainobject
 - Allow HTML in Form Input Description

### (tag: v0.7.17)
 - Version bump to 0.7.17
 - Add checkbox editor for boolean.
 - Add html to description
 - Update README.md
 - Add type=button attribute to avoid <button> elements being treated as submit controls

### (tag: v0.7.16)
 - Version bump to 0.7.16
 - Fix move down button of array editor being show even on the last element
 - Fixed $ref handling in schema editing
 - Type check element argument

### (tag: v0.7.15)
 - Version bump to 0.7.15
 - Add option `keep_oneof_values`. Set to `false` to stop oneOf properties copying over when switching.
 - Embed LZString library in demo.html.  cdn.rawgit.com was not working reliably.
 - Fix for when an object has a property named "length". Fixes #328

### (tag: v0.7.14)
 - Version bump to 0.7.14
 - Fix table and propertyOrder support. Fixes #316
 - Add documentation for various editor options.
 - Fix null class being added to td elements.
 - Add support for enum_titles with boolean fields.
 - Fix bug wth array tab headerText not updating on startVal for all tabs.
 - Add 'input_height' and 'expand_height' options for string based inputs (most useful for textareas).
 - Add 'input_width' option for string based editors. Also works within table cells.
 - Add 'grid_columns' option to explicitly set the width of a field.
 - Update lz-string script url

### (tag: v0.7.13)
 - Version bump - 0.7.13
 - Fixes #276, #277, #278
 - use correct css class for latest foundation
 - RequestAnimationFrame callbacks should double check if editor was destroyed meanwhile.

### (tag: v0.7.12)
 - Fix bug with object properties named "type". Fixes #183 Add setOption method (only works for `show_errors` currently). For #242 Make window.jsoneditor accessible from demo.html to help with debugging.

### (tag: v0.7.11)
 - Update documentation and version bump to 0.7.11
 - Fix $extend to exclude prototype properties. Add fix for Firefox's Object.prototype.watch conflict. Fixes #256 Fixes #249

### (tag: v0.7.10)
 - Version bump to 0.7.10
 - Add option to remove empty object properties from returned JSON. Fixes #220
 - Fix array/minItems bug. Fixes #246
 - Standardize all notify/change/watch calls. Fixes #247 Fixes #248
 - Properly handle cases when number extremum is 0
 - Register with npm

### (tag: v0.7.9)
 - Fix Select2 bugs, enum_titles support for strings, add Select2 example. Fixes #240 Related to #231

### (tag: v0.7.8)
 - Version bump 0.7.8
 - Can now override sceditor options on a per-instance basis.
 - Fix typo in enum editor. Add hide_display option to enum editor.
 - Typo in filter property

### (tag: v0.7.7)
 - Version bump to 0.7.7
 - Fix bug with no_additional_properties and nested arrays.  Fixes #229
 - Improve grid sizing of table and object editors. #224
 - Fix LZString url in demo.
 - Links are rendered using existing link editors
 - Change format to url
 - Allow custom title for download link
 - Support readonly fields
 - Only use upload editor if FileReader is available
 - Move download link to separate the "current value" part from the "change value" part
 - Disable upload button when upload is in progress
 - Use the uploaded document URL as the download link text
 - Use the format uri from the JSON Schema spec with an upload option for binary upload
 - Handle failure
 - Change file upload format to uploadUri
 - Possibility to specify a theme
 - Progress bar for Bootstrap2
 - Progress bar for Foundation
 - Progress bar for HTML5
 - File upload example
 - Add class for div with download link
 - Create download link when available
 - Upload callbacks grouped in callbacks object
 - Progress bar updates for unknown remaining
 - Add progress bar for Bootstrap3 theme
 - Upload file success using configured upload handler
 - Add upload editor based on base64

### (tag: v0.7.6)
 - Fix duplicate variable, bump version.
 - Scopes the editor variable with var
 - Fixes disabled properties and fixes property order
 - Fix select2 support by moving initialization from `build` to `postBuild`.

### (tag: v0.7.5)
 - Add new WYSIWYG example. Version bump.
 - Change table description format to match array's. Fixes #219
 - Fix watched fields bug with string enum editor. Fixes #216
 - Fix bug with the 0 not showing up in UI for integer fields. Fixes #215
 - Use minLength and maxLength to determine grid columns for string editor. Fixes #212

### (tag: v0.7.4)
 - Make jshint more strict. Bump version number.
 - Use proper "cssFloat" property for reserved word float (and CamelCase "marginLeft")
 - Fix bug with headers not updating properly with oneOf. Fixes #203

### (tag: v0.7.3)
 - Fix typo in editor. Fixes #205
 - Update CONTRIBUTING.md
 - Create CONTRIBUTING.md

### (tag: v0.7.2)
 - Bump version number to 0.7.2
 - number sanitizing allows scientific expression
 - Start array title index at 1. Fixes #167
 - Fixes #186 Array item form disappears when second to last item is deleted

### (tag: v0.7.1)
 - Add option for when to show validation errors.  Changed default behavior to be on interaction. Fixes #194

### (tag: v0.7.0)
 - Don't submit a form when clicking a button. Allow JSON editor to be wrapped in form-tags (cherry picked from commit 7e73ccf)
 - More "CSS skinnability" added class to "row", relates to issue #156 (cherry picked from commit bf2d3dd)
 - Update demo to reflect my real age :)
 - Add recursive schema and defaultProperties documentation. Change `complete.html` to `recursive.html` and just demonstrate the recursive schema support.
 - Add support for defaultProprties, overhaul object properties modal, fix dynamic headers.
 - New complete.html example (still a work in progress). More recursive schema fixes and code cleanup.
 - More recursive schema work.  Still needs work.
 - Editor API restructure to enable easier recursive schema support.
 - Partial support for recursive schemas.  A lot of stuff is still broken.
 - Initial setup of recursive schema support. DOESN'T WORK YET!

### (tag: v0.6.19)
 - Change validation error message for minLength: 1 to be "Value required". #158
 - Fix checkbox alignment for Bootstrap 3.2.0
 - Clean up string translation code.  Rename `formatter` to `translate` to reduce naming confusion with the JSON Schema `format` keyword. Fixes #74
 - Extracted the customization logic to a class that is instantiated in core.js. The instance is passed to the validator and the editors
 - String customization OK for errors
 - Extracted all messages from validator.js and added it to default.js associated with keys

### (tag: v0.6.18)
 - Add ability to set string format via options. #150
 - update jsoneditor.js/jsoneditor.min.js
 - put Array.isArray polyfill in ie9.js
 - use Array.isArray() instead of instanceof Array

### (tag: v0.6.17)
 - Version bump.
 - Allow for nested definitions. Fixes #127
 - Fix collapsed option with array editor.  Fixes #148

### (tag: v0.6.16)
 - Version bump.
 - skip afterInputReady for temporary string editor
 - Fix bug with multiselect and edit json button. Fixes #145
 - Fix typo that was breaking arrays. Fixes #146

### (tag: v0.6.15)
 - Add options for hiding array controls (add row, delete row, move up/down). Fixes #139 Fix bug with table editor and minItems.
 - Fix bug when multiselect is used within table editor. Fixes #141
 - Fix table column ordering with `propertyOrder`. Fixes #143

### (tag: v0.6.14)
 - Version bump.
 - Avoid "self" referring to "window"; adjust comment placement
 - Add file upload editor for base64 strings.
 - Change demo to use cdn.rawgit for lzstring library
 - Change demo url to avoid abusing rawgit.com
 - Fixes json in package.json

### (tag: v0.6.13)
 - Add propertyOrder support, fix SCEditor, fix validator ready bug.

### (tag: v0.6.12)
 - Add jshint to grunt build process. Remove CustomEvents check in utilities. Fixes #131 Add support for SCEditor initialization options. Bug fix in Class implementation checking for function toString support.
 - HTML5 expects meta charset, and FF complains in console without it; should be before title in case special chars used within title

### (tag: v0.6.11)
 - Add disable_properties option, checkbox version of multiselect editor. Fixes #111 #105 #91

### (tag: v0.6.10)
 - Fix bug with validate API call.
 - Fix validation when supplying value to validate()
 - Update README.md

### (tag: v0.6.9)
 - Update bower version.
 - Fix bugs with error messages not showing up. Fixes #114
 - Add new multiselect editor for arrays of enumerated strings.  Fixes #91
 - Add 'hidden' option to all editors that stops it from being displayed in the UI.

### (tag: v0.6)
 - Fix #100
 - Add bower.json file. For #101
 - Add name attributes to form inputs so JSON Editor can be embedded in an HTML form.
 - Fix bug with EpicEditor integration. Fixes #92
 - Bump version number.
 - Fixed default value when "type" is an array of types. Note: The expected default value should match the first type in the types array.
 - Fix #93
 - Performance improvement for multiple editor. Now using lazy loading of child editors.
 - UI Improvements
 - Now all buttons have a css-class specifying its function
 - Fix bug with startval not firing change event on parent elements.  Fixes #86
 - Fix bug with link_watchers not being defined.
 - Add support for hyper-schema `links` keyword.
 - Fix error message when an invalid type is used. Add support for media keyword from Hyper Schema (for #68)
 - Fix bug with constant values in enumSource.
 - Fix bug with enumSource within array elements. For #82
 - Add verbose form of enumSource property.  Fixes #82
 - Fix initial value for EpicEditor and Ace Editor.
 - Integrate Ace editor for source code editing.
 - Clean up demo code.
 - Split IE9 polyfills to a separate file. For #79
 - Fix dynamic header for objects.
 - Fix bug with headerTemplate and bootstrap3 theme and tab arrays.
 - Fix bug with enumSource watching a field before it's declared. Fixes #80
 - Version bump.
 - Enable/Disable buttons and links, update README and example.
 - Basic implementation of enable/disable.
 - Fix script src in validator test page.
 - version bump
 - Miscellaneous bug fixes for edge cases.
 - Add filesize for production version to readme.
 - Update README and examples. Fix a couple bugs.
 - Fix bug with oneOf and registering editors.
 - Add api methods for listening for ready/change events.
 - Add backwards compatible syntax for setting JSON editor defaults.
 - A bunch of bug fixes, performance improvements, and new api methods.
 - Convert jqueryui theme to native javascript.
 - Performance improvements and a few bug fixes.
 - Fully remove jQuery dependency.
 - Convert foundation themes and iconlibs to native javascript.
 - Convert bootstrap2 and bootstrap3 themes to native javascript.
 - Convert table, null, and enum editors to native javascript.
 - Added native implementation of $.each and moved utilities to their own file.
 - Add native implementation of $extend (http://andrewdupont.net/2009/08/28/deep-extending-objects-in-javascript/)
 - Started converting to native javascript.
 - Add support for Zepto (requires event and data modules only).  First step to fully convert to native.
 - Performance improvements with showing/hiding input validation errors with the bootstrap2 theme. Fixed order of properties when merging with $ref (before it was showing all the $ref properties first and then ones defined locally, not it does the opposite).
 - Major performance improvements for large schemas (500% faster initialization in some cases).
 - Performance improvements when deleting array elements from long arrays. Performance improvement when adding back previously deleted array elements.
 - Fix bug with the multiple editor that wasn't choosing good display names for the drop down.
 - Add support for dynamic headers.  Fixes #67
 - Fix typo with string format=textarea.
 - Add support back for `collapsed` option.  It was broken a while ago.
 - Fixed bug with Validator.expandSchema not recursively expanding.
 - Add validator support for required_by_default and no_additional_properties.
 - Adding new `tabs` format for arrays.
 - Moved example.html to demo.html and added examples directory. Fixed bug with minItems. Add support for relative URLs in $ref. Used to only support ones starting http://
 - Clean up README overview and options
 - Fix bug with string editor not always returning a string value when dynamic enums are used.
 - Update README.md
 - Improve styling of table and array editors. Fixes #64
 - Add support for icon buttons.  Fixes #65
 - Fix bug with string editor and enumSource.
 - Add support for the Select2 library.
 - Add support for readOnly (version 4 hyper schema) and readonly (version 2 json schema) for string and select editors.
 - Remove trailing comma.
 - Fix padding around arrays in the Bootstrap2 theme.
 - Fix bug with setting the value of an enumSource element before the select options have been set.
 - Fix bug with watched fields not updating correctly within array rows.
 - Add `no_additional_items` option for JSON Editor. Clean up documentation.
 - Fix bug with `self` not being defined. Move `data-schematype` attribute to container instead of input.
 - Add support for dynamic enum.  Fixes #61
 - Change `vars` to `watch` and moved it to AbstractEditor. Fixes #55
 - Add editor support for allOf and extends. Fixes #49 Fix bug with refs not being expanded properly.
 - Add editor support for disallow. Fixes #62 Add support for additional properties when setting the value for an object editor programatically. Clean up documentation.
 - Add support for additionalProperties and patternProperties. Fixes #46 Clean up title controls for objects.
 - Revert example page to use bootstrap.
 - Show validation errors in the form. Fixes #43
 - Update README.md
 - Add enum support for booleans. Fixes #59 Move all select box logic to a 'select' editor and out of 'string'. Remove old 'boolean' editor and just use 'select' instead.
 - Add support for editing markdown with EpicEditor.  Fixes #57
 - Add support for SCEditor for WYSIWYG editing of HTML and BBCode. For #57
 - Add support for custom validation. Fixes #58
 - Intelligently choose oneOf schema based on value being set. Fixes #56 Removed `editor` keyword.  Fixes #54 Made validator synchronous by default and add `ajax` option. Fixes #53 Added `required_by_default` option. Cleaned up example code. Cleaned up documentation.
 - Version bump.
 - Add new `enum` editor that works for type `object` and `array`.  Fixes #52 Fix small bug with boolean editor firing the `set` event too early.
 - Add support for `oneOf` and better support for `type`. Fixes #48
 - Fix broken null editor. Make all editors fire a set event when setValue is called. Make array editor work without items schema. Allow schema without type defined. Fix multiple editor when switching to array with a non-array value already set.
 - Add editor support for min and max properties. Fixes #45
 - Add full support for `items` and `additionalItems` keywords. Fixes #47
 - Add editor support for pattern, minLength, and maxLength. Fixes #50
 - Fix bug with required version 3 support.
 - Made the Validator class self contained. Now, JSON Editor fully resolves all references before initialization. Added more validation test cases for $ref and definitions. Cleaned up the code.
 - Restructured readme to be more user friendly and logically laid out. Fix typo with version 3's `require` keyword. Add optional parameter to validate api call that lets you pass in data to validate.
 - Add validator support for dependencies, disallow, and extends. Fixed bugs and typos in validator. Add test script which tests the validator against every validation keyword. Add null editor. Remove `isValid` methods from all editors and replaced the `validate` api call to use the new Validator class instead. Change example to automatically validate on change and display the results instead of requiring a button click. Add support for type="any" in the multiple editor. Add support for arrays without `items` defined and objects without `properties` defined. Add support for the `required` attribute from version 3 of the spec.
 - Finished implementing validation, but still needs testing.
 - Add beginnings of validator class.
 - Remove caveat about type support since we now support type arrays. Clean up headers in README.
 - Add support for schemas with multiple types. Fixes #39
 - Add support for minProperties and maxProperties.  Fixes #38 Change documentation to only list the keywords we don't support and improve wording here and there.
 - Add support for `required` schema keyword. Fixes #37 Support for `minProperties` and `maxProperties` can now be added and will come soon.
 - Add startval example to README
 - Bump version number.
 - Fix typo with default template engine and spaces around the variable names. Add template field to example. Make specifying the schema id for a template optional and have it default to the root node. Fix bugs related to change events not firing and templates not re-generating when setting values programatically. Clean up example code. Make the template examples in README clearer.
 - Add default simple template engine and disable auto-detection. Fixes #35 Change how the id schema keyword is used to be more inline with the JSON Schema spec. Fixes #36 Update documentation to reference these changes and improve the abstract at the top.
 - Add description image to readme.
 - Add description image.
 - Update README.md
 - Fix typo in README
 - Add support for external urls with $ref. Fixes #34
 - Modified grunt to preserve the license comment when uglifying. Fixes #33
 - Bump version number.
 - Add "Edit JSON" button to object editor when not in table row mode.  Fixes #32 Change toggle button labels from show/hide to Collapse/Expand to make the meaning clearer. Made the Collapse buttons also hide the controls for the array and table editors.
 - Fix invalid json in README.md.
 - Add Foundation 3 theme. Improve html theme and set that as the default instead of bootstrap2. Clean up the example page. Improve documentation.
 - Fix bug with templates inside array rows now updating when rearranging rows. Fix bug with templates inside table row. Add resolver classes to give more control over deciding which editor a schema should use. Fixes #29
 - Add foundation4 and foundation5 themes. Fixes #25 Fixes #26
 - Adding markdown template engine. Fixes #23
 - Update README.md
 - Implement isValid methods for all editors. Added 'validate' method to jsoneditor. Fixes #11 Fix bug with default values not being used when setting an incomplete value.
 - Add support for popular template engines with auto-detection. Fixes #20 Ability to set global theme. Fixes #21 Ability to set per-instance template engine in addition to global template engine. Fixes #22 Removed `textarea` option and made it a `format` instead. Improved documentation.
 - Update distribution file with correct version number and date.
 - New editor and theme APIs for more flexibility down the line. Fixes #18 Improved styling for all included themes. Add support for arrays of things other than objects. Fixes #19 Add simple HTML theme.
 - Add support for `multipleOf` when using range input.  Fixes #17
 - Fix README which accidentally got overridden in the last commit.
 - Split file into multiple source files for easier code management. Add Grunt dependency for the build process. Fixes #10 Moved jquery.jsoneditor.js to dist directory along with new minified version. Improved readme and examples.
 - Fix bug in bootstrap2 theme. Remove "Delete Last row" button in array/table editor when array is empty.
 - Add bootstrap3 theme and improve jqueryui theme (for #12) Update documentation to reference themes and editor options.
 - Fix Typo in JSON example
 - Fix pass-by-reference bug with default values. Add preliminary support for a jqueryui theme (for #12)
 - Add toggle button to table editor.  Fixes #15 Add support for collapsed editor option on array and table editors. Fix bug with change event not firing for template fields
 - Add support for setting editor options in a schema. Add 'collapsed' option to object editor that defaults the editor to collapsed. Fixes #13
 - Add "Delete All Rows" button to array editor. Fixes #14 Hide delete buttons when an array is empty.
 - Update readme to list out the supported formats
 - Update README.md
 - Update readme to point to an example that actually works.
 - Made boolean editor separate from string editor and improve UI. Add value display for range format. Fixes #9
 - Add support for format schema keyword.  Fixes #4 Add partial support for minimum and maximum keywords, but they are only used when format is set to `range`.  For #7 Make indentation more consistent in the code.
 - Add support for definitions and references.  Fixes #2
 - Add support for different templating engines. Fixes #8 Update readme with instructions for changing the template engine. Expand list of supported schema keywords in readme (default, description, etc.)
 - Add support for minItems and maxItems schema keywords for arrays.  Fixes #1
 - Fix bug with removing move down button in empty array. Add support for description and default schema keywords. Fixes #3
 - Hide "move down" button for last item in array. Fixes #5
 - Initial commit.
 - Initial commit
