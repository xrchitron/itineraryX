const { SESClient, CreateTemplateCommand } = require('@aws-sdk/client-ses')
require('dotenv').config()

const SES_CONFIG = {
  credentials: {
    accessKeyId: process.env.SES_ACCESS_KEY,
    secretAccessKey: process.env.SES_SECRET_KEY
  },
  region: process.env.BUCKET_REGION
}
const sesClient = new SESClient(SES_CONFIG)

const run = async (templateName, htmlPart, subjectPart) => {
  const createTemplateCommand = new CreateTemplateCommand({
    Template: {
      TemplateName: templateName,
      HtmlPart: htmlPart,
      SubjectPart: subjectPart
    }
  })
  try {
    const res = await sesClient.send(createTemplateCommand)
    console.log('Template created', res)
  } catch (err) {
    console.log('Error', err)
  }
}
run('itineraryX-inviting', '<h1>{{name}} invite you to join itinerary!</h1><p>Click <a href=\'http://{{base_url}}/itinerary/{{itineraryId}}\'>here</a> to join this itinerary!</p>', 'Invitation from {{name}} with itineraryX!')
