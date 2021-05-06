import EventBus from "../../util/EventBus";
import URL from "../../URL";
import EditEvents from './EditEvents'
import SiteDeleteAction from "./SiteDeleteAction";
import SiteLoadAction from "./SiteLoadAction";
import $ from "jquery";
import xss from 'xss-filters';

export default class EditList {

    constructor() {
        this.siteListTable = $("#edit-sites-list-table");
        this.siteEditForm = $('#site-edit-form');
        new SiteDeleteAction();
        new SiteLoadAction();

        EventBus.addListener(EditEvents.site_list_changed, this.loadSiteList, this);
    }

    loadSiteList() {
        $.getJSON(URL.site.loadAll, $.proxy(this.populateEditSiteTable, this));
    };

    populateEditSiteTable(sites) {
        const tableHead = this.siteListTable.find("thead");
        const tableBody = this.siteListTable.find("tbody");
        tableHead.html("" +
            `<tr>
                <th>Action</th>
                <th>Id</th>
                <th>Name</th>
                <th>Status</th>
                <th>Date Opened</th>
                <th>Counted</th>
                <th>Elevation (m)</th>
                <th>Stalls</th>
                <th>Modified</th>
            </tr>`
            );
        tableBody.html("");
        $.each(sites, function (index, site) {
            tableBody.append(
                `<tr>
                    <td>
                        <a href='' class='site-edit-trigger' data-id='${site.id}'>edit</a>
                        &nbsp;
                        <a href='' class='site-delete-trigger' data-id='${site.id}'>delete</a>
                    </td>
                    <td>${site.id}</td>
                    <td>${xss.inHTMLData(site.name)}</td>
                    <td>${site.status}</td>
                    <td>${site.dateOpened}</td>
                    <td>${site.counted}</td>
                    <td>${site.elevationMeters}</td>
                    <td>${site.stallCount}</td>
                    <td>${site.dateModified}</td>
                </tr>`
            );
        });

        $(".site-edit-trigger").on("click", $.proxy(EditList.handleEditClick, this));
        $(".site-delete-trigger").on("click", $.proxy(EditList.handleDeleteClick, this));

        this.adjustListHeight();
    };

    /** Make the list of sites occupy all remaining vertical space. */
    adjustListHeight() {
        const marinAndPadding = 150;
        const bodyHeight = $("body").height();
        const formHeight = this.siteEditForm.height();
        const diff = bodyHeight - formHeight - marinAndPadding;
        this.siteListTable.closest("div").css('height', diff);
    }

    static handleEditClick(event) {
        event.preventDefault();
        const link = $(event.target);
        const siteId = link.data("id");
        EventBus.dispatch(EditEvents.site_edit_selection, siteId);
    };

    static handleDeleteClick(event) {
        event.preventDefault();
        const link = $(event.target);
        const siteId = link.data("id");
        const siteName = link.parents("tr").find("td").eq(2).html();
        EventBus.dispatch(EditEvents.site_delete_selection, siteId, siteName);
    };

};



