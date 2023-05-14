import EventBus from "../../util/EventBus";
import URL from "../../URL";
import EditEvents from './EditEvents'
import SiteDeleteAction from "./SiteDeleteAction";
import SiteLoadAction from "./SiteLoadAction";
import $ from "jquery";
import 'datatables.net';
import 'datatables.net-bs';
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
        if (!this.dataTable) {
            this.siteListTable
                .on("click", "a.site-edit-trigger", EditList.handleEditClick)
                .on("click", "a.site-delete-trigger", EditList.handleDeleteClick);

            const tableHead = this.siteListTable.find("thead");
            tableHead.html("" +
                `<tr>
                    <th>Action</th>
                    <th>Id</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Date Opened</th>
                    <th>Power (kW)</th>
                    <th>Stalls</th>
                    <th>Other EVs</th>
                    <th>Modified</th>
                </tr>`
                );
            this.dataTable = this.siteListTable.DataTable({
                data: sites,
                order: [[8, 'desc']],
                lengthMenu: [5, 25, 100, 1000, 10000],
                columns: [
                    {
                        data: null,
                        searchable: false,
                        render: (d,t,r) =>
                            `<a href="#" class="site-edit-trigger" data-id="${r.id}">edit</a>
                            &nbsp;
                            <a href="#" class="site-delete-trigger" data-id="${r.id}">delete</a>`
                    },
                    { data: 'id' },
                    { data: 'name', render: xss.inHTMLData },
                    { data: 'status' },
                    { data: 'dateOpened', defaultContent: '', searchable: false },
                    { data: 'powerKiloWatt', searchable: false },
                    { data: 'stallCount', searchable: false },
                    { data: 'otherEVs', searchable: false },
                    { data: 'dateModified', searchable: false }
                ]
            });
        } else {
            this.dataTable.clear().rows.add(sites).draw();
        }
    }

    static handleEditClick(event) {
        event.preventDefault();
        const link = $(event.target);
        const siteId = link.data("id");
        EventBus.dispatch(EditEvents.site_edit_selection, siteId);
    }

    static handleDeleteClick(event) {
        event.preventDefault();
        const link = $(event.target);
        const siteId = link.data("id");
        const siteName = link.parents("tr").find("td").eq(2).html();
        EventBus.dispatch(EditEvents.site_delete_selection, siteId, siteName);
    }

};



