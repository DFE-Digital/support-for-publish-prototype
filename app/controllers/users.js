const organisationModel = require('../models/organisations')
const userModel = require('../models/users')

const organisationHelper = require('../helpers/organisations')
const paginationHelper = require('../helpers/pagination')

exports.list = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  let users = userModel.findMany({})

  users.sort((a, b) => {
    if (a.name) {
      return a.name.localeCompare(b.name)
    }
  })

  // Get the pagination data
  let pagination = paginationHelper.getPagination(users, req.query.page)

  // Get a slice of the data to display
  users = paginationHelper.getDataByPage(users, pagination.pageNumber)

  res.render('../views/organisations/users/list', {
    organisation,
    users,
    pagination,
    actions: {
      details: `/organisations/${req.params.organisationId}`,
      users: `/organisations/${req.params.organisationId}/users`,
      courses: `/organisations/${req.params.organisationId}/courses`,
      locations: `/organisations/${req.params.organisationId}/locations`,
      new: `/organisations/${req.params.organisationId}/users/new`,
      view: `/organisations/${req.params.organisationId}/users`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// SHOW USER
/// ------------------------------------------------------------------------ ///

exports.show = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const user = userModel.findOne({ userId: req.params.userId })

  res.render('../views/organisations/users/show', {
    organisation,
    user,
    actions: {
      back: `/organisations/${req.params.organisationId}/users`,
      change: `/organisations/${req.params.organisationId}/users/${req.params.userId}/edit`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// EDIT USER
/// ------------------------------------------------------------------------ ///

exports.edit_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const user = userModel.findOne({ userId: req.params.userId })

  res.render('../views/organisations/users/edit', {
    organisation,
    user,
    actions: {
      save: `/organisations/${req.params.organisationId}/users/${req.params.userId}/edit`,
      back: `/organisations/${req.params.organisationId}/users`,
      cancel: `/organisations/${req.params.organisationId}/users`
    }
  })
}

exports.edit_post = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  let user = userModel.findOne({ userId: req.params.userId })
  user = req.session.data.user

  const errors = []

  if (errors.length) {
    res.render('../views/organisations/users/edit', {
      organisation,
      user,
      actions: {
        save: `/organisations/${req.params.organisationId}/users/${req.params.userId}/edit`,
        back: `/organisations/${req.params.organisationId}/users`,
        cancel: `/organisations/${req.params.organisationId}/users`
      },
      errors
    })
  } else {
    userModel.updateOne({
      organisationId: req.params.organisationId,
      userId: req.params.userId,
      user: req.session.data.user
    })

    req.flash('success', 'User details updated')
    res.redirect(`/organisations/${req.params.organisationId}/users/${req.params.userId}`)
  }
}

/// ------------------------------------------------------------------------ ///
/// ADD USER
/// ------------------------------------------------------------------------ ///
