import EventBus from "../../util/EventBus";
import URL from "../../URL";
import $ from "jquery";
import EditEvents from './EditEvents'

/**
 * listens for: site-selected-for-delete-event
 *
 * delete site
 *
 * then fires: 'change-log-deleted-event'
 */
export default class SiteDeleteAction {

    constructor() {
        EventBus.addListener(EditEvents.site_delete_selection, this.deleteSite, this);
    }

    deleteSite(event, siteId, siteName) {
        if (confirm("Delete site " + siteName + "?")) {
            $.get(URL.site.delete + "?siteId=" + siteId, function () {
                EventBus.dispatch(EditEvents.site_list_changed);
            }).fail(function (jqXHR) {
                if(jqXHR.status === 403) {
                    alert(`Insufficient privileges to delete site ${siteId}.`);
                } else {
                    alert(`Error occurred while deleting site ${siteId}: status=${jqXHR.status} statusText=${jqXHR.statusText}.`);
                }
            });
        }
    };

}
;
