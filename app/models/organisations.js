const path = require('path')
const fs = require('fs')
const { v4: uuid } = require('uuid')

const directoryPath = path.join(__dirname, '../data/organisations/')

exports.findMany = (params) => {
  let organisations = []

  let documents = fs.readdirSync(directoryPath, 'utf8')

  // Only get JSON documents
  documents = documents.filter(doc => doc.match(/.*\.(json)/ig))

  documents.forEach((filename) => {
    const raw = fs.readFileSync(directoryPath + '/' + filename)
    const data = JSON.parse(raw)
    organisations.push(data)
  })

  if (params.providerTypes?.length) {
    organisations = organisations.filter(organisation => params.providerTypes.includes(organisation.type))
  }

  if (params.keywords?.length) {
    organisations = organisations.filter(organisation =>
      organisation.name.toLowerCase().includes(params.keywords) ||
      organisation.code.toLowerCase().includes(params.keywords)
    )
  }

  if (params.code?.length) {
    organisations = organisations.filter(organisation =>
      organisation.code.toLowerCase() === params.code.toLowerCase()
    )
  }

  return organisations
}

exports.findOne = (params) => {
  let organisation = {}

  if (params.organisationId) {
    const filePath = directoryPath + '/' + params.organisationId + '.json'

    const raw = fs.readFileSync(filePath)
    organisation = JSON.parse(raw)
  }

  return organisation
}

exports.insertOne = (params) => {
  const organisation = {}

  organisation.id = uuid()

  organisation.name = params.organisation.name

  organisation.code = params.organisation.code.toUpperCase()

  if (params.organisation.ukprn) {
    organisation.ukprn = params.organisation.ukprn
  }

  if (params.organisation.type === 'lead_school') {
    if (params.organisation.urn) {
      organisation.urn = params.organisation.urn
    }
  }

  organisation.isAccreditedBody = params.organisation.isAccreditedBody

  if (params.organisation.isAccreditedBody === 'yes') {
    organisation.isAccreditedBody = true

    if (params.organisation.accreditedProviderId) {
      organisation.accreditedProviderId = params.organisation.accreditedProviderId
    }
  } else {
    organisation.isAccreditedBody = false
  }

  organisation.type = params.organisation.type

  organisation.contact = {}

  if (params.organisation.contact) {
    if (params.organisation.contact.email.length) {
      organisation.contact.email = params.organisation.contact.email.toLowerCase()
    }

    if (params.organisation.contact.telephone.length) {
      organisation.contact.telephone = params.organisation.contact.telephone
    }

    if (params.organisation.contact.website.length) {
      organisation.contact.website = params.organisation.contact.website.toLowerCase()
    }
  }

  organisation.address = {}

  if (params.organisation.address) {
    if (params.organisation.address.addressLine1.length) {
      organisation.address.addressLine1 = params.organisation.address.addressLine1
    }

    if (params.organisation.address.addressLine2.length) {
      organisation.address.addressLine2 = params.organisation.address.addressLine2
    }

    if (params.organisation.address.addressLine3.length) {
      organisation.address.addressLine3 = params.organisation.address.addressLine3
    }

    if (params.organisation.address.town.length) {
      organisation.address.town = params.organisation.address.town
    }

    if (params.organisation.address.county.length) {
      organisation.address.county = params.organisation.address.county
    }

    if (params.organisation.address.postcode.length) {
      organisation.address.postcode = params.organisation.address.postcode.toUpperCase()
    }
  }

  organisation.createdAt = new Date()

  const filePath = directoryPath + '/' + organisation.id + '.json'

  // create a JSON sting for the submitted data
  const fileData = JSON.stringify(organisation)

  // write the JSON data
  fs.writeFileSync(filePath, fileData)

  return organisation
}

exports.updateOne = (params) => {
  let organisation

  if (params.organisationId) {
    organisation = this.findOne({ organisationId: params.organisationId })

    if (params.organisation.name !== undefined) {
      organisation.name = params.organisation.name
    }

    if (params.organisation.code !== undefined) {
      organisation.code = params.organisation.code
    }

    if (params.organisation.ukprn !== undefined) {
      organisation.ukprn = params.organisation.ukprn
    }

    if (params.organisation.urn !== undefined) {
      if (params.organisation?.type === 'lead_school') {
          organisation.urn = params.organisation.urn
      }
    }

    if (params.organisation.isAccreditedBody !== undefined) {
      if (params.organisation.isAccreditedBody === 'yes') {
        organisation.isAccreditedBody = true

        if (params.organisation.accreditedProviderId !== undefined) {
          organisation.accreditedProviderId = params.organisation.accreditedProviderId
        }
      } else {
        organisation.isAccreditedBody = false
        delete organisation.accreditedProviderId
      }
    }

    if (params.organisation.type !== undefined) {
      organisation.type = params.organisation.type
    }

    if (params.organisation.trainWithUs !== undefined) {
      organisation.trainWithUs = params.organisation.trainWithUs
    }

    if (params.organisation.trainWithDisability !== undefined) {
      organisation.trainWithDisability = params.organisation.trainWithDisability
    }

    if (params.organisation.contact !== undefined) {
      if (params.organisation.contact.email !== undefined) {
        organisation.contact.email = params.organisation.contact.email.toLowerCase()
      }

      if (params.organisation.contact.telephone !== undefined) {
        organisation.contact.telephone = params.organisation.contact.telephone
      }

      if (params.organisation.contact.website !== undefined) {
        organisation.contact.website = params.organisation.contact.website.toLowerCase()
      }
    }

    if (params.organisation.address !== undefined) {
      if (params.organisation.address.addressLine1 !== undefined) {
        organisation.address.addressLine1 = params.organisation.address.addressLine1
      }

      if (params.organisation.address.addressLine2 !== undefined) {
        organisation.address.addressLine2 = params.organisation.address.addressLine2
      }

      if (params.organisation.address.town !== undefined) {
        organisation.address.town = params.organisation.address.town
      }

      if (params.organisation.address.county !== undefined) {
        organisation.address.county = params.organisation.address.county
      }

      if (params.organisation.address.postcode !== undefined) {
        organisation.address.postcode = params.organisation.address.postcode.toUpperCase()
      }
    }

    if (params.organisation.visaSponsorship !== undefined) {
      if (params.organisation.visaSponsorship.canSponsorStudentVisa !== undefined) {
        organisation.visaSponsorship.canSponsorStudentVisa = params.organisation.visaSponsorship.canSponsorStudentVisa
      }

      if (params.organisation.visaSponsorship.canSponsorSkilledWorkerVisa !== undefined) {
        organisation.visaSponsorship.canSponsorSkilledWorkerVisa = params.organisation.visaSponsorship.canSponsorSkilledWorkerVisa
      }
    }

    organisation.updatedAt = new Date()

    const filePath = directoryPath + '/' + params.organisationId + '.json'

    // create a JSON sting for the submitted data
    const fileData = JSON.stringify(organisation)

    // write the JSON data
    fs.writeFileSync(filePath, fileData)
  }

  return organisation
}

exports.deleteOne = (params) => {
  if (params.organisationId) {
    const filePath = directoryPath + '/' + params.organisationId + '.json'
    fs.unlinkSync(filePath)
  }
}
