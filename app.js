const express = require('express');
const app = express();
const fs = require('fs');
const requestPromise = require('request-promise');
const $ = require('cheerio');
const path = require('path');
const url = 'https://www.bhhc.com/careers/current-openings.aspx?state=CA&jobarea=IT';

//specify EJS template for html files
app.engine('html', require('ejs').renderFile);
//specify where template files are located
app.set('views', path.join(__dirname, 'views'));
//specify which template engine to use
app.set('view engine', 'html');
//serve files inside the public directory so they are accessible to index.html
app.use(express.static('public'));

/* -------------- parseArrays() Function --------------
 This function will group together the job data for each
 listing and format the data arrays into JSON data and
 write to a JSON file. -------------------------------*/
function parseArrays(titles, locations, websites){
  var jsonString = [];
  //create a object that contains the job data for each job listing
  for(i = 0; i < titles.length; i++){
    var listing = { title : titles[i], location: locations[i], website: websites[i] }
    //add object to an array
    jsonString.push(listing);
  }
  //write string of job listings to a file after converting it to JSON format
  fs.writeFile('public/listings.json', JSON.stringify(jsonString, null, 4), function(err) {
    if(err) {
      throw err;
    }
  });
}

/* -------------- getListings() Function --------------
 This function will scrape the BHHC job listings site
 for the job data that we want and call parseArrays to
 format the collected data. -------------------------*/
function getListings() {
  //initialize arrays to hold specific job data
  var titles = [];
  var locations = [];
  var websites = [];
  //HTTP request to crawl the given url
  requestPromise(url).then(function(html){
    //for each job element of CareerResults div, collect data
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
  }).then(function(){
    //remove one element of each array starting at index 0
    titles.splice(0,1);
    locations.splice(0,1);
    //pass job data to parseArrays
    parseArrays(titles,locations, websites);
  }).catch(function(err){
    //if request fails, output the error
    console.log(err);
  });
}

//handles GET request from user so pass back the index page
app.get('/', function (req, res) {
   res.render('index.html');
});

//when app.js is run, calls getListings() and listens for requests on port 3000
app.listen(3000, function() {
  getListings();
  console.log("Application is running!")
});
