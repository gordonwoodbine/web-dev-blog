const express = require('express');
const helmet = require('helmet');
const { posts } = require('./testPosts');

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(helmet());

app.get('/', (req, res) => {
  res.render('index', {posts: posts});
})

app.listen(process.env.PORT || 5000, () => {
  console.log('Server running...');
});