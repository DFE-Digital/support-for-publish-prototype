const organisationModel = require('../models/organisations')
const accreditedProviderModel = require('../models/accredited-providers')
const courseModel = require('../models/courses')

const organisationHelper = require("../helpers/organisations")
const validationHelper = require("../helpers/validators")

exports.list = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  organisation.accreditedBodies.sort((a,b)=> {
    return a.name.localeCompare(b.name)
  })

  // clear out the session
  delete req.session.data.accreditedProvider

  res.render('../views/organisations/accredited-providers/list', {
    organisation,
    actions: {
      details: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}`,
      users: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users`,
      courses: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/courses`,
      locations: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`,
      accreditedProviders: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers`,
      new: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers/new`,
      change: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// EDIT ACCREDITED PROVIDER
/// ------------------------------------------------------------------------ //

exports.edit_description_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const accreditedProvider = organisation.accreditedBodies.find(accreditedBody => accreditedBody.id === req.params.accreditedProviderId)

  const wordCount = 100

  res.render('../views/organisations/accredited-providers/description', {
    organisation,
    accreditedProvider,
    wordCount,
    actions: {
      save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers/${req.params.accreditedProviderId}/description?referrer=change`,
      back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers`,
      cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers`
    }
  })
}

exports.edit_description_post = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const accreditedProvider = organisation.accreditedBodies.find(accreditedBody => accreditedBody.id === req.params.accreditedProviderId)
  accreditedProvider.description = req.session.data.accreditedProvider.description

  const wordCount = 100

  const errors = []

  if (!accreditedProvider.description.length) {
    const error = {}
    error.fieldName = 'accredited-provider-description'
    error.href = '#accredited-provider-description'
    error.text = 'Enter details about the accredited provider'
    errors.push(error)
  } else if (
    !validationHelper.isValidWordCount(accreditedProvider.description, wordCount)
  ) {
    const error = {}
    error.fieldName = 'accredited-provider-description'
    error.href = '#accredited-provider-description'
    error.text = `Description about the accredited provider must be ${wordCount} words or fewer`
    errors.push(error)
  }

  if (errors.length) {
    res.render('../views/organisations/accredited-providers/description', {
      organisation,
      accreditedProvider,
      wordCount,
      actions: {
        save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers/${req.params.accreditedProviderId}/description?referrer=change`,
        back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers`,
        cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers`
      },
      errors
    })
  } else {
    accreditedProviderModel.updateOne({
      organisationId: req.params.organisationId,
      accreditedBodyId: req.params.accreditedProviderId,
      accreditedBody: accreditedProvider
    })

    req.flash('success', 'Accredited provider description updated')
    res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers`)
  }
}

/// ------------------------------------------------------------------------ ///
/// NEW ACCREDITED PROVIDER
/// ------------------------------------------------------------------------ //

exports.new_accredited_provider_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const accreditedProvider = req.session.data.accreditedProvider

  let save = `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers/new`
  let back = `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers`
  if (req.query.referrer === 'check') {
    save += '?referrer=check'
    back = `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers/new/check`
  }

  res.render('../views/organisations/accredited-providers/new', {
    organisation,
    accreditedProvider,
    actions: {
      save,
      back,
      cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers`
    }
  })
}

