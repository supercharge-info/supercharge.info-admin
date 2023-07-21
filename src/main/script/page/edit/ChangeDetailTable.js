import URL from "../../URL";
import EventBus from "../../util/EventBus";
import EditEvents from "./EditEvents";
import { sanitize } from 'dompurify';

export default class ChangeDetailView {
    constructor() {
        this.table = $("#edit-site-detail-table");
        EventBus.addListener(EditEvents.load_history_trigger, this.loadHistory, this);
        EventBus.addListener(EditEvents.clear_panels, this.clearTable, this);
    }

    loadHistory(event, siteId) {
        if (this.table.find("tbody, thead").children().length) {
            this.clearTable();
        } else {
            $.getJSON(URL.site.changeDetail + "?siteId=" + siteId).done(
                $.proxy(this.renderTable, this)
            );
        }
    }

    renderTable(data) {
        const tBody = this.table.find("tbody").html("");
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.table.find("thead").html(`<tr>
            <th>version</th>
            <th>change date</th>
            <th>change by</th>
            <th>field</th>
            <th>old value</th>
            <th>new value</th>
        </tr>`);
        $.each(data, function (index, {changeDate: { epochSecond: d }, ...e}) {
            tBody.append(`<tr>
                <td>${e.version}</td>
                <td>${new Date(d * 1000)[
                    today.getTime() > d * 1000 ? 'toLocaleDateString' : 'toLocaleTimeString'
                ]()}</td>
                <td>${sanitize(e.username)}</td>
                <td>${e.fieldName}</td>
                <td>${sanitize(e.oldValue)}</td>
                <td>${sanitize(e.newValue)}</td>
            </tr>`);
        });

        EventBus.dispatch(EditEvents.load_history_complete, true);
    }

    clearTable() {
        this.table.find("tbody, thead").html("");
        EventBus.dispatch(EditEvents.load_history_complete, false);
    }
}
