const { application } = require('express')
const express = require('express')
const router = express.Router()


const downloads = {
    'cpPGhWp9GLczhj5XOZPaQg==': {
      serviceName: 'NHS COVID Pass',
      replyToAddress: 'covid19cert.no-reply@nhs.net',
      file: 'example.pdf'
    },
    'ppH6o2PUlOesyZCBxxLfNA==': {
      serviceName: 'Passport appointment',
      replyToAddress: 'passport-appointment-bookings@homeoffice.gov.uk',
      file: 'example.pdf'
    }
};

function pageWithConfig(req, res, htmlFile) {
    if (!('id' in req.params) || !(req.params.id in downloads)) {
        return res.sendStatus(404)
    }
    return res.render(
        htmlFile,
        {
            id: req.params.id,
            details: downloads[req.params.id]
        }
    )
}

// Add your routes here - above the module.exports line

router.get('/', function (req, res) {
    return res.render(
        'index.html',
        {
            downloadsEntries: Object.entries(downloads)
        }
    )
})

router.get('/d/:id', function (req, res) {
    return pageWithConfig(req, res, 'd.html');
})

router.get('/confirm-email/:id', function (req, res) {
    return pageWithConfig(req, res, 'confirm-email.html');
})

router.get('/download/:id', function (req, res) {
    return pageWithConfig(req, res, 'download.html');
})

module.exports = router
