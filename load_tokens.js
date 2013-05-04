#!/usr/bin/env node

/*
 * Script to load/clear terminology tokens into an account
 */

var fs          = require('fs'),
    request     = require('request'),
    base_url    = '', // http://app.dev
    login       = '', // Admin user
    password    = '', // pass
    vanity      = '', // dg
    account_id  = '', //'',
    language    = '', // 'en'
    token_csv   = '', // full path to tokens.csv
    reset       = false, // set to true and run script to clear tokens
    tokens      = [];

if (!base_url) {
  console.error('base_url must be defined');
  process.exit(1);
}

if (!language) {
  console.error('language must be defined');
  process.exit(1);
}

if (!login && !password) {
  console.error('login and password must be defined');
  process.exit(1);
}

if (!vanity && !account_id) {
  console.error('vanity and account_id must be defined');
  process.exit(1);
}

fs.readFile(token_csv, 'utf8', function (err, data) {
  if (err) throw err;
  tokens = data.split("\n");
});

function set_term(sid, tag, val) {
  request.post(
    base_url + '/api/v3/terminology/set',
    { form: {
        sid: sid, account_id: account_id, tag: tag, value: val, language: language
      }
    },
    function (error, response, body) {
        console.log(body);
    }
  );
}

request.post(
    base_url + '/api/v3/session/login',
    { form: { login: login, password: password, vanity: vanity } },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var b = JSON.parse(body);

          tokens.forEach(function(tok) {
              var t = tok.split(',');
              if (t[0]) {
                if (reset) {
                  set_term(b.sid, t[0], undefined);
                } else {
                  set_term(b.sid, t[0], t[2]);
                }
              }
          });

        }
    }
);

