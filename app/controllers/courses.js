const courseModel = require('../models/courses')
const organisationModel = require('../models/organisations')

const organisationHelper = require('../helpers/organisations')
const paginationHelper = require('../helpers/pagination')

exports.list = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  let courses = courseModel.findMany({})

  courses.sort((a, b) => {
    if (a.name) {
      return a.name.localeCompare(b.name)
    }
  })

  // Get the pagination data
  const pagination = paginationHelper.getPagination(courses, req.query.page)

  // Get a slice of the data to display
  courses = paginationHelper.getDataByPage(courses, pagination.pageNumber)

  res.render('../views/organisations/courses/list', {
    organisation,
    courses,
    pagination,
    actions: {
      details: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}`,
      users: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/users`,
      courses: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/courses`,
      locations: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/locations`,
      studySites: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/study-sites`,
      accreditedProviders: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/accredited-providers`,
      new: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/courses/new`,
      view: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/courses`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// SHOW COURSE
/// ------------------------------------------------------------------------ ///

exports.show = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const course = courseModel.findOne({ courseId: req.params.courseId })

  res.render('../views/organisations/courses/show', {
    organisation,
    course,
    actions: {
      back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/courses`,
      change: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/courses/${req.params.courseId}/edit`
    }
  })
}

/// ------------------------------------------------------------------------ ///
/// EDIT COURSE
/// ------------------------------------------------------------------------ ///

exports.edit_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const course = courseModel.findOne({ courseId: req.params.courseId })

  res.render('../views/organisations/courses/edit', {
    organisation,
    course,
    actions: {
      save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/courses/${req.params.courseId}/edit`,
      back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/courses`,
      cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/courses`
    }
  })
}

exports.edit_post = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  let course = courseModel.findOne({ courseId: req.params.courseId })
  course = req.session.data.course

  const errors = []

  if (errors.length) {
    res.render('../views/organisations/courses/edit', {
      organisation,
      course,
      actions: {
        save: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/courses/${req.params.courseId}/edit`,
        back: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/courses`,
        cancel: `/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/courses`
      },
      errors
    })
  } else {
    courseModel.updateOne({
      organisationId: req.params.organisationId,
      courseId: req.params.courseId,
      course: req.session.data.course
    })

    req.flash('success', 'course details updated')
    res.redirect(`/cycles/${req.params.cycleId}/organisations/${req.params.organisationId}/courses/${req.params.courseId}`)
  }
}
