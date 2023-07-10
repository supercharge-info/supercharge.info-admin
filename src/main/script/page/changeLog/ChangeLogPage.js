import 'datatables.net';
import 'datatables.net-bs';
import EventBus from "../../util/EventBus";
import ChangeLogDeleteAction from "./ChangeLogDeleteAction";
import URL from "../../URL";
import { sanitize } from 'dompurify';


export default class ChangeLogPage {
    constructor() {
        this.changeLogListTable = $("#change-log-list-table");
        new ChangeLogDeleteAction();
        EventBus.addListener("change-log-deleted-event", this.loadChangeLogList, this);
    }

    onPageShow() {
        this.loadChangeLogList();
    }

    loadChangeLogList() {
        $.getJSON(URL.change.list, $.proxy(this.populateSystemPropsTable, this));
    }

    populateSystemPropsTable(changeLogs) {
        if (!this.dataTable) {
            this.changeLogListTable.on("click", "a.change-log-delete-trigger", ChangeLogPage.handleDeleteClick);

            const tableHead = this.changeLogListTable.find("thead");
            tableHead.html("" +
                "<tr>" +
                "<th>Action</th>" +
                "<th>Id</th>" +
                "<th>Date</th>" +
                "<th>Change Type</th>" +
                "<th>Site Name</th>" +
                "<th>Site Region</th>" +
                "<th>Site Country</th>" +
                "<th>Site Status</th>" +
                "</tr>" +
                "");
            this.dataTable = this.changeLogListTable.DataTable({
                data: changeLogs,
                order: [[1, 'desc']],
                lengthMenu: [25, 100, 1000, 20000],
                columns: [
                    {
                        data: null,
                        searchable: false,
                        render: (d,t,r) =>
                            `<a href="#" class="change-log-delete-trigger" data-id="${r.id}">delete</a>`
                    },
                    { data: 'id' },
                    { data: 'date', searchable: false, render: (d, t) => t == 'sort' ? d : new Date(d).toLocaleDateString('en-US') },
                    { data: 'changeType', searchable: false },
                    { data: 'siteName', render: sanitize },
                    { data: 'region' },
                    { data: 'country' },
                    { data: 'siteStatus' }
                ],
                dom: "<'row'<'col-sm-4'f><'col-sm-4 dataTables_middle dataTables_title'><'col-sm-4'l>>"
                    + "<'row'<'col-sm-12'tr>><'row'<'col-sm-5'i><'col-sm-7'p>>"
            });
            $(this.dataTable.table().container()).find('.row:first > div:eq(1)').text('All Changes');
            $(window).keydown($.proxy(this.handleFindShortcut, this));
        } else {
            this.dataTable.clear().rows.add(changeLogs).draw();
        }
    }

    handleFindShortcut(event) {
        if (this.changeLogListTable.closest('.page').is(':visible') && String.fromCharCode(event.which) == "F" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();

            const navHeight = $('.navbar-header').height() || $('.navbar').height();
            const input = $(this.dataTable.table().container()).find('input');
            $('html').animate({ scrollTop: input.offset().top - navHeight - 10 }, { complete: () => input.focus() });
        }
    }

    static handleDeleteClick(event) {
        event.preventDefault();
        const link = $(event.target);
        const siteName = link.closest("tr").find("td").eq(4).text();
        if (confirm(`Delete change log for ${siteName}?`)) {
            const changeLogId = link.data("id");
            EventBus.dispatch("change-log-selected-for-delete-event", changeLogId);
        }
    }


}
