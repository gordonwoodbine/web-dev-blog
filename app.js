const express = require('express');

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index');
})

app.listen(process.env.PORT || 5000, () => {
  console.log('Server running...');
});