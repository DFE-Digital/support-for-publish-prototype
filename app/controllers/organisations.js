// const courseModel = require('../models/courses')
const organisationModel = require('../models/organisations')
const schoolModel = require('../models/schools')

const organisationHelper = require('../helpers/organisations')
const paginationHelper = require('../helpers/pagination')
const utilsHelper = require('../helpers/utils')
const validationHelper = require("../helpers/validators")

exports.list = (req, res) => {
  delete req.session.data.organisation

  // Filters
  const providerType = null
  const keywords = req.session.data.keywords

  const providerTypes = utilsHelper.getCheckboxValues(providerType, req.session.data.filter?.providerType)

  const hasSearch = !!((keywords))
  const hasFilters = !!((providerTypes?.length > 0))

  let selectedFilters = null

  if (hasFilters) {
    selectedFilters = {
      categories: []
    }

    if (providerTypes?.length) {
      selectedFilters.categories.push({
        heading: { text: 'Provider type' },
        items: providerTypes.map((providerType) => {
          return {
            text: organisationHelper.getProviderTypeLabel(providerType),
            href: `/cycles/${req.params.cycleId}/organisations/remove-provider-type-filter/${providerType}`
          }
        })
      })
    }
  }

  let selectedProviderType
  if (req.session.data.filter?.providerType) {
    selectedProviderType = req.session.data.filter.providerType
  }

  const providerTypeItems = organisationHelper.getProviderTypeOptions(selectedProviderType)

  // Data
  let organisations = organisationModel.findMany({ providerTypes, keywords })

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
    pagination,
    providerTypeItems,
    selectedFilters,
    hasFilters,
    hasSearch,
    keywords,
    actions: {
      view: `/cycles/${req.params.cycleId}/organisations`,
      new: `/cycles/${req.params.cycleId}/organisations/new`,
      filters: {
        apply: `/cycles/${req.params.cycleId}/organisations`,
        remove: `/cycles/${req.params.cycleId}/organisations/remove-all-filters`
      },
      search: {
        find: `/cycles/${req.params.cycleId}/organisations`,
        remove: `/cycles/${req.params.cycleId}/organisations/remove-keyword-search`
      }
    }
  })
}

exports.remove_all_filters_get = (req, res) => {
  delete req.session.data.filter
  res.redirect(`/cycles/${req.params.cycleId}/organisations`)
}

exports.remove_provider_type_filter_get = (req, res) => {
  req.session.data.filter.providerType = utilsHelper.removeFilter(req.params.providerType, req.session.data.filter.providerType)
  res.redirect(`/cycles/${req.params.cycleId}/organisations`)
}

exports.remove_keyword_search_get = (req, res) => {
  delete req.session.data.keywords
  res.redirect(`/cycles/${req.params.cycleId}/organisations`)
}

/// ------------------------------------------------------------------------ ///
/// SHOW ORGANISATION
/// ------------------------------------------------------------------------ ///

