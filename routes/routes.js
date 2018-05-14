'use strict';

// Get tools
const { check, validationResult } = require('express-validator/check'); // Get input data validator
const { matchedData } = require('express-validator/filter');            // Filter data
const config = require("../config/secrets");                            // Get email credentials from config
const nodemailer = require('nodemailer');                               // Get nodemailer for email

module.exports = function (app) {

    // Render the index page
    app.get('/', function (req, res) {
        res.render('pages/index', {
            title: 'Home'
        });
    });

    // Render the contact page
    app.get('/contact', function (req, res) {
        res.render('pages/contact', {
            title: 'Contact',
            data: {},
            errors: {},
            successful_submit: false,
            csrfToken: req.csrfToken()
        });
    });


    // Handle post request to send message to the company
    app.post('/contact/message',
        [
            check('name', 'Please provide your name.').not().isEmpty().trim(),
            check('email', 'Please provide a valid email.').not().isEmpty().isEmail().trim().normalizeEmail(),
            check('subject', 'Please provide subject for your message.').not().isEmpty().trim(),
            check('message', 'Please provide your message.').not().isEmpty().trim(),
        ], function (req, res) {

            var errors = validationResult(req);

            if (!errors.isEmpty()) {
                console.log('ERROR');

                // Render the same page if there are errors. Resend the inputted data
                // to save the user from retyping.
                return res.render('pages/contact', {
                    data: req.body,
                    errors: errors.mapped(),
                    successful_submit: false,
                    csrfToken: req.csrfToken()
                });

            }

            const data = matchedData(req);
            console.log('Sanitized:', data);

            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                auth: {
                    user: config.email, 
                    pass: config.emailPassword 
                }
            });

            // setup email data with unicode symbols
            let mailOptions = {
                from: config.email, // sender address
                to: data.email, // list of receivers 
                subject: data.subject, // Subject line
                text: data.message + data.name // plain text body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

            });

            // Rerender the contact page and allow the success modal to show
            return res.render('pages/contact', {
                data: {},
                errors: {},
                successful_submit: true,
                csrfToken: req.csrfToken()
            });




        });
};