import URL from "../../URL";
import EventBus from "../../util/EventBus";
import EditEvents from "./EditEvents";

export default class ChangeLogTable {
    constructor() {
        this.table = $("#edit-change-detail-table")
            .on("click", "a.delete-change-log", ChangeLogTable.handleDeleteClick)
            .on("click", "a.edit-change-log", ChangeLogTable.handleEditClick)
            .on("click", "a.save-change-log", e => this.handleSaveClick(e));

        EventBus.addListener("change-log-deleted-event", this.loadHistory, this);
        EventBus.addListener(EditEvents.load_change_log_trigger, this.loadHistory, this);
        EventBus.addListener(EditEvents.site_edit_selection, this.clearTable, this);
        EventBus.addListener(EditEvents.site_delete_selection, this.clearTable, this);
    }

    loadHistory(event, siteId) {
        if (siteId && this.table.find("tbody, thead").children().length) {
            // This only needs to be called when the toggle button is pressed
            // so site id will always be provided
            this.siteId = null;
            this.clearTable();
        } else if (siteId || this.siteId) {
            // Hack to allow table to refresh when any change is deleted.
            // This is useful because editors can update/delete changelogs
            // within form or delete changelogs on changelogs page
            siteId = this.siteId = siteId || this.siteId;
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
                <th>action</th>
                <th>change id</th>
                <th>change date</th>
                <th>change type</th>
                <th>status</th>
                <th>date modified</th>
                <th>user modified</th>
            </tr>`
        );

        tBody.html("");
        $.each(data, function (index, e) {
            tBody.append(ChangeLogTable.buildRow(e));
        });

        EventBus.dispatch(EditEvents.load_change_log_complete, true);
    }

    clearTable() {
        this.table.find("tbody, thead").html("");
        EventBus.dispatch(EditEvents.load_change_log_complete, false);
    }

    static buildRow(changeLog) {
		const [y, m, d] = changeLog.changeDate.split('-');
        return `<tr>
                   <td><a href="#" class="edit-change-log" data-id="${changeLog.id}">edit</a>
                       | <a href="#" class="delete-change-log" data-id="${changeLog.id}">delete</a>
                   </td>
                   <td>${changeLog.id}</td>
                   <td>${new Date(y, m - 1, d).toLocaleDateString('en-US')}</td>
                   <td>${changeLog.changeType}</td>
                   <td>${changeLog.siteStatus}</td>
                   <td>${new Date(changeLog.dateModified.epochSecond * 1000).toLocaleString('en-US')}</td>
                   <td>${changeLog.username}</td>
               </tr>`;
    }

    static handleDeleteClick(event) {
        event.preventDefault();
        const link = $(event.target);
        const tds = link.closest("tr").find("td");
        const date = tds.eq(1).text();
        const status = tds.eq(3).text();

        if (confirm(`Delete change log ${status} on ${date}?`)) {
            const changeLogId = link.data("id");
            EventBus.dispatch("change-log-selected-for-delete-event", changeLogId);
        }
    }

    static handleEditClick(event) {
        event.preventDefault();
        const link = $(event.target);
        const tds = link.closest("tr").find("td");
        const date = tds.eq(2);
        const status = tds.eq(4);

        date.html($('<input type="date">').val(new Date(date.text()).toISOString().split('T')[0]));
        status.html($('#site-edit-form select[name="status"]').clone().removeProp('name').val(status.text()));
        link.attr('class', 'save-change-log').text('save');
    }

    handleSaveClick(event) {
        event.preventDefault();
        const link = $(event.target);
        const date = link.closest("tr").find("input");
        const status = link.closest("tr").find("select");

        if (status.val() && date.val()) {
            const changeLogId = link.data("id");
            if (confirm(`Update change log to ${status.val()} on ${date.val()}?`)) {
                $.post(URL.site.changeEdit, {
                    changeId: changeLogId,
                    changeDate: date.val(),
                    siteStatus: status.val()
                }, d => {
                    this.renderTable(d);
                }).fail(jqXHR => alert(`Error occurred updating ${changeLogId}\n${jqXHR.status} : ${jqXHR.statusText}`));
            }
        } else {
            alert('Please select both date and status for this change log.');
        }
    }

}
