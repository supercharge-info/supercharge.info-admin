import EventBus from "../../util/EventBus";
import URL from "../../URL";
import EditEvents from "./EditEvents";

/**
 * listens for: 'site-selected-for-edit-event'
 *
 * loads the site from remote
 *
 * then fires: 'site-loaded-for-edit-event'
 */
export default class SiteLoadAction {
    constructor() {
        this.siteEditForm = $('#site-edit-form');
        EventBus.addListener(EditEvents.site_edit_selection, this.loadForEdit, this);
    }

    loadForEdit(event, siteId) {
        $.getJSON(URL.site.load + "?siteId=" + siteId, function (site) {
            EventBus.dispatch(EditEvents.site_loaded, site);
        });
    }

}
