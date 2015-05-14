var express = require('express');
var superagent = require('superagent');

var app = express();
app.set('port', (process.env.PORT || 9990));

var clientId = '4851112196.4902647071';
var clientSecret = 'd77b041e0fc37e3993f70217a47f8e19';
var redirectUrl = 'https://slab-for-pebble.herokuapp.com/callback'

app.get('/', function (req, res) {
  res.redirect('https://slack.com/oauth/authorize?client_id=4851112196.4902647071&redirect_uri=' + redirectUrl + '&state=STATE');
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
  console.log('Example app listening at http://%s:%s', host, port);
});
