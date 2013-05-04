/* Quick "live search" for a list of elements
 * Note: App.Actions controlled access to this and other methods and it was triggered by data attributes
 *
 * <input type="text" data-action="filter-list" />

 */


$.extend(App.Actions, {
"filter-list": function(e, $el) {
    $('.tab-pane.active ul li label').each(function(i, elem) {
        var $lc_label = $(elem).text().trim().toLowerCase();
        var $lc_query = $el.val().trim().toLowerCase();

        if ($lc_label.indexOf($lc_query) != -1) {
            $(elem).closest('li').show();
        } else {
            $(elem).closest('li').hide();
        }
    });
}
});
