import Status from "../../Status";
import URL from "../../URL";
import EventBus from "../../util/EventBus";
import EditEvents from "./EditEvents";

export default class ChangeLogTable {
    constructor() {
        this.table = $("#edit-change-detail-table")
            .on("click", "a.add-change-log", ChangeLogTable.handleAddClick)
            .on("click", "a.delete-change-log", ChangeLogTable.handleDeleteClick)
            .on("click", "a.fix-change-log", e => this.handleRestoreAdded(e))
            .on("click", "a.edit-change-log", ChangeLogTable.handleEditClick)
            .on("click", "a.save-change-log", e => this.handleSaveClick(e))
            .on("click", "a.cancel-edit-change-log", ChangeLogTable.handleCancelClick);

        EventBus.addListener("change-log-deleted-event", this.handleDeletedChange, this);
        EventBus.addListener(EditEvents.load_change_log_trigger, this.loadHistory, this);
        EventBus.addListener(EditEvents.clear_panels, this.clearTable, this);
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
            this.siteId = siteId || this.siteId;
            $.getJSON(URL.site.changeLog + "?siteId=" + this.siteId).done(
                $.proxy(this.renderTable, this)
            );
        }
    }

    renderTable(data) {
        const tBody = this.table.find("tbody");

        this.table.find("thead").html(`<tr>
            <th>action | <a href="#" class="add-change-log">add</a></th>
            <th>change id</th>
            <th>change date</th>
            <th>change type</th>
            <th>status</th>
            <th>notify</th>
            <th>date modified</th>
            <th>user modified</th>
        </tr>`);

        tBody.html("");
        $.each(data, function (index, e) {
            tBody.append(ChangeLogTable.buildRow(e));
        });

        const lastChangeType = tBody.find('tr:last td:eq(3)');
        if (lastChangeType.text() == 'UPDATE') {
            lastChangeType.html('UPDATE (<a href="#" class="fix-change-log">fix</a>)');
        }

        EventBus.dispatch(EditEvents.load_change_log_complete, true);
    }

    clearTable() {
        this.table.find("tbody, thead").html("");
        EventBus.dispatch(EditEvents.load_change_log_complete, false);
    }

    static buildRow({ dateModified: { epochSecond: t }, siteStatus: status, ...changeLog }) {
		const [y, m, d] = changeLog.changeDate.split('-');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return `<tr>
                   <td><a href="#" class="edit-change-log" data-id="${changeLog.id}">edit</a>
                       | <a href="#" class="delete-change-log" data-id="${changeLog.id}">delete</a>
                   </td>
                   <td>${changeLog.id}</td>
                   <td>${new Date(y, m - 1, d).toLocaleDateString()}</td>
                   <td>${changeLog.changeType}</td>
                   <td><span class="${ Status[status].className }">${status}</span></td>
                   <td>${changeLog.notify ? 'Yes' : 'No'}</td>
                   <td>${new Date(t * 1000)[
                       today.getTime() > t * 1000 ? 'toLocaleDateString' : 'toLocaleTimeString'
                   ]()}</td>
                   <td>${changeLog.username}</td>
               </tr>`;
    }

    static buildNotifyButton(value) {
        const notify = $('.notify-buttons').first().clone().show();
        notify.find('.btn').each((i, e) => e.classList[!i === value ? 'add' : 'remove']('active')).last().remove();
        notify.find('strong').each((i, e) => {
            e.innerHTML = i ? 'No' : 'Yes';
        });
        notify.find('input').each((i, e) => {
            if (i === 0) {
                e.value = 'Yes';
            } else {
                e.value = 'No';
            }
            if (!i === value) {
                e.setAttribute('checked', '');
            } else {
                e.removeAttribute('checked');
            }
            e.removeAttribute('name');
        });
        return notify;
    }

    static handleAddClick(event) {
        event.preventDefault();
        const status = $('#site-edit-form select[name="status"]').clone().removeProp('name');
        const notify = ChangeLogTable.buildNotifyButton(false);
        $(event.target).closest('table').find('tbody').prepend(`<tr>
            <td>
                <a href="#" class="save-change-log btn btn-primary btn-xs">save</a> |
                <a href="#" class="cancel-edit-change-log btn btn-danger btn-xs">cancel</a>
            </td>
            <td>TBD</td>
            <td><input type="date"></td>
            <td>NEW</td>
            <td>${ $('<div>').append(status).html() }</td>
            <td>${ $('<div>').append(notify).html() }</td>
            <td>NOW</td>
            <td>YOU</td>
        </tr>`);
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
        const notify = tds.eq(5);

        date.html($('<input type="date">').val(new Date(date.text()).toISOString().split('T')[0]).data('original', date.text()));
        status.html($('#site-edit-form select[name="status"]').clone().removeProp('name').val(status.text()).data('original', status.text()));
        notify.html(ChangeLogTable.buildNotifyButton(notify.text() == 'Yes').data('original', notify.text()));
        link.attr('class', 'save-change-log').addClass('btn btn-primary btn-xs').text('save').next()
            .attr('class', 'cancel-edit-change-log').addClass('btn btn-danger btn-xs').text('cancel');
    }

    handleDeletedChange(event, id) {
        const tr = this.table.find('td:nth-child(2)').filter((i, e) => e.innerHTML == id).closest('tr');
        if (tr.is(':last-child')) {
            // Change last UPDATE to ADD
            tr.prev().children(':eq(3)').text('ADD');
        }
        tr.remove();
    }

    handleRestoreAdded(event) {
        event.preventDefault();
        const link = $(event.target);
        $.post(URL.change.restoreAdded, { siteId: this.siteId }, () => link.closest('td').text('ADD'))
            .fail(jqXHR => alert(`Error occurred updating first changelog\n${jqXHR.status} : ${jqXHR.statusText}`));
    }

    handleSaveClick(event) {
        event.preventDefault();
        const link = $(event.target);
        const date = link.closest("tr").find("input[type='date']");
        const status = link.closest("tr").find("select");
        const notify = link.closest("tr").find(".btn.active input");

        // Validation
        if (!status.val() || !date.val()) {
            return alert('Please select both date and status for this change log.');
        }

        const [y, m, d] = date.val().split('-');
        if (new Date(y, m-1, d) > new Date()) {
            return alert('Please select a date not in the future');
        }

        // Submit changelog
        const changeLogId = link.data("id");
        if (confirm(`${changeLogId ? 'Update' : 'Add'} change log ${changeLogId ? 'to' : 'of'} ${status.val()} on ${date.val()}?`)) {
            $.post(changeLogId ? URL.site.changeEdit : URL.site.changeAdd, {
                [changeLogId ? 'changeId' : 'siteId']: changeLogId || this.siteId,
                changeDate: date.val(),
                siteStatus: status.val(),
                notify: notify.val()
            }, d => {
                // Just the updated row
                const updated = d.reduce((a, c) => !a || a.dateModified.epochSecond < c.dateModified.epochSecond ? c : a, null);
                // Count from end of table
                const index = d.length - d.indexOf(updated);
                const trs = link.closest('tr').siblings();

                // Remove old row
                link.closest('tr').remove();
                if (index > 1) {
                    // Mark last row as ADD
                    trs.last().children(':eq(3)').text('ADD');
                }
                if (trs.length < index) {
                    this.table.find('tbody').prepend(ChangeLogTable.buildRow(updated));
                } else {
                    if (index == 1) {
                        // Change old ADD to UPDATE
                        trs.last().children(':eq(3)').text('UPDATE');
                    }
                    trs.eq(trs.length - index).after(ChangeLogTable.buildRow(updated));
                }
            }).fail(jqXHR => alert(`Error occurred updating ${changeLogId}\n${jqXHR.status} : ${jqXHR.statusText}`));
        }
    }

    static handleCancelClick(event) {
        event.preventDefault();
        const link = $(event.target);
        const id = link.data('id');
        const inputs = link.closest("tr").find("input[type='date'], select, .btn-group");

        if (id) {
            link.closest('tr').children(':first').replaceWith(`<td>
                <a href="#" class="edit-change-log" data-id="${id}">edit</a>
                | <a href="#" class="delete-change-log" data-id="${id}">delete</a>
            </td>`);
            inputs.each((i, e) => {
                const el = $(e);
                if (e.tagName == 'SELECT') {
                    el.closest('td').html(`<span class="${ Status[el.data('original')].className }">${el.data('original')}</span>`);
                } else {
                    el.closest('td').text(el.data('original'));
                }
            });
        } else {
            link.closest('tr').remove();
        }
    }

}
