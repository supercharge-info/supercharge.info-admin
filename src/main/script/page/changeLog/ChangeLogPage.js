import 'datatables.net';
import 'datatables.net-bs';
import 'datatables.net-responsive';
import EventBus from "../../util/EventBus";
import ChangeLogDeleteAction from "./ChangeLogDeleteAction";
import Status from "../../Status";
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
        $.getJSON(URL.change.list, $.proxy(this.populateChanges, this));
    }

    populateChanges(changeLogs) {
        if (!this.dataTable) {
            this.changeLogListTable.on("click", "a.change-log-delete-trigger", ChangeLogPage.handleDeleteClick);

            this.changeLogListTable.find("thead").html(`<tr>
                <th>Action</th>
                <th>Id</th>
                <th>Date</th>
                <th>Change Type</th>
                <th>Site Name</th>
                <th>Site Region</th>
                <th>Site Country</th>
                <th>Site Status</th>
            </tr>`);
            this.dataTable = this.changeLogListTable.DataTable({
                data: changeLogs,
                order: [[1, 'desc']],
                lengthMenu: [25, 100, 1000, 20000],
                columns: [
                    {
                        data: null,
                        searchable: false,
                        render: (d,t,r) =>
                            `<a href="#" class="change-log-delete-trigger" data-id="${r.id}">delete</a>`,
                        className: 'all'
                    },
                    { data: 'id' },
                    { data: 'date', searchable: false, render: (d, t) => {
                        const [ y, m, day ] = d.split('-');
                        return t == 'sort' ? d : new Date(y, m - 1, day).toLocaleDateString();
                    }, className: 'all' },
                    { data: 'changeType', searchable: false },
                    { data: 'siteName', render: sanitize, className: 'all' },
                    { data: 'region' },
                    { data: 'country', className: 'all' },
                    {
                        data: 'siteStatus',
                        render: d => `<span class="${ Status[d].className }">${ d }</span>`,
                        className: 'all'
                    }
                ],
                dom: "<'row'<'col-sm-4'f><'col-sm-4 dataTables_middle dataTables_title'><'col-sm-4'l>>"
                    + "<'row'<'col-sm-12'tr>><'row'<'col-sm-5'i><'col-sm-7'p>>",
                responsive: {
                    details: false
                }
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
            const position = $(window).scrollTop();
            const input = $(this.dataTable.table().container()).find('input');
            const options = {};

            // Perform scroll
            if (position + navHeight <= input.offset().top && position + $(window).height() >= input.offset().top + input.height()) {
                input.focus().select();
            } else {
                options.complete = () => input.focus().select();
            }
            $('html').animate({ scrollTop: input.offset().top - navHeight - 10 }, options);
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