exports.show = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  res.render('../views/organisations/show', {
    organisation,
    actions: {
      details: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}`,
      users: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users`,
      courses: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/courses`,
      locations: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`,
      change: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/edit`,
      delete: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/delete`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// EDIT ORGANISATION
/// ------------------------------------------------------------------------ ///

exports.edit_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  let selectedProviderType
  if (organisation.type) {
    selectedProviderType = organisation.type
  }

  const providerTypeItems = organisationHelper.getProviderTypeOptions(selectedProviderType)

  res.render('../views/organisations/edit', {
    organisation,
    currentOrganisation: organisation,
    providerTypeItems,
    actions: {
      save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/edit`,
      back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}`,
      cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}`
    }
  })
}

exports.edit_post = (req, res) => {
  let organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  organisation = req.session.data.organisation

  const currentOrganisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  let selectedProviderType
  if (organisation.type) {
    selectedProviderType = organisation.type
  }

  const providerTypeItems = organisationHelper.getProviderTypeOptions(selectedProviderType)

  const errors = []

  if (!organisation.name.length) {
    const error = {}
    error.fieldName = 'organisation-name'
    error.href = '#organisation-name'
    error.text = 'Enter a provider name'
    errors.push(error)
  }

  if (!organisation.code.length) {
    const error = {}
    error.fieldName = 'organisation-code'
    error.href = '#organisation-code'
    error.text = 'Enter a provider code'
    errors.push(error)
  } else if (
    !validationHelper.isValidProviderCode(
      organisation.code
    )
  ) {
    const error = {}
    error.fieldName = 'organisation-code'
    error.href = '#organisation-code'
    error.text = 'Enter a valid provider code'
    errors.push(error)
  }

  if (!organisation.ukprn.length) {
    const error = {}
    error.fieldName = 'organisation-ukprn'
    error.href = '#organisation-ukprn'
    error.text = 'Enter a UK provider reference number (UKPRN)'
    errors.push(error)
  } else if (
    !validationHelper.isValidUKPRN(
      organisation.ukprn
    )
  ) {
    const error = {}
    error.fieldName = 'organisation-ukprn'
    error.href = '#organisation-ukprn'
    error.text = 'Enter a valid UK provider reference number (UKPRN)'
    errors.push(error)
  }

  if (!organisation.isAccreditedBody) {
    const error = {}
    error.fieldName = 'organisation-is-accredited-body'
    error.href = '#organisation-is-accredited-body'
    error.text = 'Select if the organisation is an accredited provider'
    errors.push(error)
  } else if (organisation.isAccreditedBody === 'yes') {
    if (!organisation.accreditedProviderId.length) {
      const error = {}
      error.fieldName = 'organisation-accredited-provider-id'
      error.href = '#organisation-accredited-provider-id'
      error.text = 'Enter an accredited provider ID'
      errors.push(error)
    } else if (
      !validationHelper.isValidAccreditedProviderId(
        organisation.accreditedProviderId,
        organisation.type
      )
    ) {
      const error = {}
      error.fieldName = 'organisation-accredited-provider-id'
      error.href = '#organisation-accredited-provider-id'
      error.text = 'Enter a valid accredited provider ID'
      errors.push(error)
    }
  }

  if (!organisation.type) {
    const error = {}
    error.fieldName = 'organisation-type'
    error.href = '#organisation-type'
    error.text = 'Select a provider type'
    errors.push(error)
  } else if (organisation.type === 'lead_school') {
    if (organisation.isAccreditedBody === 'yes') {
      const error = {}
      error.fieldName = 'organisation-type'
      error.href = '#organisation-type'
      error.text = 'Accredited provider cannot be a school'
      errors.push(error)
    } else {
      if (!organisation.urn.length) {
        const error = {}
        error.fieldName = 'organisation-urn'
        error.href = '#organisation-urn'
        error.text = 'Enter a unique reference number (URN)'
        errors.push(error)
      } else if (
        !validationHelper.isValidURN(
          organisation.urn
        )
      ) {
        const error = {}
        error.fieldName = 'organisation-urn'
        error.href = '#organisation-urn'
        error.text = 'Enter a valid unique reference number (URN)'
        errors.push(error)
      }
    }
  }

  if (errors.length) {
    res.render('../views/organisations/edit', {
      organisation,
      currentOrganisation,
      providerTypeItems,
      actions: {
        save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/edit`,
        back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}`,
        cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}`
      },
      errors
    })
  } else {
    if (organisation.isAccreditedBody === 'no') {
      delete organisation.accreditedProviderId
    }

    organisationModel.updateOne({
      organisationId: req.params.organisationId,
      organisation
    })

    req.flash('success', 'Organisation details updated')
    res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}`)
  }
}

exports.edit_contact_details_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  res.render('../views/organisations/contact', {
    organisation,
    currentOrganisation: organisation,
    actions: {
      save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/edit/contact`,
      back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}`,
      cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}`
    }
  })
}

