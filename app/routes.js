const express = require('express')
const router = express.Router()

const passport = require('passport')

// Controller modules
const authenticationController = require('./controllers/authentication.js')
const courseController = require('./controllers/courses')
const locationController = require('./controllers/locations')
const organisationController = require('./controllers/organisations')
const userController = require('./controllers/users')

// Authentication middleware
const checkIsAuthenticated = (req, res, next) => {
  if (req.session.passport) {
    // the signed in user
    res.locals.passport = req.session.passport
    // the base URL for navigation
    res.locals.baseUrl = ''
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

router.get('/organisations/:organisationId/courses/:courseId', checkIsAuthenticated, courseController.show)

router.get('/organisations/:organisationId/courses', checkIsAuthenticated, courseController.list)

/// ------------------------------------------------------------------------ ///
/// USER ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/organisations/:organisationId/users/new', checkIsAuthenticated, userController.new_get)
router.post('/organisations/:organisationId/users/new', checkIsAuthenticated, userController.new_post)

router.get('/organisations/:organisationId/users/new/check', checkIsAuthenticated, userController.new_check_get)
router.post('/organisations/:organisationId/users/new/check', checkIsAuthenticated, userController.new_check_post)

router.get('/organisations/:organisationId/users/:userId/edit', checkIsAuthenticated, userController.edit_get)
router.post('/organisations/:organisationId/users/:userId/edit', checkIsAuthenticated, userController.edit_post)

router.get('/organisations/:organisationId/users/:userId/delete', checkIsAuthenticated, userController.delete_get)
router.post('/organisations/:organisationId/users/:userId/delete', checkIsAuthenticated, userController.delete_post)

router.get('/organisations/:organisationId/users/:userId', checkIsAuthenticated, userController.show)

router.get('/organisations/:organisationId/users', checkIsAuthenticated, userController.list)

/// ------------------------------------------------------------------------ ///
/// LOCATION ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/organisations/:organisationId/locations/:locationId', checkIsAuthenticated, locationController.show)

router.get('/organisations/:organisationId/locations', checkIsAuthenticated, locationController.list)

/// ------------------------------------------------------------------------ ///
/// ORGANISATION ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/organisations/remove-keyword-search', checkIsAuthenticated, organisationController.remove_keyword_search_get)

router.get('/organisations/remove-all-filters', checkIsAuthenticated, organisationController.remove_all_filters_get)

router.get('/organisations/remove-provider-type-filter/:providerType', checkIsAuthenticated, organisationController.remove_provider_type_filter_get)

router.get('/organisations/:organisationId/edit', checkIsAuthenticated, organisationController.edit_get)
router.post('/organisations/:organisationId/edit', checkIsAuthenticated, organisationController.edit_post)

router.get('/organisations/:organisationId', checkIsAuthenticated, organisationController.show)

router.get('/organisations', checkIsAuthenticated, organisationController.list)

/// --------------------------------------------------///
/// HOME ROUTES
/// --------------------------------------------------///

router.get('/', checkIsAuthenticated, (req, res) => {
  res.redirect('/organisations')
})

module.exports = router
