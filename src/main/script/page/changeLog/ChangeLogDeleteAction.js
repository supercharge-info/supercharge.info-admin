import $ from "jquery";
import EventBus from "../../util/EventBus";
import URL from "../../URL";


/**
 * listens for: 'change-log-selected-for-delete-event'
 *
 * delete change log
 *
 * then fires: 'change-log-deleted-event'
 *
 */
export default class ChangeLogDeleteAction {
    constructor() {
        EventBus.addListener("change-log-selected-for-delete-event", this.deleteChange, this);
    }

    deleteChange(event, changeLogId) {
        $.get(URL.change.delete + "/" + changeLogId, function () {
            EventBus.dispatch("change-log-deleted-event");
        }).fail(function (jqXHR) {
            alert("Error occurred while deleting " + changeLogId + "\n"
                + jqXHR.status + " : " + jqXHR.statusText);
        });
    }

}

