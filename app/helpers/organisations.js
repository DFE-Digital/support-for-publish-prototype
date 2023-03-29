const organisationModel = require('../models/organisations')

const providerTypes = require('../data/provider-types')

exports.getAccreditedBodyOptions = (organisationId, selectedItem) => {
  const items = []

  const organisation = organisationModel.findOne({ organisationId })

  organisation.accreditedBodies.forEach((accreditedBody, i) => {
    const item = {}

    item.text = accreditedBody.name
    item.value = accreditedBody.id
    item.id = accreditedBody.id
    item.checked = (selectedItem && selectedItem.includes(accreditedBody.id)) ? 'checked' : ''

    items.push(item)
  })

  items.sort((a, b) => {
    return a.text.localeCompare(b.text)
  })

  return items
}

exports.getAccreditedBodySelectOptions = (selectedItem) => {
  const items = []

  const organisations = organisationModel.findMany({ isAccreditedBody: true })

  organisations.forEach((organisation, i) => {
    const item = {}

    item.text = organisation.name
    item.value = organisation.id
    item.id = organisation.id
    item.selected = (selectedItem && selectedItem.includes(organisation.id)) ? 'selected' : ''

    items.push(item)
  })

  items.sort((a, b) => {
    return a.text.localeCompare(b.text)
  })

  return items
}

exports.getAccreditedBodyAutocompleteOptions = (selectedItem) => {
  const items = []

  const organisations = organisationModel.findMany({ isAccreditedBody: true })

  organisations.forEach((organisation, i) => {
    const item = {}

    item.text = organisation.name
    item.value = organisation.id
    item.selected = !!((selectedItem && selectedItem.includes(organisation.id)))

    items.push(item)
  })

  items.sort((a, b) => {
    return a.text.localeCompare(b.text)
  })

  return items
}

exports.getOrganisationLabel = (organisationId) => {
  const organisation = organisationModel.findOne({ organisationId })

  let label = organisationId

  if (organisation) {
    label = organisation.name
  }

  return label
}

exports.getProviderTypeOptions = (selectedItem) => {
  const items = []

  providerTypes.forEach((providerType, i) => {
    const item = {}

    item.text = providerType.name
    item.value = providerType.code
    item.id = providerType.id
    item.checked = (selectedItem && selectedItem.includes(providerType.code)) ? 'checked' : ''

    items.push(item)
  })

  return items
}

exports.getProviderTypeLabel = (code) => {
  const providerType = providerTypes.find(providerType => providerType.code === code)

  let label = code

  if (providerType) {
    label = providerType.name
  }

  return label
}

exports.existsProviderCode = (code) => {
  let exists = false

  if (code) {
    const organisations = organisationModel.findMany({
      code
    })

    if (organisations.length) {
      exists = true
    }
  }

  return exists
}

exports.hasAccreditedProvider = (organisationId, providerNameOrId) => {
  const organisation = organisationModel.findOne({ organisationId: organisationId })

  const accreditedProvider = organisation.accreditedBodies?.find(
    accreditedProvider => accreditedProvider.name === providerNameOrId
      || accreditedProvider.id == providerNameOrId
  )

  let hasAccreditedProvider = false

  if (accreditedProvider) {
    hasAccreditedProvider = true
  }

  return hasAccreditedProvider
}
