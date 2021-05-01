// Imports

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const dotenv = require('dotenv');

const app = express();
dotenv.config();

// Configure Express

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(helmet());

// Configure Mongoose

mongoose.connect(process.env.MONGO_STR, {useNewUrlParser: true, useUnifiedTopology: true});

const postSchema = {
  title: String,
  content: String,
  date: {type: Date, default: Date.now }
}

const Post = mongoose.model('Post', postSchema);

// Routes

app.get('/', (req, res) => {
  Post.find({}, (err, posts) => {
    res.render('index', {posts: posts});
  });
});

app.get('/compose', (req, res) => {
  res.render('compose');
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
})

app.listen(process.env.PORT, () => {
  console.log('Server running...');
});