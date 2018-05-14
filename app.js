'use strict';

// ================================================================
// get all the tools we need
// ================================================================
const express = require('express');
const routes = require('./routes/routes.js');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const helmet = require('helmet');   // Add some security from HTTP headers
const csrf = require('csurf');      // Protect from Cross-site Request Forgery
const config = require("./config/secrets");  // Get credentials from config

const port = process.env.PORT || 3000;

// Create express instance
const app = express();

// Set views engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set middlewares
const middlewares = [
    helmet(),
    bodyParser.json(),
    bodyParser.urlencoded({extended: false}),
    express.static(path.join(__dirname, 'public')),
    cookieParser(),
    session({
      secret: config.sessionSecret,
      key: config.sessionKey,
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 60000 }
    }),
    csrf({ cookie: true })
  ]
app.use(middlewares)

// ================================================================
// setup routes
// ================================================================
routes(app);


// Set errors
app.use((req, res, next) => {
    res.status(404).send("Sorry can't find that!")
})
  
// app.use((err, req, res, next) => {
//     console.error(err.stack)
//     res.status(500).send('Something broke!')
// })


// ================================================================
// start the server
// ================================================================
app.listen(port, function() {
    console.log('Server listening on port ' + port + '...');
});