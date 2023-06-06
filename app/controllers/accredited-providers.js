const organisationModel = require('../models/organisations')
const accreditedProviderModel = require('../models/accredited-providers')
const courseModel = require('../models/courses')

const organisationHelper = require("../helpers/organisations")
const validationHelper = require("../helpers/validators")

exports.list = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  if (organisation.accreditedBodies) {
    organisation.accreditedBodies.sort((a,b)=> {
      return a.name.localeCompare(b.name)
    })
  }

  // clear out the session
  delete req.session.data.accreditedProvider

  res.render('../views/organisations/accredited-providers/list', {
    organisation,
    actions: {
      details: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}`,
      users: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users`,
      courses: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/courses`,
      locations: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`,
      studySites: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites`,
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
    error.text = `Details about the accredited provider must be ${wordCount} words or fewer`
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

    req.flash('success', 'About the accredited provider updated')
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
    const accreditedProviders = organisationModel.findMany({
      isAccreditedBody: true,
      query: req.session.data.accreditedProvider.name
    })

    req.session.data.accreditedProvider.id = accreditedProviders[0].id
    req.session.data.accreditedProvider.code = accreditedProviders[0].code
    req.session.data.accreditedProvider.name = accreditedProviders[0].name

    if (req.query.referrer === 'check') {
      res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers/new/check`)
    } else {
      res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers/new/description`)
    }
  }
}

exports.new_accredited_provider_choose_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const providers = organisationModel.findMany({
    isAccreditedBody: true,
    query: req.session.data.accreditedProvider.name
  })

  // store total number of results
  const providerCount = providers.length

  // parse the school results for use in macro
  let providerItems = []
  providers.forEach(provider => {
    const item = {}
    item.text = `${provider.name} (${provider.code})`
    item.value = provider.id
    providerItems.push(item)
  })

  // sort items alphabetically
  providerItems.sort((a,b) => {
    return a.text.localeCompare(b.text)
  })

  // only get the first 15 items
  providerItems = providerItems.slice(0,15)

  res.render("../views/organisations/accredited-providers/choose", {
    organisation,
    providerItems,
    providerCount,
    searchTerm: req.session.data.accreditedProvider.name,
    actions: {
      save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers/new/choose`,
      back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers/new`,
      cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers`
    }
  })
}

exports.new_accredited_provider_choose_post = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  const providers = organisationModel.findMany({
    isAccreditedBody: true,
    query: req.session.data.accreditedProvider.name
  })

  // store total number of results
  const providerCount = providers.length

  let selectedItem
  if (req.session.data.accreditedProvider?.id) {
    selectedItem = req.session.data.accreditedProvider.id
  }

  // parse the school results for use in macro
  let providerItems = []
  providers.forEach(provider => {
    const item = {}
    item.text = `${provider.name} (${provider.code})`
    item.value = provider.id
    item.checked = selectedItem?.includes(provider.id) ? 'checked' : ''
    providerItems.push(item)
  })

  // sort items alphabetically
  providerItems.sort((a,b) => {
    return a.text.localeCompare(b.text)
  })

  // only get the first 15 items
  providerItems = providerItems.slice(0,15)

  const errors = []

  if (!selectedItem) {
    const error = {}
    error.fieldName = 'accredited-provider'
    error.href = '#accredited-provider'
    error.text = 'Select an accredited provider'
    errors.push(error)
  } else if (
    organisationHelper.hasAccreditedProvider(
      req.params.organisationId,
      req.session.data.accreditedProvider.id
    )
  ) {
    const accreditedProviderName = organisationHelper.getOrganisationLabel(
      req.session.data.accreditedProvider.id
    )

    const error = {}
    error.fieldName = 'accredited-provider'
    error.href = '#accredited-provider'
    error.text = `${accreditedProviderName} has already been added`
    errors.push(error)
  }

  if (errors.length) {
    res.render("../views/organisations/accredited-providers/choose", {
      organisation,
      providerItems,
      providerCount,
      searchTerm: req.session.data.accreditedProvider.name,
      actions: {
        save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers/new/choose`,
        back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers/new`,
        cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers`
      },
      errors,
    })
  } else {
    const organisation = organisationModel.findOne({
      organisationId: req.session.data.accreditedProvider.id
    })

    req.session.data.accreditedProvider.id = organisation.id
    req.session.data.accreditedProvider.code = organisation.code
    req.session.data.accreditedProvider.name = organisation.name

    res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers/new/description`)
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
    error.text = `Details about the accredited provider must be ${wordCount} words or fewer`
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
  accreditedProviderModel.deleteOne({
    organisationId: req.params.organisationId,
    accreditedBodyId: req.params.accreditedProviderId
  })

  req.flash('success', 'Accredited provider removed')
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
