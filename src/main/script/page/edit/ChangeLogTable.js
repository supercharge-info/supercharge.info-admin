import URL from "../../URL";
import EventBus from "../../util/EventBus";
import EditEvents from "./EditEvents";

export default class ChangeLogView {
    constructor() {
        this.table = $("#edit-change-detail-table").on("click", "a.delete-change-log", ChangeLogView.handleDeleteClick);

        EventBus.addListener(EditEvents.load_change_log_trigger, this.loadHistory, this);
        EventBus.addListener(EditEvents.site_edit_selection, this.clearTable, this);
        EventBus.addListener(EditEvents.site_delete_selection, this.clearTable, this);
    }

    loadHistory(event, siteId) {
        if (this.table.find("tbody, thead").children().length) {
            this.clearTable();
        } else {
            $.getJSON(URL.site.changeLog + "?siteId=" + siteId).done(
                $.proxy(this.renderTable, this)
            );
        }
    }

    renderTable(data) {
        const tHead = this.table.find("thead");
        const tBody = this.table.find("tbody");

        tHead.html("" +
            `<tr>
                <th>change id</th>
                <th>change date</th>
                <th>change type</th>
                <th>status</th>
                <th>action</th>
            </tr>`
        );

        tBody.html("");
        $.each(data, function (index, e) {
            tBody.append(
                `<tr>
                    <td>${e.id}</td>
                    <td>${new Date(e.date).toLocaleDateString('en-US')}</td>
                    <td>${e.changeType}</td>
                    <td>${e.siteStatus}</td>
                    <td><a href="#" class="delete-change-log" data-id="${e.id}">delete</a></td>
                </tr>`
            );
        });

        EventBus.dispatch(EditEvents.load_change_log_complete, true);
    }

    clearTable() {
        this.table.find("tbody, thead").html("");
        EventBus.dispatch(EditEvents.load_change_log_complete, false);
    }

    static handleDeleteClick(event) {
        event.preventDefault();
        const link = $(event.target);
        const tds = link.closest("tr").find("td");
        const date = tds.eq(1).text();
        const status = tds.eq(3).text();
        if (confirm(`Delete change log ${status} on ${date}?`)) {
            //const changeLogId = link.data("id");
            //EventBus.dispatch("change-log-selected-for-delete-event", changeLogId);
            alert("Not implemented");
        }
    }
}
