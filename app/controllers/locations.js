const locationModel = require('../models/locations')
const organisationModel = require('../models/organisations')

const paginationHelper = require('../helpers/pagination')
const validationHelper = require("../helpers/validators")

const csv = require('csv-string')

// convert an array of user arrays into an array of user objects
const parseRawLocationData = (array) => {
  const locations = []
  array.forEach((row, i) => {
    const location = {}
    location.name = row[0]
    location.urn = row[1]
    location.addressLine1 = row[2]
    location.addressLine2 = row[3]
    location.town = row[4]
    location.county = row[5]
    location.postcode = row[6]
    locations.push(location)
  })
  return locations
}

exports.list = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  let locations = locationModel.findMany({ organisationId: req.params.organisationId })

  delete req.session.data.location
  delete req.session.data.locations
  delete req.session.data.upload

  locations.sort((a, b) => {
    if (a.name) {
      return a.name.localeCompare(b.name)
    }
  })

  // Get the pagination data
  const pagination = paginationHelper.getPagination(locations, req.query.page)

  // Get a slice of the data to display
  locations = paginationHelper.getDataByPage(locations, pagination.pageNumber)

  res.render('../views/organisations/locations/list', {
    organisation,
    locations,
    pagination,
    actions: {
      details: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}`,
      users: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users`,
      courses: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/courses`,
      locations: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`,
      new: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/new`,
      upload: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/multiple/new`,
      view: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// SHOW LOCATION
/// ------------------------------------------------------------------------ ///

exports.show = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const location = locationModel.findOne({
    organisationId: req.params.organisationId,
    locationId: req.params.locationId
  })

  res.render('../views/organisations/locations/show', {
    organisation,
    location,
    actions: {
      back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`,
      change: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/${req.params.locationId}/edit`,
      delete: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/${req.params.locationId}/delete`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// NEW LOCATION
/// ------------------------------------------------------------------------ ///

exports.new_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  let back = `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`
  if (req.query.referrer === 'check') {
    back = `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/new/check`
  }

  res.render('../views/organisations/locations/edit', {
    organisation,
    location: req.session.data.location,
    actions: {
      save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/new`,
      back,
      cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`
    }
  })
}

exports.new_post = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  const errors = []

  if (!req.session.data.location.name.length) {
    const error = {}
    error.fieldName = "location-name"
    error.href = "#location-name"
    error.text = "Enter a name"
    errors.push(error)
  }

  if (!req.session.data.location.address.addressLine1.length) {
    const error = {}
    error.fieldName = "address-line-1"
    error.href = "#address-line-1"
    error.text = "Enter address line 1"
    errors.push(error)
  }

  if (!req.session.data.location.address.town.length) {
    const error = {}
    error.fieldName = "address-town"
    error.href = "#address-town"
    error.text = "Enter a town or city"
    errors.push(error)
  }

  if (!req.session.data.location.address.postcode.length) {
    const error = {}
    error.fieldName = "address-postcode"
    error.href = "#address-postcode"
    error.text = "Enter postcode"
    errors.push(error)
  } else if (
    !validationHelper.isValidPostcode(
      req.session.data.location.address.postcode
    )
  ) {
    const error = {}
    error.fieldName = "address-postcode"
    error.href = "#address-postcode"
    error.text = "Enter a real postcode"
    errors.push(error)
  }

  if (errors.length) {
    res.render('../views/organisations/locations/edit', {
      organisation,
      location: req.session.data.location,
      actions: {
        save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/new`,
        back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`,
        cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`
      },
      errors
    })
  } else {
    res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/new/check`)
  }
}

exports.new_check_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  res.render('../views/organisations/locations/check', {
    organisation,
    location: req.session.data.location,
    actions: {
      save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/new/check`,
      back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/new`,
      change: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/new`,
      cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`
    }
  })
}

exports.new_check_post = (req, res) => {
  locationModel.insertOne({
    organisationId: req.params.organisationId,
    location: req.session.data.location
  })

  delete req.session.data.location

  req.flash('success', 'Location added')

  if (req.session.data.button.submit === 'continue') {
    res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/new`)
  } else {
    res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`)
  }
}

/// ------------------------------------------------------------------------ ///
/// EDIT LOCATION
/// ------------------------------------------------------------------------ ///

exports.edit_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const location = locationModel.findOne({
    organisationId: req.params.organisationId,
    locationId: req.params.locationId
  })

  res.render('../views/organisations/locations/edit', {
    organisation,
    location,
    actions: {
      save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/${req.params.locationId}/edit`,
      back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`,
      cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/${req.params.locationId}`
    }
  })
}

