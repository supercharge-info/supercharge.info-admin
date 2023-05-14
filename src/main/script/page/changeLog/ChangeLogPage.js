import $ from "jquery";
import 'datatables.net';
import 'datatables.net-bs';
import EventBus from "../../util/EventBus";
import ChangeLogDeleteAction from "./ChangeLogDeleteAction";
import URL from "../../URL";
import xss from 'xss-filters';


export default class ChangeLogPage {
    constructor() {
        this.changeLogListTable = $("#change-log-list-table");
        new ChangeLogDeleteAction();
        EventBus.addListener("change-log-deleted-event", this.loadChangeLogList, this);
    }

    onPageShow() {
        this.loadChangeLogList();
    };

    loadChangeLogList() {
        $.getJSON(URL.change.list, $.proxy(this.populateSystemPropsTable, this));
    };

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
                    { data: 'date', searchable: false },
                    { data: 'changeType' },
                    { data: 'siteName', render: xss.inHTMLData },
                    { data: 'region' },
                    { data: 'country' },
                    { data: 'siteStatus' }
                ]
            });
        } else {
            this.dataTable.clear().rows.add(changeLogs).draw();
        }
    }

    static handleDeleteClick(event) {
        event.preventDefault();
        const link = $(event.target);
        const siteName = link.parents("tr").find("td").eq(4).html();
        if (confirm(`Delete change log for ${xss.inHTMLData(siteName)}?`)) {
            const changeLogId = link.data("id");
            EventBus.dispatch("change-log-selected-for-delete-event", changeLogId);
        }
    }


};
