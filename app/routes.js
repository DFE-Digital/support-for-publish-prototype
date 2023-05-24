const express = require('express')
const router = express.Router()

const passport = require('passport')

// Controller modules
const accreditedProviderController = require('./controllers/accredited-providers')
const authenticationController = require('./controllers/authentication')
const courseController = require('./controllers/courses')
const cycleController = require('./controllers/cycles')
const locationController = require('./controllers/locations')
const organisationController = require('./controllers/organisations')
const studySiteController = require('./controllers/study-sites')
const userController = require('./controllers/users')

// Authentication middleware
const checkIsAuthenticated = (req, res, next) => {
  if (req.session.passport) {
    // the signed in user
    res.locals.passport = req.session.passport
    // the base URL for navigation
    res.locals.baseUrl = `/cycles/${req.params.cycleId}`
    res.locals.cycleId = req.params.cycleId
    next()
  } else {
    delete req.session.data
    res.redirect('/sign-in')
  }
}

/// ------------------------------------------------------------------------ ///
/// ALL ROUTES
/// ------------------------------------------------------------------------ ///

router.all('*', (req, res, next) => {
  res.locals.referrer = req.query.referrer
  res.locals.query = req.query
  res.locals.flash = req.flash('success') // pass through 'success' messages only
  next()
})

/// ------------------------------------------------------------------------ ///
/// AUTHENTICATION ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/sign-in', authenticationController.sign_in_get)
router.post('/sign-in', passport.authenticate('local', {
  successRedirect: '/auth',
  failureRedirect: '/sign-in',
  failureFlash: 'Enter valid sign-in details'
}))

router.get('/auth', authenticationController.auth_get)

router.get('/sign-out', authenticationController.sign_out_get)

router.get('/register', authenticationController.register_get)
router.post('/register', authenticationController.register_post)

router.get('/confirm-email', authenticationController.confirm_email_get)
router.post('/confirm-email', authenticationController.confirm_email_post)

router.get('/resend-code', authenticationController.resend_code_get)
router.post('/resend-code', authenticationController.resend_code_post)

router.get('/forgotten-password', authenticationController.forgotten_password_get)
router.post('/forgotten-password', authenticationController.forgotten_password_post)

router.get('/verification-code', authenticationController.verification_code_get)
router.post('/verification-code', authenticationController.verification_code_post)

router.get('/create-password', authenticationController.create_password_get)
router.post('/create-password', authenticationController.create_password_post)

router.get('/password-reset', authenticationController.password_reset_get)
router.post('/password-reset', authenticationController.password_reset_post)

router.get('/registration-complete', authenticationController.registration_complete_get)

router.get('/terms-and-conditions', authenticationController.terms_and_conditions_get)

/// ------------------------------------------------------------------------ ///
/// COURSE ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/cycles/:cycleId/organisations/:organisationId/courses/:courseId', checkIsAuthenticated, courseController.show)

router.get('/cycles/:cycleId/organisations/:organisationId/courses', checkIsAuthenticated, courseController.list)

/// ------------------------------------------------------------------------ ///
/// USER ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/cycles/:cycleId/organisations/:organisationId/users/new', checkIsAuthenticated, userController.new_get)
router.post('/cycles/:cycleId/organisations/:organisationId/users/new', checkIsAuthenticated, userController.new_post)

router.get('/cycles/:cycleId/organisations/:organisationId/users/new/check', checkIsAuthenticated, userController.new_check_get)
router.post('/cycles/:cycleId/organisations/:organisationId/users/new/check', checkIsAuthenticated, userController.new_check_post)

router.get('/cycles/:cycleId/organisations/:organisationId/users/:userId/edit', checkIsAuthenticated, userController.edit_get)
router.post('/cycles/:cycleId/organisations/:organisationId/users/:userId/edit', checkIsAuthenticated, userController.edit_post)

router.get('/cycles/:cycleId/organisations/:organisationId/users/:userId/delete', checkIsAuthenticated, userController.delete_get)
router.post('/cycles/:cycleId/organisations/:organisationId/users/:userId/delete', checkIsAuthenticated, userController.delete_post)

router.get('/cycles/:cycleId/organisations/:organisationId/users/:userId', checkIsAuthenticated, userController.show)

router.get('/cycles/:cycleId/organisations/:organisationId/users', checkIsAuthenticated, userController.list)

/// ------------------------------------------------------------------------ ///
/// LOCATION ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/cycles/:cycleId/organisations/:organisationId/locations/multiple/new', checkIsAuthenticated, locationController.new_multiple_get)
router.post('/cycles/:cycleId/organisations/:organisationId/locations/multiple/new', checkIsAuthenticated, locationController.new_multiple_post)

