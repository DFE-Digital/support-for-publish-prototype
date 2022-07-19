const locationModel = require('../models/locations')
const organisationModel = require('../models/organisations')

const organisationHelper = require('../helpers/organisations')
const paginationHelper = require('../helpers/pagination')

exports.list = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  let locations = locationModel.findMany({})

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
  const location = locationModel.findOne({ locationId: req.params.locationId })

  res.render('../views/organisations/locations/show', {
    organisation,
    location,
    actions: {
      back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`,
      change: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/${req.params.locationId}/edit`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// EDIT LOCATION
/// ------------------------------------------------------------------------ ///

exports.edit_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const location = locationModel.findOne({ locationId: req.params.locationId })

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
  let location = locationModel.findOne({ locationId: req.params.locationId })
  location = req.session.data.location

  const errors = []

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

    req.flash('success', 'location details updated')
    res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/${req.params.locationId}`)
  }
}
