import EventBus from "../../util/EventBus";
import URL from "../../URL";
import EditEvents from './EditEvents'
import SiteDeleteAction from "./SiteDeleteAction";
import SiteLoadAction from "./SiteLoadAction";
import {currentUser} from "../../nav/User";
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
                    <th>Version</th>
                    <th>Modified</th>
                    <th>Links</th>
                </tr>`
                );
            this.dataTable = this.siteListTable.DataTable({
                data: sites,
                order: [[9, 'desc']],
                lengthMenu: [10, 25, 100, 1000, 10000],
                columns: [
                    {
                        data: null,
                        searchable: false,
                        render: (d,t,r) =>
                            `<a href="#" class="site-edit-trigger" data-id="${r.id}">edit</a>`
                            + (!currentUser.hasRole("admin") ? "" : " &nbsp; "
                            + `<a href="#" class="site-delete-trigger" data-id="${r.id}">delete</a>`)
                    },
                    { data: 'id' },
                    { data: 'name', render: xss.inHTMLData },
                    { data: 'status' },
                    { data: 'dateOpened', defaultContent: '', searchable: false },
                    { data: 'powerKiloWatt', searchable: false },
                    { data: 'stallCount', searchable: false },
                    { data: 'otherEVs', searchable: false },
                    { data: 'version', searchable: false },
                    { data: 'dateModified', searchable: false },
                    {
                        data: null,
                        searchable: false,
                        render: (d,t,r) =>
                            `<div class="dropdown">
                                <a href="#" class="dropdown-toggle" data-toggle="dropdown">Links <span class="caret"/></a>
                                <ul class="dropdown-menu dropdown-menu-right dropdown-menu-links">
                                    <li><a href="/map?center=${r.gps.latitude},${r.gps.longitude}&zoom=15" target="_blank">map</a>
                                    <li><a href="https://www.google.com/maps/search/?api=1&query=${
                                        encodeURI(`${r.address.street||''} ${r.address.city||''} ${r.address.state||''} ${r.address.zip||''} ${r.address.country||''}`)
                                    }" target="_blank">gmap</a></li>
                                    ${r.urlDiscuss ? `<li><a href="${r.urlDiscuss}" target="_blank">forum</a></li>` : ''}
                                    ${r.locationId ? `<li><a href="https://www.tesla.c${r.address.country=='China' && !['Hong Kong', 'Macau'].includes(r.address.state) ? 'n' : 'om'}/findus/location/supercharger/${r.locationId}" target="_blank">tesla.c${r.address.country=='China' && !['Hong Kong', 'Macau'].includes(r.address.state) ? 'n' : 'om'}</a></li>` : ''}
                                </ul>
                            </div>`
                    }
                ]
            });
            $(window).keydown($.proxy(this.handleFindShortcut, this));
        } else {
            this.dataTable.clear().rows.add(sites).draw();
        }
    }

    handleFindShortcut(event) {
        if (this.siteListTable.closest('.page').is(':visible') && String.fromCharCode(event.which) == "F" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            $(this.dataTable.table().container()).find('input').focus();
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



