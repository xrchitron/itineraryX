const { SESClient, SendTemplatedEmailCommand } = require('@aws-sdk/client-ses')
require('dotenv').config()

const SES_CONFIG = {
  credentials: {
    accessKeyId: process.env.SES_ACCESS_KEY,
    secretAccessKey: process.env.SES_SECRET_KEY
  },
  region: process.env.BUCKET_REGION
}
const sesClient = new SESClient(SES_CONFIG)
const sendMail = async (email, templateName, templateData) => {
  const params = {
    Source: process.env.SES_SENDER,
    Destination: {
      ToAddresses: [email]
    },
    ReplyToAddresses: [],
    Template: templateName,
    TemplateData: JSON.stringify(templateData)
  }
  try {
    const sendTemplatedEmailCommand = new SendTemplatedEmailCommand(params)
    const res = await sesClient.send(sendTemplatedEmailCommand)
    console.log('Email has been sent', res)
  } catch (err) {
    console.log('Error', err)
  }
}

sendMail('siriuschen016@gmail.com', 'itineraryX-inviting', {
  name: 'Sirius',
  base_url: 'http://localhost:3000',
  itineraryId: '1'
})
