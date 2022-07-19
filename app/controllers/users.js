const organisationModel = require('../models/organisations')
const userModel = require('../models/users')

const organisationHelper = require('../helpers/organisations')
const paginationHelper = require('../helpers/pagination')
const validationHelper = require('../helpers/validators')

exports.list = (req, res) => {
  delete req.session.data.user

  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  let users = userModel.findMany({ organisationId: req.params.organisationId })

  users.sort((a, b) => {
    return a.firstName.localeCompare(b.firstName) || a.lastName.localeCompare(b.lastName)
  })

  // Get the pagination data
  const pagination = paginationHelper.getPagination(users, req.query.page)

  // Get a slice of the data to display
  users = paginationHelper.getDataByPage(users, pagination.pageNumber)

  res.render('../views/organisations/users/list', {
    organisation,
    users,
    pagination,
    actions: {
      details: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}`,
      users: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users`,
      courses: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/courses`,
      locations: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`,
      new: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users/new`,
      view: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// SHOW USER
/// ------------------------------------------------------------------------ ///

exports.show = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const user = userModel.findOne({ userId: req.params.userId })

  const signedInUser = userModel.findOne({ userId: req.session.passport.user.id })

  res.render('../views/organisations/users/show', {
    organisation,
    user,
    signedInUser,
    actions: {
      back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users`,
      change: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users/${req.params.userId}/edit`,
      delete: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users/${req.params.userId}/delete`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// NEW USER
/// ------------------------------------------------------------------------ ///

exports.new_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  let back = `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users`
  if (req.query.referrer === 'check') {
    back = `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users/new/check`
  }

  res.render('../views/organisations/users/edit', {
    organisation,
    user: req.session.data.user,
    actions: {
      save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users/new`,
      back,
      cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users`
    }
  })
}

exports.new_post = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  const errors = []

  if (!req.session.data.user.firstName.length) {
    const error = {}
    error.fieldName = 'firstName'
    error.href = '#firstName'
    error.text = 'Enter a first name'
    errors.push(error)
  }

  if (!req.session.data.user.lastName.length) {
    const error = {}
    error.fieldName = 'lastName'
    error.href = '#lastName'
    error.text = 'Enter a last name'
    errors.push(error)
  }

  const user = userModel.findOne({
    organisationId: req.params.organisationId,
    email: req.session.data.user.email
  })

  if (!req.session.data.user.email.length) {
    const error = {}
    error.fieldName = 'email'
    error.href = '#email'
    error.text = 'Enter an email address'
    errors.push(error)
  } else if (!validationHelper.isValidEmail(req.session.data.user.email)) {
    const error = {}
    error.fieldName = 'email'
    error.href = '#email'
    error.text = 'Enter an email address in the correct format, like name@example.com'
    errors.push(error)
  } else if (user) {
    const error = {}
    error.fieldName = 'email'
    error.href = '#email'
    error.text = 'Email address already in use'
    errors.push(error)
  }

  if (errors.length) {
    res.render('../views/organisations/users/edit', {
      organisation,
      user: req.session.data.user,
      actions: {
        save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users/new`,
        back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users`,
        cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users`
      },
      errors
    })
  } else {
    res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users/new/check`)
  }
}

exports.new_check_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  res.render('../views/organisations/users/check', {
    organisation,
    user: req.session.data.user,
    actions: {
      save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users/new/check`,
      back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users/new`,
      change: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users/new`,
      cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users`
    }
  })
}

exports.new_check_post = (req, res) => {
  userModel.saveOne({
    organisationId: req.params.organisationId,
    user: req.session.data.user
  })

  delete req.session.data.user

  req.flash('success', 'User added')
  res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users`)
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
      save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users/${req.params.userId}/edit`,
      back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users`,
      cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users`
    }
  })
}

exports.edit_post = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const user = userModel.findOne({ userId: req.params.userId })

  const errors = []

  if (!req.session.data.user.firstName.length) {
    const error = {}
    error.fieldName = 'firstName'
    error.href = '#firstName'
    error.text = 'Enter a first name'
    errors.push(error)
  }

  if (!req.session.data.user.lastName.length) {
    const error = {}
    error.fieldName = 'lastName'
    error.href = '#lastName'
    error.text = 'Enter a last name'
    errors.push(error)
  }

  const userExists = userModel.findOne({
    organisationId: req.params.organisationId,
    email: req.session.data.user.email
  })

  if (!req.session.data.user.email.length) {
    const error = {}
    error.fieldName = 'email'
    error.href = '#email'
    error.text = 'Enter an email address'
    errors.push(error)
  } else if (!validationHelper.isValidEmail(req.session.data.user.email)) {
    const error = {}
    error.fieldName = 'email'
    error.href = '#email'
    error.text = 'Enter an email address in the correct format, like name@example.com'
    errors.push(error)
  } else if (userExists) {
    const error = {}
    error.fieldName = 'email'
    error.href = '#email'
    error.text = 'Email address already in use'
    errors.push(error)
  }

  if (errors.length) {
    res.render('../views/organisations/users/edit', {
      organisation,
      user,
      actions: {
        save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users/${req.params.userId}/edit`,
        back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users`,
        cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users`
      },
      errors
    })
  } else {
    userModel.saveOne({
      organisationId: req.params.organisationId,
      userId: req.params.userId,
      user: req.session.data.user
    })

    delete req.session.data.user

    req.flash('success', 'User updated')
    res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users/${req.params.userId}`)
  }
}

/// ------------------------------------------------------------------------ ///
/// DELETE USER
/// ------------------------------------------------------------------------ ///

exports.delete_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const user = userModel.findOne({ userId: req.params.userId })

  res.render('../views/organisations/users/delete', {
    organisation,
    user,
    actions: {
      save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users/${req.params.userId}/delete`,
      back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users/${req.params.userId}`,
      cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users/${req.params.userId}`
    }
  })
}

exports.delete_post = (req, res) => {
  userModel.deleteOne({
    organisationId: req.params.organisationId,
    userId: req.params.userId
  })

  req.flash('success', 'User removed')
  res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users`)
}
