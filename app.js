// Imports

const express = require('express');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const helmet = require('helmet');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const md = require('markdown-it')();

const app = express();
dotenv.config();
let pageTracker = 1;

// Configure Express

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(methodOverride('_method'));
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
mongoose.connect(process.env.MONGO_LOCAL, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  date: { type: Date, default: Date.now },
  updated: { type: Date }
});

postSchema.plugin(mongoosePaginate);

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
  pageTracker = 1;
  Post.paginate({}, { page: 1, limit: 5, sort: { date: -1 }}, ((err, result) => {
    res.render('index', { 
      posts: result.docs,
      page: result.page,
      total: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage
    });
  }));
});

app.get('/pages/:page', (req, res) => {
  const page = req.params.page;
  pageTracker = page;
  Post.paginate({}, { page: page, limit: 5, sort: { date: -1 }}, ((err, result) => {
    if(page > result.totalPages) {
      res.redirect('/');
    } else {
      res.render('index', {
        posts: result.docs,
        page: result.page,
        total: result.totalPages,
        prevPage: result.prevPage,
        nextPage: result.nextPage
      });
    }
  }));
});

app.get('/posts/new', (req, res) => {
  if(req.isAuthenticated()) {
    res.render('compose');
  } else {
    res.redirect('/login');
  }
});

app.get('/posts/:postId/edit', (req, res) => {
  if(req.isAuthenticated()) {
    const postId = req.params.postId;
    Post.findOne({ _id: postId }, (err, post) => {
      if(err) {
        post = {title: 'Not Found', content: 'There appears to be a problem with the post id.'}
      }
      res.render('edit', {post: post});
    });
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
    res.render('post', {post: post, pageTracker: pageTracker, isLoggedIn: req.isAuthenticated() });
  });
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/about', (req, res) => {
  res.render('about');
});

// Post Routes

app.post('/posts', (req, res) => {
  if(req.isAuthenticated()) {
    const convertedMD = md.render(req.body.content)
    const post = new Post({
      title: req.body.title,
      content: convertedMD
    });
    post.save(err => {
      if(!err) {
        res.redirect('/');
      }
    });
  } else {
    res.redirect('/login');
  }
});

app.post('/login',
  passport.authenticate('local', {successRedirect: '/pages/' + pageTracker, failureRedirect: '/login'})
);

// PUT Routes

app.put('/posts/:id', (req, res) => {
  if(req.isAuthenticated()) {
    Post.findOne({ _id: req.params.id}, (err, post) => {
      if(err) {
        console.log('No post found - no updates made.');
      } else {
        post.title = req.body.title;
        post.content = req.body.content;
        post.updated = new Date();
        post.save(err => {
          if(!err) {
            res.redirect('/posts/' + req.params.id);
          }
        });
      }
    });
  } else {
    res.redirect('/login');
  }
});

// DELETE Routes

app.delete('/posts/:id', (req, res) => {
  if(req.isAuthenticated()) {
    Post.findByIdAndDelete(req.params.id, err => {
      if(err) {
        console.log(err);
      }
      res.redirect('/');
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log('Server running...');
});