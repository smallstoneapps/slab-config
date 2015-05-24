var dotenv = require('dotenv');
dotenv.load();

require('newrelic');
var express = require('express');
var bodyParser = require('body-parser');
var superagent = require('superagent');
var jsxCompile = require('express-jsx');
var path = require('path');
var MongoClient = require('mongodb').MongoClient

var app = express();
app.set('port', (process.env.PORT || 9990));
app.set('view engine', 'jade');
app.use(jsxCompile(path.join(__dirname, 'static')));
app.use(bodyParser.json());
app.use(express.static('static'));

var Errors;

var clientId = process.env.SLACK_CLIENT_ID;
var clientSecret = process.env.SLACK_CLIENT_SECRET;
var redirectUrl = process.env.URL + 'callback/';
var defaultReplies = [
  { text: 'Yes' },
  { text: 'No' },
  { text: 'Thank You!' }
];

app.get('/', function (req, res) {
  res.redirect('https://apps.getpebble.com/applications/5561a6d9fd8f4b8de400004b');
});

app.get('/config', function (req, res) {
  if (req.query.slack_access_token) {
    superagent.get('https://slack.com/api/auth.test?token=' + req.query.slack_access_token).end(function (err, resp) {
      if (err) {
        console.log(err);
        return renderConfigPage();
      }
      if (! resp.ok) {
        console.log(res.error);
        return renderConfigPage();
      }
      var replies = defaultReplies;
      renderConfigPage({ username: resp.body.user, team: resp.body.team, replies: replies });
    });
  }
  else {
    renderConfigPage();
  }

  function renderConfigPage(userInfo) {
    if (userInfo) {
      res.render('config/settings', {
        userInfo: userInfo,
        customReplies: userInfo.replies,
        accessToken: req.query.slack_access_token
      });
    }
    else {
      res.render('config/login', {
        loginUrl: 'https://slack.com/oauth/authorize?client_id=' + clientId + '&redirect_uri=' + redirectUrl + '&state=STATE',
        model: req.query.model
      });
    }
  }
});

app.get('/callback', function (req, res) {
  superagent.post('https://slack.com/api/oauth.access').query({
    client_id: clientId,
    client_secret: clientSecret,
    code: req.query.code,
    redirect_uri: redirectUrl
  }).end(function (err, resp) {
    res.redirect('pebblejs://close#' + resp.body.access_token);
  });
});

app.post('/error', function (req, res) {
  var error = req.body || {};
  error.serverTime = new Date();
  error.ip = req.ip;
  error.userAgent = req.headers['user-agent'];
  Errors.insert(error);
  res.status(200);
  res.send('ok');
});

MongoClient.connect(process.env.MONGOLAB_URI, function(err, db) {
  Errors = db.collection('errors');
});

var server = app.listen(app.get('port'), function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Slab config server listening at http://%s:%s', host, port);
});
