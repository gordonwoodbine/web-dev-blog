// Imports

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');

const app = express();

// Configure Express

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(helmet());

// Configure Mongoose

mongoose.connect('mongodb://localhost:27017/blogDB', {useNewUrlParser: true, useUnifiedTopology: true});

const postSchema = {
  title: String,
  content: String,
  date: {type: Date, default: Date.now }
}

const Post = mongoose.model('Post', postSchema);

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

app.listen(process.env.PORT || 5000, () => {
  console.log('Server running...');
});