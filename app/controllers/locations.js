const locationModel = require('../models/locations')
const organisationModel = require('../models/organisations')

const paginationHelper = require('../helpers/pagination')
const validationHelper = require("../helpers/validators")

exports.list = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  let locations = locationModel.findMany({ organisationId: req.params.organisationId })

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
    const error = {};
    error.fieldName = "location-name";
    error.href = "#location-name";
    error.text = "Enter a name";
    errors.push(error);
  }

  if (!req.session.data.location.address.addressLine1.length) {
    const error = {};
    error.fieldName = "address-line-1";
    error.href = "#address-line-1";
    error.text = "Enter address line 1";
    errors.push(error);
  }

  if (!req.session.data.location.address.town.length) {
    const error = {};
    error.fieldName = "address-town";
    error.href = "#address-town";
    error.text = "Enter a town or city";
    errors.push(error);
  }

  if (!req.session.data.location.address.postcode.length) {
    const error = {};
    error.fieldName = "address-postcode";
    error.href = "#address-postcode";
    error.text = "Enter postcode";
    errors.push(error);
  } else if (
    !validationHelper.isValidPostcode(
      req.session.data.location.address.postcode
    )
  ) {
    const error = {};
    error.fieldName = "address-postcode";
    error.href = "#address-postcode";
    error.text = "Enter a real postcode";
    errors.push(error);
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
  res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`)
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
      cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`
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
    const error = {};
    error.fieldName = "location-name";
    error.href = "#location-name";
    error.text = "Enter a name";
    errors.push(error);
  }

  if (!req.session.data.location.address.addressLine1.length) {
    const error = {};
    error.fieldName = "address-line-1";
    error.href = "#address-line-1";
    error.text = "Enter address line 1";
    errors.push(error);
  }

  if (!req.session.data.location.address.town.length) {
    const error = {};
    error.fieldName = "address-town";
    error.href = "#address-town";
    error.text = "Enter a town or city";
    errors.push(error);
  }

  if (!req.session.data.location.address.postcode.length) {
    const error = {};
    error.fieldName = "address-postcode";
    error.href = "#address-postcode";
    error.text = "Enter postcode";
    errors.push(error);
  } else if (
    !validationHelper.isValidPostcode(
      req.session.data.location.address.postcode
    )
  ) {
    const error = {};
    error.fieldName = "address-postcode";
    error.href = "#address-postcode";
    error.text = "Enter a real postcode";
    errors.push(error);
  }

  if (errors.length) {
    res.render('../views/organisations/locations/edit', {
      organisation,
      location,
      actions: {
        save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/${req.params.locationId}/edit`,
        back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`,
        cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`
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
