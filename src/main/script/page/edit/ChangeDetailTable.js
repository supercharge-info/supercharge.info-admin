import $ from "jquery";
import URL from "../../URL";
import EventBus from "../../util/EventBus";
import EditEvents from "./EditEvents";
import xss from 'xss-filters';

export default class ChangeDetailView {
    constructor() {
        this.table = $("#edit-change-detail-table");
        EventBus.addListener(EditEvents.load_history_trigger, this.loadHistory, this);
        EventBus.addListener(EditEvents.site_edit_selection, this.clearTable, this);
        EventBus.addListener(EditEvents.site_delete_selection, this.clearTable, this);
    }

    loadHistory(event, siteId) {
        $.getJSON(URL.site.changeDetail + "?siteId=" + siteId).done(
            $.proxy(this.renderTable, this)
        );
    }

    renderTable(data) {

        this.table.show();

        const tHead = this.table.find("thead");
        const tBody = this.table.find("tbody");

        tHead.html("" +
            `<tr>
                <th>version</th>
                <th>change date</th>
                <th>change by</th>
                <th>field</th>
                <th>old value</th>
                <th>new value</th>
            </tr>`
        );

        tBody.html("");
        $.each(data, function (index, e) {
            tBody.append(
                `<tr>
                    <td>${e.version}</td>
                    <td>${new Date(e.changeDate.epochSecond * 1000).toLocaleString('en-US')}</td>
                    <td>${xss.inHTMLData(e.username)}</td>
                    <td>${e.fieldName}</td>
                    <td>${xss.inHTMLData(e.oldValue)}</td>
                    <td>${xss.inHTMLData(e.newValue)}</td>
                </tr>`
            );
        })

    }

    clearTable() {
        this.table.find("tbody").html("");
        this.table.hide();
    }
}