exports.edit_post = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  let location = locationModel.findOne({
    organisationId: req.params.organisationId,
    locationId: req.params.locationId
  })

  location = req.session.data.location

  const errors = []

  if (!req.session.data.location.name.length) {
    const error = {}
    error.fieldName = "location-name"
    error.href = "#location-name"
    error.text = "Enter a name"
    errors.push(error)
  }

  if (!req.session.data.location.address.addressLine1.length) {
    const error = {}
    error.fieldName = "address-line-1"
    error.href = "#address-line-1"
    error.text = "Enter address line 1"
    errors.push(error)
  }

  if (!req.session.data.location.address.town.length) {
    const error = {}
    error.fieldName = "address-town"
    error.href = "#address-town"
    error.text = "Enter a town or city"
    errors.push(error)
  }

  if (!req.session.data.location.address.postcode.length) {
    const error = {}
    error.fieldName = "address-postcode"
    error.href = "#address-postcode"
    error.text = "Enter postcode"
    errors.push(error)
  } else if (
    !validationHelper.isValidPostcode(
      req.session.data.location.address.postcode
    )
  ) {
    const error = {}
    error.fieldName = "address-postcode"
    error.href = "#address-postcode"
    error.text = "Enter a real postcode"
    errors.push(error)
  }

  if (errors.length) {
    res.render('../views/organisations/locations/edit', {
      organisation,
      location,
      actions: {
        save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/${req.params.locationId}/edit`,
        back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`,
        cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/${req.params.locationId}`
      },
      errors
    })
  } else {
    locationModel.updateOne({
      organisationId: req.params.organisationId,
      locationId: req.params.locationId,
      location: req.session.data.location
    })

    delete req.session.data.location

    req.flash('success', 'Location details updated')
    res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/${req.params.locationId}`)
  }
}

/// ------------------------------------------------------------------------ ///
/// DELETE LOCATION
/// ------------------------------------------------------------------------ ///

exports.delete_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const location = locationModel.findOne({
    organisationId: req.params.organisationId,
    locationId: req.params.locationId
  })

  res.render('../views/organisations/locations/delete', {
    organisation,
    location,
    actions: {
      save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/${req.params.locationId}/delete`,
      back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/${req.params.locationId}`,
      cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/${req.params.locationId}`
    }
  })
}

exports.delete_post = (req, res) => {
  locationModel.deleteOne({
    organisationId: req.params.organisationId,
    locationId: req.params.locationId
  })

  req.flash('success', 'Location removed')
  res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`)
}

/// ------------------------------------------------------------------------ ///
/// NEW MULTIPLE LOCATIONS
/// ------------------------------------------------------------------------ ///

exports.new_multiple_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  // clear any previously uploaded data
  delete req.session.data.upload
  res.render('../views/organisations/locations/upload/index', {
    organisation,
    actions: {
      save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/multiple/new`,
      back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`,
      cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`
    }
  })
}

exports.new_multiple_post = (req, res) => {
  let raw = req.session.data.upload.raw
  raw = raw.trim()

  const errors = []

  if (!raw.length) {
    const error = {}
    error.fieldName = 'raw'
    error.href = '#raw'
    error.text = 'Enter location details'
    errors.push(error)
  }

  if (errors.length) {
    const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
    res.render('../views/organisations/locations/upload/index', {
      organisation,
      errors,
      actions: {
        save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/multiple/new`,
        back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`,
        cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`
      }
    })
  } else {
    // dynamically work out the delimiter used in the data
    const delimiter = csv.detect(raw)

    // parse the data and populate the session data
    const index = csv.readAll(raw, delimiter, data => {
      req.session.data.upload.locations = data
    })

    // set a new array and populate with parsed locations
    req.session.data.locations = parseRawLocationData(req.session.data.upload.locations)

    // set the position counter so we can iterate through the locations and keep track
    req.session.data.upload.position = 0

    res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/multiple/edit`)
  }
}

exports.new_multiple_edit_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  if (req.query.action === 'change' || req.query.action === 'back') {
    // get the position of the user we want to edit
    req.session.data.upload.position = parseInt(req.query.position)
  }

  const locationCount = req.session.data.upload.locations.length
  const currentLocationNum = req.session.data.upload.position + 1

  // set the save route for new or change flow
  let save = `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/multiple/edit`
  if (req.query.action === 'change') {
    save += '?action=change'
  }

  // set the back route for new or change flow
  let back = `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/multiple/new`
  if (req.query.action === 'change') {
    back = `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/multiple/check`
  } else if (req.session.data.upload.position) {
    const previousPosition = req.session.data.upload.position - 1
    back = `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/multiple/edit?action=back&position=${previousPosition}`
  }

  let cancel = `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`
  if (req.query.action === 'change') {
    cancel += '/multiple/check'
  }

  // get the user from the parsed users
  const location = req.session.data.locations[req.session.data.upload.position]

  res.render('../views/organisations/locations/upload/edit', {
    organisation,
    location,
    locationCount,
    currentLocationNum,
    actions: {
      save,
      back,
      cancel
    }
  })
}

exports.new_multiple_edit_post = (req, res) => {
  const errors = []

  if (!req.session.data.location.name.length) {
    const error = {}
    error.fieldName = 'location-name'
    error.href = '#location-name'
    error.text = 'Enter a location name'
    errors.push(error)
  }

  if (!req.session.data.location.address.addressLine1.length) {
    const error = {}
    error.fieldName = "address-line-1"
    error.href = "#address-line-1"
    error.text = "Enter address line 1"
    errors.push(error)
  }

  if (!req.session.data.location.address.town.length) {
    const error = {}
    error.fieldName = "address-town"
    error.href = "#address-town"
    error.text = "Enter a town or city"
    errors.push(error)
  }

  if (!req.session.data.location.address.postcode.length) {
    const error = {}
    error.fieldName = "address-postcode"
    error.href = "#address-postcode"
    error.text = "Enter postcode"
    errors.push(error)
  } else if (
    !validationHelper.isValidPostcode(
      req.session.data.location.address.postcode
    )
  ) {
    const error = {}
    error.fieldName = "address-postcode"
    error.href = "#address-postcode"
    error.text = "Enter a real postcode"
    errors.push(error)
  }

  if (errors.length) {
    const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
    const location = req.session.data.location

    const locationCount = req.session.data.upload.locations.length
    const currentLocationNum = req.session.data.upload.position + 1

    // set the save route for new or change flow
    let save = `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/multiple/edit`
    if (req.query.action === 'change') {
      save += '?action=change'
    }

    // set the back route for new or change flow
    let back = `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/multiple/new`
    if (req.query.action === 'change') {
      back = `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/multiple/check`
    } else if (req.session.data.upload.position) {
      const previousPosition = req.session.data.upload.position - 1
      back = `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/multiple/edit?action=back&position=${previousPosition}`
    }

    let cancel = `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`
    if (req.query.action === 'change') {
      cancel += '/multiple/check'
    }

    res.render('../views/organisations/locations/upload/edit', {
      organisation,
      location,
      errors,
      locationCount,
      currentLocationNum,
      actions: {
        save,
        back,
        cancel
      }
    })
  } else {

    // replace the data held in the session with the changed data
    req.session.data.locations.splice(req.session.data.upload.position, 1, req.session.data.location)

    // delete the location object read for the next item in the flow
    delete req.session.data.location

    // if we've reached the last person, move to the next step, else next continue
    if (req.session.data.upload.position === (req.session.data.upload.locations.length - 1)
      || req.session.data.action === 'change') {
      delete req.session.data.action
      res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/multiple/check`)
    } else {
      // increment the position to track where we are in the flow
      req.session.data.upload.position += 1
      res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/multiple/edit`)
    }
  }

}

exports.new_multiple_check_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const locations = req.session.data.locations
  res.render('../views/organisations/locations/upload/check', {
    organisation,
    locations,
    actions: {
      save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/multiple/check`,
      back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/multiple/edit?action=back&position=${locations.length-1}`,
      cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`,
      change: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/multiple/edit`
    }
  })
}

exports.new_multiple_check_post = (req, res) => {
  locationModel.insertMany(req.params.organisationId, req.session.data.locations)
  if (req.session.data.locations.length === 1) {
    req.flash('success', `Location ${req.session.data.locations[0].name} added`)
  } else {
    req.flash('success', `${req.session.data.locations.length} locations added`)
  }
  delete req.session.data.locations
  delete req.session.data.upload
  res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`)
}
