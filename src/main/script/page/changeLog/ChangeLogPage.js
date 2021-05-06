import $ from "jquery";
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
        const tableHead = this.changeLogListTable.find("thead");
        const tableBody = this.changeLogListTable.find("tbody");
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
        tableBody.html("");
        $.each(changeLogs, function (index, changeLog) {
            tableBody.append("" +
                `<tr>
                <td><a href='' class='change-log-delete-trigger' data-id='${changeLog.id}'>delete</a></td>
                <td>${changeLog.id}</td>
                <td>${changeLog.date}</td>
                <td>${changeLog.changeType}</td>
                <td>${xss.inHTMLData(changeLog.siteName)}</td>
                <td>${changeLog.region}</td>
                <td>${changeLog.country}</td>
                 <td>${changeLog.siteStatus}</td>
                </tr>`
            );

        });

        $(".change-log-delete-trigger").on("click", ChangeLogPage.handleDeleteClick);
    };

    static handleDeleteClick(event) {
        event.preventDefault();
        const link = $(event.target);
        const siteName = link.parents("tr").find("td").eq(4).html();
        if (confirm(`Delete change log for ${xss.inHTMLData(siteName)}?`)) {
            const changeLogId = link.data("id");
            EventBus.dispatch("change-log-selected-for-delete-event", changeLogId);
        }
    };


};