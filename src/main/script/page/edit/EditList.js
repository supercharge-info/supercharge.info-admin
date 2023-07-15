import EventBus from "../../util/EventBus";
import Status from "../../Status";
import URL from "../../URL";
import EditEvents from './EditEvents';
import SiteDeleteAction from "./SiteDeleteAction";
import SiteLoadAction from "./SiteLoadAction";
import {currentUser} from "../../nav/User";
import 'datatables.net';
import 'datatables.net-bs';
import 'datatables.net-responsive';
import { sanitize } from 'dompurify';

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
    }

    populateEditSiteTable(sites) {
        if (!this.dataTable) {
            this.siteListTable
                .on("click", "a.site-edit-trigger", EditList.handleEditClick)
                .on("click", "a.site-delete-trigger", EditList.handleDeleteClick);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            this.siteListTable.find("thead").html(`<tr>
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
            </tr>`);
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
                            + `<a href="#" class="site-delete-trigger" data-id="${r.id}">delete</a>`),
                        className: 'all'
                    },
                    { data: 'id', responsivePriority: 2 },
                    { data: 'name', render: sanitize, className: 'all' },
                    {
                        data: 'status',
                        render: d => `<span class="${ Status[d].className }">${ d }</span>`,
                        className: 'all'
                    },
                    { data: 'dateOpened', defaultContent: '', searchable: false, responsivePriority: 2 },
                    { data: 'powerKiloWatt', searchable: false, className: 'all' },
                    { data: 'stallCount', searchable: false, className: 'all' },
                    { data: 'otherEVs', searchable: false, responsivePriority: 3 },
                    { data: 'version', searchable: false, responsivePriority: 4 },
                    {
                        data: 'dateModified',
                        searchable: false,
                        render: (d, t) => t == 'sort' ? d : new Date(d)[
                            today > new Date(d) ? 'toLocaleDateString' : 'toLocaleTimeString'
                        ](), responsivePriority: 1
                    },
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
                            </div>`,
                            className: 'all'
                    }
                ],
                dom: "<'row'<'col-sm-4'f><'col-sm-4 dataTables_middle dataTables_title'><'col-sm-4'l>>"
                    + "<'row'<'col-sm-12'tr>><'row'<'col-sm-5'i><'col-sm-7'p>>",
                responsive: {
                    details: false
                }
            });
            $(this.dataTable.table().container()).find('.row:first > div:eq(1)').text('All Sites');
            $(window).keydown($.proxy(this.handleFindShortcut, this));
        } else {
            this.dataTable.clear().rows.add(sites).draw();
        }
    }

    handleFindShortcut(event) {
        if (this.siteListTable.closest('.page').is(':visible') && String.fromCharCode(event.which) == "F" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();

            const navHeight = $('.navbar-header').height() || $('.navbar').height();
            const input = $(this.dataTable.table().container()).find('input');
            $('html').animate({ scrollTop: input.offset().top - navHeight - 10 }, { complete: () => input.focus() });
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

}