exports.edit_contact_details_post = (req, res) => {
  let organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  organisation = req.session.data.organisation

  const currentOrganisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  const errors = []

  if (!organisation.contact.email.length) {
    const error = {}
    error.fieldName = 'organisation-email'
    error.href = '#organisation-email'
    error.text = 'Enter an email address'
    errors.push(error)
  } else if (
    !validationHelper.isValidEmail(
      organisation.contact.email
    )
  ) {
    const error = {}
    error.fieldName = 'organisation-email'
    error.href = '#organisation-email'
    error.text = 'Enter an email address in the correct format, like name@example.com'
    errors.push(error)
  }

  if (!organisation.contact.telephone.length) {
    const error = {}
    error.fieldName = 'organisation-telephone'
    error.href = '#organisation-telephone'
    error.text = 'Enter a telephone number'
    errors.push(error)
  } else if (
    !validationHelper.isValidTelephone(
      organisation.contact.telephone
    )
  ) {
    const error = {}
    error.fieldName = 'organisation-telephone'
    error.href = '#organisation-telephone'
    error.text = 'Enter a real telephone number'
    errors.push(error)
  }

  if (!organisation.contact.website.length) {
    const error = {}
    error.fieldName = 'organisation-website'
    error.href = '#organisation-website'
    error.text = 'Enter a website'
    errors.push(error)
  } else if (
    !validationHelper.isValidURL(
      organisation.contact.website
    )
  ) {
    const error = {}
    error.fieldName = 'organisation-website'
    error.href = '#organisation-website'
    error.text = 'Enter a website address in the correct format, like https://www.example.com'
    errors.push(error)
  }

  if (!organisation.address.addressLine1.length) {
    const error = {}
    error.fieldName = "address-line-1"
    error.href = "#address-line-1"
    error.text = "Enter address line 1"
    errors.push(error)
  }

  if (!organisation.address.town.length) {
    const error = {}
    error.fieldName = "address-town"
    error.href = "#address-town"
    error.text = "Enter a town or city"
    errors.push(error)
  }

  if (!organisation.address.postcode.length) {
    const error = {}
    error.fieldName = "address-postcode"
    error.href = "#address-postcode"
    error.text = "Enter postcode"
    errors.push(error)
  } else if (
    !validationHelper.isValidPostcode(
      organisation.address.postcode
    )
  ) {
    const error = {}
    error.fieldName = "address-postcode"
    error.href = "#address-postcode"
    error.text = "Enter a real postcode"
    errors.push(error)
  }

  if (errors.length) {
    res.render('../views/organisations/contact', {
      organisation,
      currentOrganisation,
      actions: {
        save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/edit/contact`,
        back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}`,
        cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}`
      },
      errors
    })
  } else {
    organisationModel.updateOne({
      organisationId: req.params.organisationId,
      organisation
    })

    req.flash('success', 'Contact details updated')
    res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}`)
  }
}

/// ------------------------------------------------------------------------ ///
/// ADD ORGANISATION
/// ------------------------------------------------------------------------ ///

exports.new_get = (req, res) => {
  let save = `/cycles/${req.params.cycleId}/organisations/new`
  let back = `/cycles/${req.params.cycleId}/organisations`

  if (req.query.referrer === 'check') {
    save += '?referrer=check'
    back = `/cycles/${req.params.cycleId}/organisations/new/check`
  }

  let selectedProviderType
  if (req.session.data?.organisation?.type) {
    selectedProviderType = req.session.data.organisation.type
  }

  const providerTypeItems = organisationHelper.getProviderTypeOptions(selectedProviderType)

  res.render('../views/organisations/edit', {
    organisation: req.session.data.organisation,
    providerTypeItems,
    actions: {
      save,
      back,
      cancel: `/cycles/${req.params.cycleId}/organisations`
    }
  })
}

exports.new_post = (req, res) => {
  let save = `/cycles/${req.params.cycleId}/organisations/new`
  let back = `/cycles/${req.params.cycleId}/organisations`

  if (req.query.referrer === 'check') {
    save += '?referrer=check'
    back = `/cycles/${req.params.cycleId}/organisations/new/check`
  }

  let selectedProviderType
  if (req.session.data?.organisation?.type) {
    selectedProviderType = req.session.data.organisation.type
  }

  const providerTypeItems = organisationHelper.getProviderTypeOptions(selectedProviderType)

  const errors = []

  if (!req.session.data.organisation.name.length) {
    const error = {}
    error.fieldName = 'organisation-name'
    error.href = '#organisation-name'
    error.text = 'Enter a provider name'
    errors.push(error)
  }

  if (!req.session.data.organisation.code.length) {
    const error = {}
    error.fieldName = 'organisation-code'
    error.href = '#organisation-code'
    error.text = 'Enter a provider code'
    errors.push(error)
  } else {
    if (
      !validationHelper.isValidProviderCode(
        req.session.data.organisation.code
      )
    ) {
      const error = {}
      error.fieldName = 'organisation-code'
      error.href = '#organisation-code'
      error.text = 'Enter a valid provider code'
      errors.push(error)
    } else if (
      organisationHelper.existsProviderCode(
        req.session.data.organisation.code
      )
    ) {
      const error = {}
      error.fieldName = 'organisation-code'
      error.href = '#organisation-code'
      error.text = 'Provider code already in use'
      errors.push(error)
    }
  }

  if (!req.session.data.organisation.ukprn.length) {
    const error = {}
    error.fieldName = 'organisation-ukprn'
    error.href = '#organisation-ukprn'
    error.text = 'Enter a UK provider reference number (UKPRN)'
    errors.push(error)
  } else if (
    !validationHelper.isValidUKPRN(
      req.session.data.organisation.ukprn
    )
  ) {
    const error = {}
    error.fieldName = 'organisation-ukprn'
    error.href = '#organisation-ukprn'
    error.text = 'Enter a valid UK provider reference number (UKPRN)'
    errors.push(error)
  }

  if (!req.session.data.organisation.isAccreditedBody) {
    const error = {}
    error.fieldName = 'organisation-is-accredited-body'
    error.href = '#organisation-is-accredited-body'
    error.text = 'Select if the organisation is an accredited provider'
    errors.push(error)
  } else if (req.session.data.organisation.isAccreditedBody === 'yes') {
    if (!req.session.data.organisation.accreditedProviderId.length) {
      const error = {}
      error.fieldName = 'organisation-accredited-provider-id'
      error.href = '#organisation-accredited-provider-id'
      error.text = 'Enter an accredited provider ID'
      errors.push(error)
    } else if (
      !validationHelper.isValidAccreditedProviderId(
        req.session.data.organisation.accreditedProviderId,
        req.session.data.organisation.type
      )
    ) {
      const error = {}
      error.fieldName = 'organisation-accredited-provider-id'
      error.href = '#organisation-accredited-provider-id'
      error.text = 'Enter a valid accredited provider ID'
      errors.push(error)
    }
  }

  if (!req.session.data.organisation.type) {
    const error = {}
    error.fieldName = 'organisation-type'
    error.href = '#organisation-type'
    error.text = 'Select a provider type'
    errors.push(error)
  } else if (req.session.data.organisation.type === 'lead_school') {
    if (req.session.data.organisation.isAccreditedBody === 'yes') {
      const error = {}
      error.fieldName = 'organisation-type'
      error.href = '#organisation-type'
      error.text = 'Accredited provider cannot be a school'
      errors.push(error)
    } else {
      if (!req.session.data.organisation.urn.length) {
        const error = {}
        error.fieldName = 'organisation-urn'
        error.href = '#organisation-urn'
        error.text = 'Enter a unique reference number (URN)'
        errors.push(error)
      } else if (
        !validationHelper.isValidURN(
          req.session.data.organisation.urn
        )
      ) {
        const error = {}
        error.fieldName = 'organisation-urn'
        error.href = '#organisation-urn'
        error.text = 'Enter a valid unique reference number (URN)'
        errors.push(error)
      }
    }
  }

  if (errors.length) {
    res.render('../views/organisations/edit', {
      organisation: req.session.data.organisation,
      providerTypeItems,
      actions: {
        save,
        back,
        cancel: `/cycles/${req.params.cycleId}/organisations`
      },
      errors
    })
  } else {
    if (req.query.referrer === 'check') {
      res.redirect(`/cycles/${req.params.cycleId}/organisations/new/check`)
    } else {
      res.redirect(`/cycles/${req.params.cycleId}/organisations/new/contact`)
    }
  }
}

exports.new_contact_details_get = (req, res) => {
  let school = {}

  if (req.session.data.organisation?.urn.length) {
    school = schoolModel.findOne({
      urn: req.session.data.organisation.urn
    })

    if (!req.session.data.organisation.address) {
      if (school?.address) {
        req.session.data.organisation.address = school.address
      }
    }

    if (!req.session.data.organisation.contact) {
      if (school?.contact) {
        req.session.data.organisation.contact = school.contact
      }
    }
  }

  let save = `/cycles/${req.params.cycleId}/organisations/new/contact`
  let back = `/cycles/${req.params.cycleId}/organisations/new`

  if (req.query.referrer === 'check') {
    save += '?referrer=check'
    back = `/cycles/${req.params.cycleId}/organisations/new/check`
  }

  res.render('../views/organisations/contact', {
    organisation: req.session.data.organisation,
    actions: {
      save,
      back,
      cancel: `/cycles/${req.params.cycleId}/organisations`
    }
  })
}

exports.new_contact_details_post = (req, res) => {
  let save = `/cycles/${req.params.cycleId}/organisations/new/contact`
  let back = `/cycles/${req.params.cycleId}/organisations/new`

  if (req.query.referrer === 'check') {
    save += '?referrer=check'
    back = `/cycles/${req.params.cycleId}/organisations/new/check`
  }

  const errors = []

  if (!req.session.data.organisation.contact.email.length) {
    const error = {}
    error.fieldName = 'organisation-email'
    error.href = '#organisation-email'
    error.text = 'Enter an email address'
    errors.push(error)
  } else if (
    !validationHelper.isValidEmail(
      req.session.data.organisation.contact.email
    )
  ) {
    const error = {}
    error.fieldName = 'organisation-email'
    error.href = '#organisation-email'
    error.text = 'Enter an email address in the correct format, like name@example.com'
    errors.push(error)
  }

  if (!req.session.data.organisation.contact.telephone.length) {
    const error = {}
    error.fieldName = 'organisation-telephone'
    error.href = '#organisation-telephone'
    error.text = 'Enter a telephone number'
    errors.push(error)
  } else if (
    !validationHelper.isValidTelephone(
      req.session.data.organisation.contact.telephone
    )
  ) {
    const error = {}
    error.fieldName = 'organisation-telephone'
    error.href = '#organisation-telephone'
    error.text = 'Enter a real telephone number'
    errors.push(error)
  }

  if (!req.session.data.organisation.contact.website.length) {
    const error = {}
    error.fieldName = 'organisation-website'
    error.href = '#organisation-website'
    error.text = 'Enter a website'
    errors.push(error)
  } else if (
    !validationHelper.isValidURL(
      req.session.data.organisation.contact.website
    )
  ) {
    const error = {}
    error.fieldName = 'organisation-website'
    error.href = '#organisation-website'
    error.text = 'Enter a website address in the correct format, like https://www.example.com'
    errors.push(error)
  }

  if (!req.session.data.organisation.address.addressLine1.length) {
    const error = {}
    error.fieldName = "address-line-1"
    error.href = "#address-line-1"
    error.text = "Enter address line 1"
    errors.push(error)
  }

  if (!req.session.data.organisation.address.town.length) {
    const error = {}
    error.fieldName = "address-town"
    error.href = "#address-town"
    error.text = "Enter a town or city"
    errors.push(error)
  }

  if (!req.session.data.organisation.address.postcode.length) {
    const error = {}
    error.fieldName = "address-postcode"
    error.href = "#address-postcode"
    error.text = "Enter postcode"
    errors.push(error)
  } else if (
    !validationHelper.isValidPostcode(
      req.session.data.organisation.address.postcode
    )
  ) {
    const error = {}
    error.fieldName = "address-postcode"
    error.href = "#address-postcode"
    error.text = "Enter a real postcode"
    errors.push(error)
  }

  if (errors.length) {
    res.render('../views/organisations/contact', {
      organisation: req.session.data.organisation,
      actions: {
        save,
        back,
        cancel: `/cycles/${req.params.cycleId}/organisations`
      },
      errors
    })
  } else {
    res.redirect(`/cycles/${req.params.cycleId}/organisations/new/check`)
  }
}

exports.new_check_get = (req, res) => {
  if (req.session.data.organisation.isAccreditedBody === 'no') {
    delete req.session.data.organisation.accreditedProviderId
  }

  if (req.session.data.organisation.type !== 'lead_school') {
    delete req.session.data.organisation.urn
  }

  res.render('../views/organisations/check', {
    organisation: req.session.data.organisation,
    actions: {
      save: `/cycles/${req.params.cycleId}/organisations/new/check`,
      back: `/cycles/${req.params.cycleId}/organisations/new/contact`,
      cancel: `/cycles/${req.params.cycleId}/organisations`,
      change: `/cycles/${req.params.cycleId}/organisations/new`
    }
  })
}

exports.new_check_post = (req, res) => {
  const organisation = organisationModel.insertOne({
    organisation: req.session.data.organisation
  })

  delete req.session.data.organisation

  req.flash('success', 'Organisation added')
  res.redirect(`/cycles/${req.params.cycleId}/organisations/${organisation.id}`)
}

/// ------------------------------------------------------------------------ ///
/// DELETE LOCATION
/// ------------------------------------------------------------------------ ///

exports.delete_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  res.render('../views/organisations/delete', {
    organisation,
    actions: {
      save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/delete`,
      back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}`,
      cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}`
    }
  })
}

exports.delete_post = (req, res) => {
  organisationModel.deleteOne({
    organisationId: req.params.organisationId
  })

  req.flash('success', 'Organisation removed')
  res.redirect(`/cycles/${req.params.cycleId}/organisations`)
}
