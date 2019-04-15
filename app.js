const express = require('express');
const apiCallFromRequest = require('./Request');
const _ = require('underscore');

const app = express();
app.set('view engine', 'ejs');

const port = process.env.PORT || 3000;
const bookRouter = express.Router();
var merged = [];
var pageSize = 8;
var recentDate ='';

bookRouter.route('/books')
  .get((req, res) => {
    let start_time = new Date().getTime();

    if(!req.query.hasOwnProperty('q'))
    {
      res.render('books', { searchBook:'',  data: {}});
    }
    else
    {
      var qs = [];
      qs.push(['q', req.query.q]);
      qs.push(['startIndex', req.query.currentPage === undefined ? 1 : req.query.currentPage]);
      qs.push(['maxResults',20]);

      let queryString = {};
      queryString['q'] = req.query.q;
      queryString['startIndex'] = req.query.currentPage === undefined ? 1 : req.query.currentPage;
      queryString['maxResults'] = 20;
    
      apiCallFromRequest.callApi(qs, function (response) {
        _.map(response.items, function (book) { mergeAuthors(book) });

        response.searchText = req.query.q;
        response.totalCount = response.totalItems;
        response.mostCommonAuthor = getMostCommonAuthor(merged);
        mostRecentPublishDate(req, function() {
          response.mostRecentPublishDate = recentDate;
          response.serverResponseTime = new Date().getTime() - start_time;
          response.currentPage = queryString.startIndex;
          response.nextPage = parseInt(queryString.startIndex) + 1;
          response.prevPage = parseInt(queryString.startIndex) - 1;
          response.pageCount = response.totalItems > 0 ? response.totalItems / pageSize : 0;
          res.render('books', { searchBook: req.query.q, data: response });
        });

      });
    }
  });

const mergeAuthors = function (book) {
  if(book.volumeInfo.hasOwnProperty('authors'))
  {
    for (let i = 0; i < book.volumeInfo.authors.length; i++) {
      merged.push(book.volumeInfo.authors[i]);
    }
  }
}

// Get top 1 book from the list of volumes orered by newest first.
// we will use the publishedDate of this book as the latestPublishDate 

function mostRecentPublishDate (req, callback){
  let qs = [];
  if(!req.query.hasOwnProperty('q'))
    {
      callback(recentDate);
    }
  else
    {
      qs.push(['q', req.query.q]);
      qs.push(['maxResults', 1]);
      qs.push(['orderBy', 'newest']);
      apiCallFromRequest.callApi(qs, function (resp) {
      recentDate = resp.hasOwnProperty('items') ? resp.items[0].volumeInfo.publishedDate : '';
      callback(recentDate);
      });
    }
};

function getMostCommonAuthor(arr) {
  return arr.sort((a, b) =>
    arr.filter(v => v === a).length
    - arr.filter(v => v === b).length
  ).pop();
};

app.use('/api', bookRouter);

app.get('/', (req, res) => {
  res.send('Welcome to my Nodemon API!');
});

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});


