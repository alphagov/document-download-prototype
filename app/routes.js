const { application } = require('express')
const express = require('express')
const router = express.Router()
const fs = require('fs');
const md5 = require('md5');


const downloads = {
    'cpPGhWp9GLczhj5XOZPaQg==': {
      serviceName: 'NHS COVID Pass',
      startPage: 'covid-pass.cloudapps.digital',
      replyToAddress: 'covid19cert.no-reply@nhs.net',
      file: 'COVID-pass_Notify-user-research.pdf'
    },
    'ppH6o2PUlOesyZCBxxLfNA==': {
      serviceName: 'Passport appointment',
      startPage: 'passports.cloudapps.digital',
      replyToAddress: 'passport-appointment-bookings@homeoffice.gov.uk',
      file: 'Passport-application-form_Notify-user-research.pdf'
    }
};

const emailRegex = /^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~\-]+@([^.@][^@\s]+)$/;

function config(key, value, defaultValue) {
    const filename = key + '.txt';

    if (value !== undefined) {
        try {
            fs.writeFileSync(filename, value);
        } catch (err) {
            console.log(value, err);
        }
    }

    try {
        return fs.readFileSync(filename);
    } catch (err) {
        console.log(err);
        return 'true'
    }
}


function pageWithConfig(req, res, htmlFile, errors) {
    if (!('id' in req.params) || !(req.params.id in downloads)) {
        return res.sendStatus(404)
    }
    return res.render(
        htmlFile,
        {
            id: req.params.id,
            details: downloads[req.params.id],
            errors: errors
        }
    )
}

// Add your routes here - above the module.exports line

router.get('/', function (req, res) {
    return res.render(
        'index.html',
        {
            downloadsEntries: Object.entries(downloads),
            emailConfirmation: config('emailConfirmationRequired'),
            fileAvailable: config('fileAvailable'),
            emailAddressHashes: config('emailAddressHashes')
        }
    )
})

router.post('/', function (req, res) {
    config('emailConfirmationRequired', req.session.data['email-confirmation']);
    config('fileAvailable', req.session.data['file-available']);
    config('emailAddressHashes', req.session.data['email-address-hashes']);
    return res.redirect('/');
})

router.get('/d/:id', function (req, res) {
    return pageWithConfig(req, res, 'd.html');
})

router.get('/confirm-email/:id', function (req, res) {
    if (config('fileAvailable') == 'false') {
        return res.redirect('/unavailable/' + req.params.id)
    }
    if (config('emailConfirmationRequired') == 'false') {
        return res.redirect('/download/' + req.params.id)
    }
    return pageWithConfig(req, res, 'confirm-email.html');
})

router.post('/confirm-email/:id', function (req, res) {
    emailAddress = req.body['email-address']
    hash = md5(emailAddress).substring(0, 5);

    if (!emailAddress.match(emailRegex)) {
        return pageWithConfig(req, res, 'confirm-email.html', 'badEmail');
    }

    if (!config('emailAddressHashes').includes(hash)) {
        return pageWithConfig(req, res, 'confirm-email.html', 'wrongEmail');
    }

    return res.redirect('/download/' + req.params.id)
})

router.get('/unavailable/:id', function (req, res) {
    return pageWithConfig(req, res, 'unavailable.html');
})

router.get('/download/:id', function (req, res) {
    return pageWithConfig(req, res, 'download.html');
})

module.exports = router