router.get('/cycles/:cycleId/organisations/:organisationId/locations/multiple/edit', checkIsAuthenticated, locationController.new_multiple_edit_get)
router.post('/cycles/:cycleId/organisations/:organisationId/locations/multiple/edit', checkIsAuthenticated, locationController.new_multiple_edit_post)

router.get('/cycles/:cycleId/organisations/:organisationId/locations/multiple/check', checkIsAuthenticated, locationController.new_multiple_check_get)
router.post('/cycles/:cycleId/organisations/:organisationId/locations/multiple/check', checkIsAuthenticated, locationController.new_multiple_check_post)

router.get('/cycles/:cycleId/organisations/:organisationId/locations/new', checkIsAuthenticated, locationController.new_get)
router.post('/cycles/:cycleId/organisations/:organisationId/locations/new', checkIsAuthenticated, locationController.new_post)

router.get('/cycles/:cycleId/organisations/:organisationId/locations/new/check', checkIsAuthenticated, locationController.new_check_get)
router.post('/cycles/:cycleId/organisations/:organisationId/locations/new/check', checkIsAuthenticated, locationController.new_check_post)

router.get('/cycles/:cycleId/organisations/:organisationId/locations/:locationId/edit', checkIsAuthenticated, locationController.edit_get)
router.post('/cycles/:cycleId/organisations/:organisationId/locations/:locationId/edit', checkIsAuthenticated, locationController.edit_post)

router.get('/cycles/:cycleId/organisations/:organisationId/locations/:locationId/delete', checkIsAuthenticated, locationController.delete_get)
router.post('/cycles/:cycleId/organisations/:organisationId/locations/:locationId/delete', checkIsAuthenticated, locationController.delete_post)

router.get('/cycles/:cycleId/organisations/:organisationId/locations/:locationId', checkIsAuthenticated, locationController.show)

router.get('/cycles/:cycleId/organisations/:organisationId/locations', checkIsAuthenticated, locationController.list)

/// ------------------------------------------------------------------------ ///
/// STUDY SITE ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/cycles/:cycleId/organisations/:organisationId/study-sites/new', checkIsAuthenticated, studySiteController.new_find_get)
router.post('/cycles/:cycleId/organisations/:organisationId/study-sites/new', checkIsAuthenticated, studySiteController.new_find_post)

router.get('/cycles/:cycleId/organisations/:organisationId/study-sites/new/choose', checkIsAuthenticated, studySiteController.new_choose_get)
router.post('/cycles/:cycleId/organisations/:organisationId/study-sites/new/choose', checkIsAuthenticated, studySiteController.new_choose_post)

router.get('/cycles/:cycleId/organisations/:organisationId/study-sites/new/edit', checkIsAuthenticated, studySiteController.new_edit_get)
router.post('/cycles/:cycleId/organisations/:organisationId/study-sites/new/edit', checkIsAuthenticated, studySiteController.new_edit_post)

router.get('/cycles/:cycleId/organisations/:organisationId/study-sites/new/check', checkIsAuthenticated, studySiteController.new_check_get)
router.post('/cycles/:cycleId/organisations/:organisationId/study-sites/new/check', checkIsAuthenticated, studySiteController.new_check_post)

router.get('/cycles/:cycleId/organisations/:organisationId/study-sites/:studySiteId/edit', checkIsAuthenticated, studySiteController.edit_get)
router.post('/cycles/:cycleId/organisations/:organisationId/study-sites/:studySiteId/edit', checkIsAuthenticated, studySiteController.edit_post)

router.get('/cycles/:cycleId/organisations/:organisationId/study-sites/:studySiteId/delete', checkIsAuthenticated, studySiteController.delete_get)
router.post('/cycles/:cycleId/organisations/:organisationId/study-sites/:studySiteId/delete', checkIsAuthenticated, studySiteController.delete_post)

router.get('/cycles/:cycleId/organisations/:organisationId/study-sites/:studySiteId', checkIsAuthenticated, studySiteController.show)

router.get('/cycles/:cycleId/organisations/:organisationId/study-sites', checkIsAuthenticated, studySiteController.list)

/// ------------------------------------------------------------------------ ///
/// ACCREDITED PROVIDER ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/cycles/:cycleId/organisations/:organisationId/accredited-providers/new', checkIsAuthenticated, accreditedProviderController.new_accredited_provider_get)
router.post('/cycles/:cycleId/organisations/:organisationId/accredited-providers/new', checkIsAuthenticated, accreditedProviderController.new_accredited_provider_post)

