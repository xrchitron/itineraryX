const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses')
require('dotenv').config()
const SES_CONFIG = {
  credentials: {
    accessKeyId: process.env.SES_ACCESS_KEY,
    secretAccessKey: process.env.SES_SECRET_KEY
  },
  region: process.env.BUCKET_REGION
}
const sesClient = new SESClient(SES_CONFIG)
const sendEmail = async (email, subject, body) => {
  const params = {
    Source: process.env.SES_SENDER,
    Destination: {
      ToAddresses: [email]
    },
    ReplyToAddresses: [],
    Message: {
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      },
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: body
        }
      }
    }
  }
  try {
    const sendEmailCommand = new SendEmailCommand(params)
    const res = await sesClient.send(sendEmailCommand)
    console.log('Email has been sent', res)
  } catch (err) {
    console.log('Error', err)
  }
}

sendEmail('siriuschen016@gmail.com', 'test', '<h1>test</h1>')