exports.new_accredited_provider_post = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const accreditedProvider = req.session.data.accreditedProvider

  let save = `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers/new`
  let back = `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers`
  if (req.query.referrer === 'check') {
    save += '?referrer=check'
    back = `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers/new/check`
  }

  const errors = []

  if (!req.session.data.accreditedProvider.name.length) {
    const error = {}
    error.fieldName = 'accredited-provider'
    error.href = '#accredited-provider'
    error.text = 'Enter a provider name, UKPRN or postcode'
    errors.push(error)
  } else if (
    organisationHelper.hasAccreditedProvider(
      req.params.organisationId,
      req.session.data.accreditedProvider.name
    )
  ) {
    const error = {}
    error.fieldName = 'accredited-provider'
    error.href = '#accredited-provider'
    error.text = `${req.session.data.accreditedProvider.name} has already been added`
    errors.push(error)
  }

  if (errors.length) {
    res.render('../views/organisations/accredited-providers/new', {
      organisation,
      accreditedProvider,
      actions: {
        save,
        back,
        cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers`
      },
      errors
    })
  } else {

    // find the accredited provider details
    const accreditedProvider = organisationModel.findMany({
      isAccreditedBody: true,
      query: req.session.data.accreditedProvider.name
    })

    req.session.data.accreditedProvider.id = accreditedProvider[0].id
    req.session.data.accreditedProvider.code = accreditedProvider[0].code
    req.session.data.accreditedProvider.name = accreditedProvider[0].name

    if (req.query.referrer === 'check') {
      res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers/new/check`)
    } else {
      res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers/new/description`)
    }
  }
}

exports.new_accredited_provider_description_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const accreditedProvider = req.session.data.accreditedProvider

  const wordCount = 100

  let back = `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers/new`
  if (req.query.referrer === 'check') {
    back = `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers/new/check`
  }

  res.render('../views/organisations/accredited-providers/description', {
    organisation,
    accreditedProvider,
    wordCount,
    actions: {
      save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers/new/description`,
      back,
      cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers`
    }
  })
}

exports.new_accredited_provider_description_post = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const accreditedProvider = req.session.data.accreditedProvider

  const wordCount = 100

  let back = `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers/new`
  if (req.query.referrer === 'check') {
    back = `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers/new/check`
  }

  const errors = []

  if (!req.session.data.accreditedProvider.description.length) {
    const error = {}
    error.fieldName = 'accredited-provider-description'
    error.href = '#accredited-provider-description'
    error.text = 'Enter details about the accredited provider'
    errors.push(error)
  } else if (
    !validationHelper.isValidWordCount(req.session.data.accreditedProvider.description, wordCount)
  ) {
    const error = {}
    error.fieldName = 'accredited-provider-description'
    error.href = '#accredited-provider-description'
    error.text = `Description about the accredited provider must be ${wordCount} words or fewer`
    errors.push(error)
  }

  if (errors.length) {
    res.render('../views/organisations/accredited-providers/description', {
      organisation,
      accreditedProvider,
      actions: {
        save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers/new/description`,
        back,
        cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers`
      },
      errors
    })
  } else {
    res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers/new/check`)
  }
}

exports.new_accredited_provider_check_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  res.render('../views/organisations/accredited-providers/check', {
    organisation,
    accreditedProvider: req.session.data.accreditedProvider,
    actions: {
      save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers/new/check`,
      back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers/new/description`,
      change: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers/new`,
      cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers`
    }
  })
}

exports.new_accredited_provider_check_post = (req, res) => {
  accreditedProviderModel.insertOne({
    organisationId: req.params.organisationId,
    accreditedBody: req.session.data.accreditedProvider
  })

  req.flash('success', 'Accredited provider added')
  res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers`)
}

/// ------------------------------------------------------------------------ ///
/// DELETE ACCREDITED PROVIDER
/// ------------------------------------------------------------------------ ///

exports.delete_accredited_provider_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const accreditedProvider = organisation.accreditedBodies.find(accreditedBody => accreditedBody.id === req.params.accreditedProviderId)

  const courses = courseModel
    .findMany({ organisationId: req.params.organisationId })
    .filter(course => course.accreditedBody.id === req.params.accreditedProviderId)

  const hasCourses = !!courses.length

  res.render('../views/organisations/accredited-providers/delete', {
    organisation,
    accreditedProvider,
    hasCourses,
    actions: {
      save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers/${req.params.accreditedProviderId}/delete`,
      back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers`,
      cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers`
    }
  })
}

exports.delete_accredited_provider_post = (req, res) => {
  accreditedBodyModel.deleteOne({
    organisationId: req.params.organisationId,
    accreditedBodyId: req.params.accreditedProviderId
  })

  req.flash('success', 'Accredited provider deleted')
  res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers`)
}

/// ------------------------------------------------------------------------ ///
/// ACCREDITED PROVIDER SUGGESTIONS FOR AUTOCOMPLETE
/// ------------------------------------------------------------------------ ///

exports.accredited_provider_suggestions_json = (req, res) => {
  req.headers['Access-Control-Allow-Origin'] = true

  let providers
  providers = organisationModel.findMany({
    isAccreditedBody: true,
    query: req.query.query
  })

  providers.sort((a, b) => {
    return a.name.localeCompare(b.name)
  })

  res.json(providers)
}
