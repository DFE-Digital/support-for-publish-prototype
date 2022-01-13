const express = require('express')
const router = express.Router()

const passport = require('passport')

// Controller modules
const authenticationController = require('./controllers/authentication.js')

const checkIsAuthenticated = (req, res, next) => {
  if (req.session.passport || req.session.data.user) {
    req.session.data.user = req.session.passport.user
    next()
  } else {
    res.redirect('/sign-in')
  }
}

/// --------------------------------------------------///
/// AUTHENTICATION ROUTES
/// --------------------------------------------------///

router.get('/sign-in', authenticationController.sign_in_get)
router.post('/sign-in', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/sign-in',
  failureFlash: 'Enter valid sign-in details'
}))

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

/// --------------------------------------------------///
/// HOME ROUTES
/// --------------------------------------------------///

router.get('/', checkIsAuthenticated, (req, res) => {
  res.render('index', {})
})

module.exports = router
