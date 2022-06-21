// const courseModel = require('../models/courses')
const organisationModel = require('../models/organisations')

const cycleHelper = require('../helpers/cycles')
const organisationHelper = require('../helpers/organisations')
const paginationHelper = require('../helpers/pagination')

exports.list = (req, res) => {
  let organisations = organisationModel.findMany({})

  organisations.sort((a, b) => {
    if (a.name) {
      return a.name.localeCompare(b.name)
    }
  })

  // Get the pagination data
  const pagination = paginationHelper.getPagination(organisations, req.query.page)

  // Get a slice of the data to display
  organisations = paginationHelper.getDataByPage(organisations, pagination.pageNumber)

  res.render('../views/organisations/list', {
    organisations,
    pagination
  })
}

/// ------------------------------------------------------------------------ ///
/// SHOW ORGANISATION
/// ------------------------------------------------------------------------ ///

exports.show = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  res.render('../views/organisations/show', {
    organisation,
    actions: {
      details: `/organisations/${req.params.organisationId}`,
      users: `/organisations/${req.params.organisationId}/users`,
      courses: `/organisations/${req.params.organisationId}/courses`,
      locations: `/organisations/${req.params.organisationId}/locations`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// EDIT ORGANISATION
/// ------------------------------------------------------------------------ ///

exports.edit_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  res.render('../views/organisations/edit', {
    organisation,
    actions: {
      save: `/organisations/${req.params.organisationId}/edit`,
      back: `/organisations/${req.params.organisationId}`,
      cancel: `/organisations/${req.params.organisationId}`
    }
  })
}

exports.edit_post = (req, res) => {
  const errors = []

  if (errors.length) {
    res.render('../views/organisations/edit', {
      organisation: req.session.data.organisation,
      actions: {
        save: `/organisations/${req.params.organisationId}/edit`,
        back: `/organisations/${req.params.organisationId}`,
        cancel: `/organisations/${req.params.organisationId}`
      },
      errors
    })
  } else {
    organisationModel.updateOne({
      organisationId: req.params.organisationId,
      organisation: req.session.data.organisation
    })

    req.flash('success', 'Organisation details updated')
    res.redirect(`/organisations/${req.params.organisationId}`)
  }
}
