const express = require('express');
const helmet = require('helmet');
const _ = require('lodash');
const { posts } = require('./testPosts');

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(helmet());

console.log(_.kebabCase('My First Post'));
console.log(_.kebabCase('Another Blog Post'));

app.get('/', (req, res) => {
  res.render('index', {posts: posts});
});

app.get('/compose', (req, res) => {
  res.render('compose');
});

app.get('/posts/:postTitle', (req, res) => {
  const requestedPost = _.lowerCase(req.params.postTitle);
  posts.forEach(post => {
    if(_.lowerCase(post.title) === requestedPost) {
      res.render('post', {postTitle: post.title, postBody: post.body})
    }
  });
});

app.post('/compose', (req, res) => {
  const newPost = {
    title: req.body.title,
    body: req.body.body,
    slug: _.kebabCase(req.body.title),
    postDate: new Date().toLocaleString()
  }

  posts.push(newPost);
  res.redirect('/');
})

app.listen(process.env.PORT || 5000, () => {
  console.log('Server running...');
});