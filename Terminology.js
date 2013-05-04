/*!
 * Parses pages and templates for data-i18n-token attributes, gathers the values and sends to an API.  Responses are replaced according to the type of element.
 *
 * Example:
 *
 * Button that reads "Hello" would be transformed to "¡Hola"
 *
 * Interface:
 *
 * App.Terminology.processPage().done(function(){
 *   $("body").removeAttr("data-not-permitted").show();
 * });
 *
 *
 */

App.Terminology= (function($) {
    "use strict";
    return {
        setTag: function(tag, val) {
            App.Core.ajax({ url: App.Services.Terminology.set,
                data: {
                    sid: App.User.Settings.sid,
                    account_id: App.User.Settings.accountID,
                    tag: tag,
                    value: val,
                    language: App.Core.getLanguage()
                },
                success: function (ret) {
                    console.log(ret);
                },
                type: 'post',
                dataType: "json"
            });
        },
        getTags: function(tmpl, bypassCache) {
            var tag_params = {
                tags: App.Terminology.getKeys(tmpl),
                language: App.Core.getLanguage()
            };

            // check for accountID; then vanity
            if (App.User.Settings.accountID) {
                tag_params.account_id = App.User.Settings.accountID;
            } else if (App.Settings.vanity) {
                tag_params.vanity = App.Settings.vanity;
            }

            return App.Core.ajax({ url: App.Services.Terminology.tags,
                data: tag_params,
                bypassCache: bypassCache,
                type: 'post',
                success: function (ret) {
                    //console.log(ret);
                },
                dataType: "json"
            }).pipe(function(ret){ return ret; });

        },
        getKeys: function(tmpl) {
            var i18n_keys = [];
            var html = $('[data-i18n-token], [data-i18n-value]');  // page i18n tags

            // if template, only parse it's tags
            if (tmpl) {
                html = $(tmpl).find('[data-i18n-token], [data-i18n-value]').andSelf();
            }

            // build a list of keys
            html.each(function(index) {
                var token = $(this).attr('data-i18n-token') || $(this).attr('data-i18n-value');
                if (_.indexOf(i18n_keys, token) < 0) {
                    i18n_keys.push(token);
                }
            });

            return _.compact(i18n_keys).join(',');
        },
        adminLoadData: function() {
            $('#data-table').sortableTable({
                URL : App.Services.Terminology.account_overrides,
                postParams : {account_id : App.User.Settings.accountID},
                clientSort: true,
                clientSortProperty: "tags",
                postDisplayFunction : function() {
                    $('.popover-edit').dgpopover({
                        templateData : { type : 'terminology'},
                        postDisplayFunction : function(elt) {
                            var row = $(elt).closest('tr');
                            var form = $('#edit-terminology');
                            var tag = row.attr('data-dicomgrid-terminology-tag');
                            var val = row.attr('data-dicomgrid-terminology-val');
                            if (tag) {
                                form.form('load', {tag:tag, val:val});
                            }
                        }
                    });
                }
            });
        },
        adminDeleteItem: function(tag) {
            var answer = confirm(
                App.Core.parseTextTemplate(
                    App.Core.getPrototype('#global-confirm-delete-item-message').text(),
                    {item : 'terminology'}
                ));
            if (answer){
                $.getJSON(App.Services.Terminology.set,
                    { sid:App.User.Settings.sid,
                        account_id: App.User.Settings.accountID,
                        tag: tag,
                        value: '',
                        language: App.Core.getLanguage()
                    },
                    function (ret) {
                        App.Terminology.adminLoadData();
                        App.Core.setFlashMessage(App.Core.parseTextTemplate(
                            App.Core.getPrototype('#global-item-deleted-message').text(),
                            {item : 'Terminology'}));
                        App.Core.showFlashMessage();
                    });
            }
            return false;
        },
        adminSaveForm: function(form) {
            var fm = $(form);
            var URL = App.Services.Terminology.set;

            fm.form('save',
                {URL : URL,
                    objectName : 'terminology',
                    postParams : {
                        account_id: App.User.Settings.accountID,
                        tag: fm.find('#tag').val(),
                        value: fm.find('#val').val(),
                        language: App.Core.getLanguage()
                    },
                    postSaveFunction : function() {
                        App.Terminology.adminLoadData();
                        $('#cancel-edit-name').click();
                    }});
            return false;
        },
        replaceVals: function(ret) {
            $.each(ret.values, function(key, val) {
                  var $token_el = $('[data-i18n-token="' + key +'"]');

                  $.each($token_el, function(i, el) {
                      var $el = $(el);

                      if ($el.is('[label]')) {
                        // Update label values with Terminology
                        $el.attr('label', val);
                      } else if ($el.is('[rel="tooltip"]')) {
                        // Update tooltip if one is present
                        $el.attr('title', val);
                      } else {
                        $el.html(val).andSelf().filter("[data-i18n-show=true]").show();

                        if ($el.is('[placeholder]')) {
                          // Update placeholder values with Terminology
                          $el.attr('placeholder', val);
                        }

                        if ($el.is('[value]')) {
                          // Update placeholder values with Terminology
                          $el.attr('value', val);
                        }
                      }
                  });
            });
            $('[data-i18n-token][data-i18n-show=true]').show();
        },
        processTemplate: function(tmpl, bypassCache) {
            App.Terminology.getTags(tmpl, bypassCache).done(function(ret){ App.Terminology.replaceVals(ret) });
        },
        processPage: function() {
            return App.Terminology.getTags().done(function(ret){ App.Terminology.replaceVals(ret) });
        }
    };
})(jQuery);
