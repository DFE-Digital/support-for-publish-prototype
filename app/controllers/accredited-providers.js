const organisationModel = require('../models/organisations')

exports.list = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })

  res.render('../views/organisations/accredited-providers/list', {
    organisation,
    actions: {
      details: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}`,
      users: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users`,
      courses: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/courses`,
      locations: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`,
      accreditedProviders: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers`,
      new: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations/new`
    }
  })
}