router.get('/cycles/:cycleId/organisations/:organisationId/accredited-providers/new/choose', checkIsAuthenticated, accreditedProviderController.new_accredited_provider_choose_get)
router.post('/cycles/:cycleId/organisations/:organisationId/accredited-providers/new/choose', checkIsAuthenticated, accreditedProviderController.new_accredited_provider_choose_post)

router.get('/cycles/:cycleId/organisations/:organisationId/accredited-providers/new/description', checkIsAuthenticated, accreditedProviderController.new_accredited_provider_description_get)
router.post('/cycles/:cycleId/organisations/:organisationId/accredited-providers/new/description', checkIsAuthenticated, accreditedProviderController.new_accredited_provider_description_post)

router.get('/cycles/:cycleId/organisations/:organisationId/accredited-providers/new/check', checkIsAuthenticated, accreditedProviderController.new_accredited_provider_check_get)
router.post('/cycles/:cycleId/organisations/:organisationId/accredited-providers/new/check', checkIsAuthenticated, accreditedProviderController.new_accredited_provider_check_post)

router.get('/cycles/:cycleId/organisations/:organisationId/accredited-providers/:accreditedProviderId/description', checkIsAuthenticated, accreditedProviderController.edit_description_get)
router.post('/cycles/:cycleId/organisations/:organisationId/accredited-providers/:accreditedProviderId/description', checkIsAuthenticated, accreditedProviderController.edit_description_post)

router.get('/cycles/:cycleId/organisations/:organisationId/accredited-providers/:accreditedProviderId/delete', checkIsAuthenticated, accreditedProviderController.delete_accredited_provider_get)
router.post('/cycles/:cycleId/organisations/:organisationId/accredited-providers/:accreditedProviderId/delete', checkIsAuthenticated, accreditedProviderController.delete_accredited_provider_post)

router.get('/cycles/:cycleId/organisations/:organisationId/accredited-providers', checkIsAuthenticated, accreditedProviderController.list)

/// ------------------------------------------------------------------------ ///
/// ORGANISATION ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/cycles/:cycleId/organisations/remove-keyword-search', checkIsAuthenticated, organisationController.remove_keyword_search_get)

router.get('/cycles/:cycleId/organisations/remove-all-filters', checkIsAuthenticated, organisationController.remove_all_filters_get)

router.get('/cycles/:cycleId/organisations/remove-provider-type-filter/:providerType', checkIsAuthenticated, organisationController.remove_provider_type_filter_get)

router.get('/cycles/:cycleId/organisations/new', checkIsAuthenticated, organisationController.new_get)
router.post('/cycles/:cycleId/organisations/new', checkIsAuthenticated, organisationController.new_post)

router.get('/cycles/:cycleId/organisations/new/contact', checkIsAuthenticated, organisationController.new_contact_details_get)
router.post('/cycles/:cycleId/organisations/new/contact', checkIsAuthenticated, organisationController.new_contact_details_post)

router.get('/cycles/:cycleId/organisations/new/check', checkIsAuthenticated, organisationController.new_check_get)
router.post('/cycles/:cycleId/organisations/new/check', checkIsAuthenticated, organisationController.new_check_post)

router.get('/cycles/:cycleId/organisations/:organisationId/edit/contact', checkIsAuthenticated, organisationController.edit_contact_details_get)
router.post('/cycles/:cycleId/organisations/:organisationId/edit/contact', checkIsAuthenticated, organisationController.edit_contact_details_post)

router.get('/cycles/:cycleId/organisations/:organisationId/edit', checkIsAuthenticated, organisationController.edit_get)
router.post('/cycles/:cycleId/organisations/:organisationId/edit', checkIsAuthenticated, organisationController.edit_post)

router.get('/cycles/:cycleId/organisations/:organisationId/delete', checkIsAuthenticated, organisationController.delete_get)
router.post('/cycles/:cycleId/organisations/:organisationId/delete', checkIsAuthenticated, organisationController.delete_post)

router.get('/cycles/:cycleId/organisations/:organisationId', checkIsAuthenticated, organisationController.show)

router.get('/cycles/:cycleId/organisations', checkIsAuthenticated, organisationController.list)

/// ------------------------------------------------------------------------ ///
/// AUTOCOMPLETE ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/accredited-provider-suggestions', accreditedProviderController.accredited_provider_suggestions_json)

// router.get('/school-suggestions', locationController.school_suggestions_json)

router.get('/study-site-suggestions', studySiteController.study_site_suggestions_json)

/// --------------------------------------------------///
/// CYCLE ROUTES
/// --------------------------------------------------///

router.get('/cycles', checkIsAuthenticated, cycleController.list)

/// --------------------------------------------------///
/// HOME ROUTES
/// --------------------------------------------------///

router.get('/', checkIsAuthenticated, (req, res) => {
  res.redirect('/cycles')
})

module.exports = router
