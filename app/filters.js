const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const { DateTime } = require('luxon')
const marked = require('marked')
const numeral = require('numeral')

const cycleHelper = require('./helpers/cycles')
const organisationHelper = require('./helpers/organisations')
const visaSponsorshipHelper = require('./helpers/visa-sponsorship')

const individualFiltersFolder = path.join(__dirname, './filters')

module.exports = (env) => {
  /**
   * Instantiate object used to store the methods registered as a
   * 'filter' (of the same name) within nunjucks. You can override
   * gov.uk core filters by creating filter methods of the same name.
   * @type {Object}
   */
  const filters = {}

  // Import filters from filters folder
  if (fs.existsSync(individualFiltersFolder)) {
    const files = fs.readdirSync(individualFiltersFolder)
    files.forEach(file => {
      const fileData = require(path.join(individualFiltersFolder, file))
      // Loop through each exported function in file (likely just one)
      Object.keys(fileData).forEach((filterGroup) => {
        // Get each method from the file
        Object.keys(fileData[filterGroup]).forEach(filterName => {
          filters[filterName] = fileData[filterGroup][filterName]
        })
      })
    })
  }

  /* ------------------------------------------------------------------
  utility function to return true or false
  example: {{ 'yes' | falsify }}
  outputs: true
  ------------------------------------------------------------------ */
  filters.falsify = (input) => {
    if (_.isNumber(input)) return input
    else if (input == false) return false
    if (_.isString(input)) {
      const truthyValues = ['yes', 'true']
      const falsyValues = ['no', 'false']
      if (truthyValues.includes(input.toLowerCase())) return true
      else if (falsyValues.includes(input.toLowerCase())) return false
    }
    return input
  }

  /* ------------------------------------------------------------------
   numeral filter for use in Nunjucks
   example: {{ params.number | numeral("0,00.0") }}
   outputs: 1,000.00
  ------------------------------------------------------------------ */
  filters.numeral = (number, format) => {
    return numeral(number).format(format)
  }

  /* ------------------------------------------------------------------
  utility function to get an error for a component
  example: {{ errors | getErrorMessage('title') }}
  outputs: "Enter a title"
  ------------------------------------------------------------------ */
  filters.getErrorMessage = function (array, fieldName) {
    if (!array || !fieldName) {
      return null
    }

    const error = array.filter((obj) =>
      obj.fieldName === fieldName
    )[0]

    return error
  }

  /* ------------------------------------------------------------------
  utility function to parse markdown as HTML
  example: {{ "## Title" | markdownToHtml }}
  outputs: "<h2>Title</h2>"
  ------------------------------------------------------------------ */
  filters.markdownToHtml = (markdown) => {
    if (!markdown) {
      return null
    }
    const html = marked.parse(markdown)
    return html
  }

  /* ------------------------------------------------------------------
  utility function to get the provider type label
  example: {{ "scitt" | getProviderTypeLabel }}
  outputs: "School Centred Initial Teacher Training (SCITT)"
  ------------------------------------------------------------------ */
  filters.getProviderTypeLabel = (code) => {
    let label = code

    if (code) {
      label = organisationHelper.getProviderTypeLabel(code)
    }

    return label
  }

  /* ------------------------------------------------------------------
  GOV.UK style dates
  @type {Date} date
  ------------------------------------------------------------------ */

  filters.govukDateAtTime = (date) => {
    const govukDate = filters.govukDate(date)
    const time = filters.time(date)
    return govukDate + ' at ' + time
  }

  filters.govukShortDateAtTime = (date) => {
    const govukDate = filters.dateToGovukDate(date)
    const time = filters.time(date)
    return govukDate + ' at ' + time
  }

  /* ------------------------------------------------------------------
  GOV.UK style times
  @type {Date} date
  ------------------------------------------------------------------ */

  filters.time = (date) => {
    let dt = DateTime.fromISO(date)
    if (dt.minute > 0) {
      dt = dt.toFormat('h:mma')
    } else {
      dt = dt.toFormat('ha')
    }
    return dt.toLowerCase()
  }

  /* ------------------------------------------------------------------
  utility function to get the cycle label
  example: {{ '2022' | getCycleLabel }}
  outputs: "2021 to 2022 - current"
  ------------------------------------------------------------------ */
  filters.getCycleLabel = (cycle) => {
    let label = cycle

    if (cycle) {
      label = cycleHelper.getCycleLabel(cycle)
    }

    return label
  }

  /* ------------------------------------------------------------------
  utility function to get the student visa label
  example: {{ "yes" | getStudentVisaLabel }}
  outputs: "Yes"
  ------------------------------------------------------------------ */
  filters.getStudentVisaLabel = (code) => {
    let label

    if (code) {
      label = visaSponsorshipHelper.getStudentVisaLabel(code)
    }

    return label
  }

  /* ------------------------------------------------------------------
  utility function to get the skilled worker visa label
  example: {{ "no" | getSkilledWorkerVisaLabel }}
  outputs: "No, or not applicable"
  ------------------------------------------------------------------ */
  filters.getSkilledWorkerVisaLabel = (code) => {
    let label

    if (code) {
      label = visaSponsorshipHelper.getSkilledWorkerVisaLabel(code)
    }

    return label
  }

  /* ------------------------------------------------------------------
    keep the following line to return your filters to the app
  ------------------------------------------------------------------ */
  return filters
}
