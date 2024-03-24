import EventBus from "../../util/EventBus";
import Status from "../../Status";
import URL from "../../URL";
import EditEvents from './EditEvents';
import SiteDeleteAction from "./SiteDeleteAction";
import SiteLoadAction from "./SiteLoadAction";
import 'datatables.net';
import 'datatables.net-bs';
import 'datatables.net-responsive';
import { sanitize } from 'dompurify';

export default class EditList {

    constructor() {
        this.siteListTable = $("#edit-sites-list-table");
        this.siteEditForm = $('#site-edit-form');
        this.currentSiteId = null;
        new SiteDeleteAction();
        new SiteLoadAction();

        EventBus.addListener(EditEvents.site_list_changed, this.loadSiteList, this);
        EventBus.addListener(EditEvents.site_deleted, this.deleteSite, this);
        EventBus.addListener(EditEvents.site_list_highlight, this.handleSiteListHighlight, this);
    }

    loadSiteList() {
        this.populateEditSiteTable();
    }

    deleteSite(event, siteId) {
        this.dataTable.row((i,d) => d.id == siteId).remove().draw();
    }

    populateEditSiteTable() {
        if (!this.dataTable) {
            this.siteListTable.on("click", "tbody tr", e => this.handleEditClick(e));
            this.siteListTable.on("draw.dt", e => this.handleSiteListHighlight(e));
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            this.siteListTable.find("thead").html(`<tr>
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
                processing: true,
                ajax: { url: URL.site.loadAll, dataSrc: '' },
                order: [[8, 'desc']],
                lengthMenu: [10, 25, 100, 1000],
                columns: [
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
            this.dataTable.ajax.reload(null, false);
        }
    }

    handleFindShortcut(event) {
        if (this.siteListTable.closest('.page').is(':visible') && String.fromCharCode(event.which) == "F" && (event.metaKey || event.ctrlKey)) {
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

    handleEditClick(event) {
        const target = $(event.target);
        if (!target.is('a, dropdown-menu *')) {
            event.preventDefault();
            const data = this.dataTable.row(target.closest('tr')).data();
            EventBus.dispatch(EditEvents.site_edit_selection, data.id);
        }
    }

    handleSiteListHighlight(event, siteId) {
        if (siteId >= 0) this.currentSiteId = siteId;
        /* highlight table row */
        const rows = this.siteListTable.find('tr');
        rows.each(row => {
            if (rows[row].firstElementChild.innerHTML == this.currentSiteId) {
                rows[row].classList.add("editing");
            } else {
                rows[row].classList.remove("editing");
            }
        });
    }
}



