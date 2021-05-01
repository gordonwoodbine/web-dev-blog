// Imports

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();
dotenv.config();

// Configure Express

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(helmet());

app.use(session({
  secret: process.env.SESSION_SEC,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Configure Mongoose

mongoose.connect(process.env.MONGO_STR, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);

const postSchema = {
  title: String,
  content: String,
  date: {type: Date, default: Date.now }
}

const Post = mongoose.model('Post', postSchema);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Get Routes

app.get('/', (req, res) => {
  Post.find({}, (err, posts) => {
    res.render('index', {posts: posts});
  });
});

app.get('/compose', (req, res) => {
  if(req.isAuthenticated()) {
    res.render('compose');
  } else {
    res.redirect('/login');
  }
});

app.get('/posts/:postId', (req, res) => {
  const requestedPostId = req.params.postId;
  Post.findOne({ _id: requestedPostId }, (err, post) => {
    if(err) {
      post = {title: 'Not Found', content: 'There appears to be a problem with the post id.'}
    }
    res.render('post', {post: post});
  });
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
})

// Post Routes

app.post('/compose', (req, res) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.body
  });
  post.save(err => {
    if(!err) {
      res.redirect('/');
    }
  });
});

app.post('/login',
  passport.authenticate('local', {successRedirect: '/compose', failureRedirect: '/login'}));

app.listen(process.env.PORT, () => {
  console.log('Server running...');
});