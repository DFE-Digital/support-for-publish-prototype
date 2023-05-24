const organisationModel = require('../models/organisations')
const schoolModel = require('../models/schools')
const studySiteModel = require('../models/study-sites')

const paginationHelper = require('../helpers/pagination')
const validationHelper = require("../helpers/validators")

exports.list = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  let studySites = studySiteModel.findMany({ organisationId: req.params.organisationId })

  delete req.session.data.school
  delete req.session.data.studySite
  delete req.session.data.studySites

  studySites.sort((a, b) => {
    if (a.name) {
      return a.name.localeCompare(b.name)
    }
  })

  // Get the pagination data
  const pagination = paginationHelper.getPagination(studySites, req.query.page)

  // Get a slice of the data to display
  studySites = paginationHelper.getDataByPage(studySites, pagination.pageNumber)

  res.render('../views/organisations/study-sites/list', {
    organisation,
    studySites,
    pagination,
    actions: {
      details: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}`,
      users: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users`,
      courses: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/courses`,
      locations: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`,
      studySites: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites`,
      accreditedProviders: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers`,
      new: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites/new`,
      view: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// SHOW LOCATION
/// ------------------------------------------------------------------------ ///

exports.show = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const studySite = studySiteModel.findOne({
    organisationId: req.params.organisationId,
    studySiteId: req.params.studySiteId
  })

  res.render('../views/organisations/study-sites/show', {
    organisation,
    studySite,
    actions: {
      back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites`,
      change: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites/${req.params.studySiteId}/edit`,
      delete: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites/${req.params.studySiteId}/delete`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// NEW LOCATION
/// ------------------------------------------------------------------------ ///

exports.new_find_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  res.render("../views/organisations/study-sites/find", {
    organisation,
    school: req.session.data.school,
    actions: {
      save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites/new`,
      edit: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites/new/edit`,
      back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites`,
      cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites`,
    },
  })
}

exports.new_find_post = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  const errors = []

  if (!req.session.data.school.length) {
    const error = {}
    error.fieldName = 'school'
    error.href = '#school'
    error.text = 'Enter a school, university, college, URN or postcode'
    errors.push(error)
  }

  if (errors.length) {
    res.render("../views/organisations/study-sites/find", {
      organisation,
      school: req.session.data.school,
      actions: {
        save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites/new`,
        edit: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites/new/edit`,
        back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites`,
        cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites`,
      },
      errors,
    })
  } else {
    res.redirect(
      `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites/new/edit`
    )
  }
}

exports.new_edit_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  let studySite = {}
  if (req.session.data.studySite) {
    studySite = req.session.data.studySite
  } else {
   studySite = schoolModel.findOne({ name: req.session.data.school })
  }

  let back = `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites/new`
  if (req.query.referrer === 'check') {
    back = `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites/new/check`
  }

  res.render('../views/organisations/study-sites/edit', {
    organisation,
    studySite,
    actions: {
      save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites/new/edit`,
      back,
      cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites`
    }
  })
}

exports.new_edit_post = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const studySite = req.session.data.studySite

  const errors = []

  if (!req.session.data.studySite.name.length) {
    const error = {}
    error.fieldName = "study-site-name"
    error.href = "#study-site-name"
    error.text = "Enter a study site name"
    errors.push(error)
  }

  if (!req.session.data.studySite.address.addressLine1.length) {
    const error = {}
    error.fieldName = "address-line-1"
    error.href = "#address-line-1"
    error.text = "Enter address line 1"
    errors.push(error)
  }

  if (!req.session.data.studySite.address.town.length) {
    const error = {}
    error.fieldName = "address-town"
    error.href = "#address-town"
    error.text = "Enter a town or city"
    errors.push(error)
  }

  if (!req.session.data.studySite.address.postcode.length) {
    const error = {}
    error.fieldName = "address-postcode"
    error.href = "#address-postcode"
    error.text = "Enter a postcode"
    errors.push(error)
  } else if (
    !validationHelper.isValidPostcode(
      req.session.data.studySite.address.postcode
    )
  ) {
    const error = {}
    error.fieldName = "address-postcode"
    error.href = "#address-postcode"
    error.text = "Enter a real postcode"
    errors.push(error)
  }

  if (errors.length) {
    res.render('../views/organisations/study-sites/edit', {
      organisation,
      studySite,
      actions: {
        save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites/new/edit`,
        back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites/new`,
        cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites`
      },
      errors
    })
  } else {
    res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites/new/check`)
  }
}

exports.new_check_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const studySite = req.session.data.studySite

  res.render('../views/organisations/study-sites/check', {
    organisation,
    studySite,
    actions: {
      save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites/new/check`,
      back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites/new/edit`,
      change: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites/new/edit`,
      cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites`
    }
  })
}

