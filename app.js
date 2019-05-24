const express = require('express');
const app = express();
const fs = require('fs');
const requestPromise = require('request-promise');
const $ = require('cheerio');
const path = require('path');
const url = 'https://www.bhhc.com/careers/current-openings.aspx?state=CA&jobarea=IT';

app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.use(express.static('public'));

function parseArrays(titles, locations, websites){
  var jsonString = [];
  for(i = 0; i < titles.length; i++){
    var listing = { title : titles[i], location: locations[i], website: websites[i] }
    jsonString.push(listing);
  }

  fs.writeFile('public/listings.json', JSON.stringify(jsonString, null, 4), function(err) {
    if(err) {
      throw err;
    }
  });
}

function getListings() {
  var titles = [];
  var locations = [];
  var websites = [];
  requestPromise(url)
    .then(function(html){
      $('#CareerResults', html).each(function(i,element){
        $('.title', html).each(function(i,element){
          titles.push($(this).text());
        });
        $('.location', html).each(function(i,element){
          locations.push($(this).text());
        });
        $('.website > p > a', html).each(function(i, element){
          websites.push($(this).attr('href'));
        });
      });
    })
    .then(function(){
      titles.splice(0,1);
      locations.splice(0,1);
      parseArrays(titles,locations, websites);
    })
    .catch(function(err){
      console.log(err);
    });
}

app.get('/', function (req, res) {
   res.render('index.html');
});

app.listen(3000, function() {
  getListings();
  console.log("Application is running!")
});
