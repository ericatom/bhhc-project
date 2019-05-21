var express = require('express');
var app = express();

const path = require('path');

app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.use(express.static('public'));

app.get('/', function (req, res) {
   res.render('index.html');
})

app.listen(3000, function() {
  console.log("Application is running!")
});
