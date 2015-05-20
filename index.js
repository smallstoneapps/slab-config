var express = require('express');
var superagent = require('superagent');
var jsxCompile = require('express-jsx');
var path = require('path');

var app = express();
app.set('port', (process.env.PORT || 9990));
app.set('view engine', 'jade');
app.use(jsxCompile(path.join(__dirname, 'static')));
app.use(express.static('static'));

var clientId = '4851112196.4902647071';
var clientSecret = 'd77b041e0fc37e3993f70217a47f8e19';
var redirectUrl = 'https://slab-for-pebble.herokuapp.com/callback';
var defaultReplies = [
  { text: 'Yes' },
  { text: 'No' },
  { text: 'Thank You!' }
];

app.get('/', function (req, res) {
  res.redirect('https://apps.getpebble.com/applications/');
});

app.get('/config', function (req, res) {
  if (req.query.slack_access_token) {
    superagent.get('https://slack.com/api/auth.test?token=' + req.query.slack_access_token).end(function (err, res) {
      if (err) {
        console.log(err);
        return renderConfigPage();
      }
      if (! res.ok) {
        console.log(res.error);
        return renderConfigPage();
      }
      var replies = defaultReplies;
      renderConfigPage({ username: res.body.user, team: res.body.team, replies: replies });
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
        loginUrl: 'https://slack.com/oauth/authorize?client_id=4851112196.4902647071&redirect_uri=' + redirectUrl + '&state=STATE',
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
  }).end(function (err, res) {
    res.redirect('pebblejs://close#' + res.body.access_token);
  });
});

var server = app.listen(app.get('port'), function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Slab config server listening at http://%s:%s', host, port);
});
