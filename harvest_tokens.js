/*
 * Populate the variables in all caps for the script to work.
 *
 * OR
 *
 * Pass them in as variables on the command line:
 *
 * casperjs scripts/tokens.js --url='http://app.dev/' --share_code='korg' --login='kold@app.com' --pass='PASS'
 *
 * It can be run manually and will provide a list of all keys and values.
 * casperjs tokens.js
 *
 * To sort and remove duplicates:
 *
 * casperjs tokens.js | sort | uniq
 *
 * A Jake task has been provided to run the command above.
 *
 * jake tokens
 *
 */

var casper = require('casper').create({
    //verbose: true,
    //logLevel: 'debug'
});

var BASE_URL = casper.cli.raw.get('url'),
    SHARE_CODE = casper.cli.raw.get('share_code'),
    LOGIN = casper.cli.raw.get('login'),
    PASS = casper.cli.raw.get('pass'),
    tokens = [];

if (LOGIN === '') {
  console.log('Populate or pass BASE_URL, SHARE_CODE, LOGIN, PASS via flags to run');
  casper.exit();
}

function getmessages() {
    return _.map(DG.Messages, function(val, key) { return '"' + key + '","' + val + '"' });
}

function gettokens() {
    var global_tokens = $('[data-i18n-token], [data-i18n-value]');
    var tokens = [];
    
    $.each(global_tokens, function(i, e) {
        var v;
        if ($(e).prop("tagName").toLowerCase() === 'option') {
          v = $(e).text();
        } else if ($(e).prop("tagName").toLowerCase() === 'optgroup') {
          v = $(e).attr('label');
        } else {
          v = $(e).attr('title') || $(e).attr('placeholder') || $(e).attr('value') || $(e).text().trim();
        }
        var t = $(e).attr('data-i18n-token') || $(e).attr('data-i18n-value');
       
        tokens.push('"' + t + '","' + v + '"');
    });

    return tokens;
}

function gettemplates() {
    var styles = $('#prototypes style');
    var tokens = [];

    // loop over all templates in #prototypes
    $.each(styles, function(i, el) {
        // compile template with empty structure
        var tmpl = Mustache.to_html($(el).html(), {});
        // get all i18n tokens from template
        var toks = $(tmpl).find('[data-i18n-token], [data-i18n-value]');
        $.each(toks, function(i, e) {
          var v;
          if ($(e).prop("tagName").toLowerCase() === 'option') {
            v = $(e).text().trim();
          } else if ($(e).prop("tagName").toLowerCase() === 'optgroup') {
            v = $(e).attr('label');
          } else {
            v = $(e).attr('title') || $(e).attr('placeholder') || $(e).attr('value') || $(e).text().trim();
          }
          var t = $(e).attr('data-i18n-token') || $(e).attr('data-i18n-value');

          tokens.push('"' + t + '","' + v + '"');
        });
    });

    return tokens;
}

casper.start(BASE_URL, function() {
    tokens = this.evaluate(gettokens);
    tokens = tokens.concat(this.evaluate(gettemplates));
    tokens = tokens.concat(this.evaluate(getmessages));
    this.fill('form', {
             login: LOGIN,
             password: PASS
    });
                                         
    this.click("#submit");
});

casper.waitForSelector('#studies-count', function() {
    tokens = tokens.concat(this.evaluate(gettokens));
    tokens = tokens.concat(this.evaluate(gettemplates));
});

var links = [
  '/activities',
  ,'/organization/users.html', '/organization/user.html'
  ,'/organization/roles.html', '/organization/role.html'
  ,'/organization/users.html', '/organization/user.html'
  ,'/organization/locations.html', '/organization/groups.html'
  ,'/organization/gateways.html', '/download.html'
  ,'/organization/destinations.html', '/organization/destination.html'
  ,'/organization/routing_rules.html', '/organization/routing_rule.html'
  ,'/organization/sharing_rules.html', '/organization/settings.html'
  ,'/organization/terminology.html', '/user.html'
  ,'/support.html', '/load.html'
  ,'/locker', '/share/' + SHARE_CODE
];

casper.each(links, function(self, link) {
    this.thenOpen(BASE_URL + link).waitForSelector('h1', function() {
        tokens = tokens.concat(this.evaluate(gettokens));
        tokens = tokens.concat(this.evaluate(gettemplates));
    });
});

casper.run(function() {
    this.echo(tokens.join('\n')).exit();
});


