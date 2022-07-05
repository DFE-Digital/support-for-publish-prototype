// const courseModel = require('../models/courses')
const organisationModel = require('../models/organisations')

const cycleHelper = require('../helpers/cycles')
const organisationHelper = require('../helpers/organisations')
const paginationHelper = require('../helpers/pagination')
const utilsHelper = require('../helpers/utils')

exports.list = (req, res) => {
  // Filters
  let providerType = null
  let keywords = req.session.data.keywords

  const providerTypes = utilsHelper.getCheckboxValues(providerType, req.session.data.filter?.providerType)

  const hasSearch = !!((keywords))
  const hasFilters = !!((providerTypes && providerTypes.length > 0))

  let selectedFilters = null

  if (hasFilters) {
    selectedFilters = {
      categories: []
    }

    if (providerTypes && providerTypes.length) {
      selectedFilters.categories.push({
        heading: { text: 'Provider type' },
        items: providerTypes.map((providerType) => {
          return {
            text: organisationHelper.getProviderTypeLabel(providerType),
            href: `/organisations/remove-provider-type-filter/${providerType}`
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
      filters: {
        apply: '/organisations',
        remove: '/organisations/remove-all-filters'
      },
      search: {
        find: '/organisations',
        remove: '/organisations/remove-keyword-search'
      }
    }
  })
}

exports.remove_all_filters_get = (req, res) => {
  delete req.session.data.filter
  res.redirect('/organisations')
}

exports.remove_provider_type_filter_get = (req, res) => {
  req.session.data.filter.providerType = utilsHelper.removeFilter(req.params.providerType, req.session.data.filter.providerType)
  res.redirect('/organisations')
}

exports.remove_keyword_search_get = (req, res) => {
  delete req.session.data.keywords
  res.redirect('/organisations')
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
      locations: `/organisations/${req.params.organisationId}/locations`,
      change: `/organisations/${req.params.organisationId}/edit`
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
    providerTypeItems,
    actions: {
      save: `/organisations/${req.params.organisationId}/edit`,
      back: `/organisations/${req.params.organisationId}`,
      cancel: `/organisations/${req.params.organisationId}`
    }
  })
}

exports.edit_post = (req, res) => {
  let organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  organisation = req.body.organisation

  let selectedProviderType
  if (organisation.type) {
    selectedProviderType = organisation.type
  }

  const providerTypeItems = organisationHelper.getProviderTypeOptions(selectedProviderType)

  const errors = []

  if (!req.body.organisation.name.length) {
    const error = {}
    error.fieldName = 'organisation-name'
    error.href = '#organisation-name'
    error.text = 'Enter a name'
    errors.push(error)
  }

  if (!req.body.organisation.code.length) {
    const error = {}
    error.fieldName = 'organisation-code'
    error.href = '#organisation-code'
    error.text = 'Enter a provider code'
    errors.push(error)
  }

  if (errors.length) {
    res.render('../views/organisations/edit', {
      organisation,
      providerTypeItems,
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
      organisation
    })

    req.flash('success', 'Organisation details updated')
    res.redirect(`/organisations/${req.params.organisationId}`)
  }
}
