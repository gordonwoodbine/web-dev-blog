// Imports

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');

const app = express();

dotenv.config();

// Configure Express

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
// app.use(helmet());

app.use(session({
  secret: process.env.SESSION_SEC,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Configure Mongoose

/* Change MONGO_LOCAL back to MONGO_STR before pushing live */
mongoose.connect(process.env.MONGO_STR, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);

// Initialise Controller

const posts = require('./controllers/posts')(app);

// Start Server

app.listen(process.env.PORT, () => {
  console.log('Server running...');
});