exports.new_check_post = (req, res) => {
  studySiteModel.insertOne({
    organisationId: req.params.organisationId,
    studySite: req.session.data.studySite
  })

  delete req.session.data.studySite
  delete req.session.data.school

  req.flash('success', 'Study site added')
  res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites`)
}

/// ------------------------------------------------------------------------ ///
/// EDIT LOCATION
/// ------------------------------------------------------------------------ ///

exports.edit_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const studySite = studySiteModel.findOne({
    organisationId: req.params.organisationId,
    studySiteId: req.params.studySiteId
  })

  res.render('../views/organisations/study-sites/edit', {
    organisation,
    studySite,
    currentstudySite: studySite,
    actions: {
      save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites/${req.params.studySiteId}/edit`,
      back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites`,
      cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites/${req.params.studySiteId}`
    }
  })
}

exports.edit_post = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  let studySite = studySiteModel.findOne({
    organisationId: req.params.organisationId,
    studySiteId: req.params.studySiteId
  })

  studySite = {...studySite, ...req.session.data.studySite}

  const currentStudySite = studySiteModel.findOne({
    organisationId: req.params.organisationId,
    studySiteId: req.params.studySiteId
  })

  const errors = []

  if (!req.session.data.studySite.name.length) {
    const error = {}
    error.fieldName = "study-site-name"
    error.href = "#study-site-name"
    error.text = "Enter a study site name"
    errors.push(error)
  }

  if (!req.session.data.studySite.address.addressLine1.length) {
    const error = {}
    error.fieldName = "address-line-1"
    error.href = "#address-line-1"
    error.text = "Enter address line 1"
    errors.push(error)
  }

  if (!req.session.data.studySite.address.town.length) {
    const error = {}
    error.fieldName = "address-town"
    error.href = "#address-town"
    error.text = "Enter a town or city"
    errors.push(error)
  }

  if (!req.session.data.studySite.address.postcode.length) {
    const error = {}
    error.fieldName = "address-postcode"
    error.href = "#address-postcode"
    error.text = "Enter a postcode"
    errors.push(error)
  } else if (
    !validationHelper.isValidPostcode(
      req.session.data.studySite.address.postcode
    )
  ) {
    const error = {}
    error.fieldName = "address-postcode"
    error.href = "#address-postcode"
    error.text = "Enter a real postcode"
    errors.push(error)
  }

  if (errors.length) {
    res.render('../views/organisations/study-sites/edit', {
      organisation,
      studySite,
      currentStudySite,
      actions: {
        save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites/${req.params.studySiteId}/edit`,
        back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites`,
        cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites/${req.params.studySiteId}`
      },
      errors
    })
  } else {
    studySiteModel.updateOne({
      organisationId: req.params.organisationId,
      studySiteId: req.params.studySiteId,
      studySite: req.session.data.studySite
    })

    delete req.session.data.studySite

    req.flash('success', 'Study site updated')
    res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites/${req.params.studySiteId}`)
  }
}

/// ------------------------------------------------------------------------ ///
/// DELETE LOCATION
/// ------------------------------------------------------------------------ ///

exports.delete_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const studySite = studySiteModel.findOne({
    organisationId: req.params.organisationId,
    studySiteId: req.params.studySiteId
  })

  res.render('../views/organisations/study-sites/delete', {
    organisation,
    studySite,
    actions: {
      save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites/${req.params.studySiteId}/delete`,
      back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites/${req.params.studySiteId}`,
      cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites/${req.params.studySiteId}`
    }
  })
}

exports.delete_post = (req, res) => {
  studySiteModel.deleteOne({
    organisationId: req.params.organisationId,
    studySiteId: req.params.studySiteId
  })

  req.flash('success', 'Study site removed')
  res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites`)
}

/// ------------------------------------------------------------------------ ///
/// SCHOOL SUGGESTIONS FOR AUTOCOMPLETE
/// ------------------------------------------------------------------------ ///

exports.study_site_suggestions_json = (req, res) => {
  req.headers['Access-Control-Allow-Origin'] = true

  let schools
  schools = schoolModel.findMany(req.query)

  schools.sort((a, b) => {
    return a.name.localeCompare(b.name)
  })

  res.json(schools)
}
