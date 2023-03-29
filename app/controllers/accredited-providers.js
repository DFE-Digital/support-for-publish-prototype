const organisationModel = require('../models/organisations')
const accreditedProviderModel = require('../models/accredited-providers')

const validationHelper = require("../helpers/validators")

exports.list = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  organisation.accreditedBodies.sort((a,b)=> {
    return a.name.localeCompare(b.name)
  })

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
/// VIEW ACCREDITED PROVIDER
/// ------------------------------------------------------------------------ //



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
