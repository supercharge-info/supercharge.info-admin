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
                <th>Opened</th>
                <th title="Max power (kW)">Power</th>
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
                    { data: 'dateOpened', defaultContent: '', responsivePriority: 2 },
                    { data: 'powerKiloWatt', className: 'number' },
                    { data: 'stallCount', className: 'number' },
                    { data: 'otherEVs', searchable: false, responsivePriority: 3 },
                    { data: 'version', searchable: false, responsivePriority: 4, className: 'number' },
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
                        orderable: false,
                        render: (d,t,r) => {
                            const gmapQuery = encodeURI(`${r.address.street||''} ${r.address.city||''} ${r.address.state||''} ${r.address.zip||''} ${r.address.country||''}`);
                            const teslaSuffix = r.address.country == 'China' && !['Hong Kong', 'Macau'].includes(r.address.state) ? 'n' : 'om';
                            const psLink = "https://api.plugshare.com/view/" + (r.plugshareId ? `location/${r.plugshareId}` : `map?latitude=${r.gps.latitude}&longitude=${r.gps.longitude}&spanLat=0.05&spanLng=0.05`);
                            const osmLink = "https://www.openstreetmap.org/" + (r.osmId ? `node/${r.osmId}` : `#map=18/${r.gps.latitude}/${r.gps.longitude}`);
                            return `<div style="white-space: nowrap;">
                                <a title="sc.info map" href="/map?siteID=${r.id}" target="_blank"><img src="../images/logo.svg"/></a>
                                <a title="Google Map" href="https://www.google.com/maps/search/?api=1&query=${gmapQuery}" target="_blank"><img src="../images/gmap.svg"/></a>
                                <a title="PlugShare" href="${psLink}" target="_blank"><img src="https://developer.plugshare.com/logo.svg"${r.plugshareId ? '' : ' class="faded"'}/></a>
                                <a title="OpenStreetMap" href="${osmLink}" target="_blank"><img src="../images/osm.svg"${r.osmId ? '' : ' class="faded"'}/></a>
                                ${r.urlDiscuss ? `<a title="Forum" href="${r.urlDiscuss}" target="_blank"><img src="../images/forum.svg"/></a>` : ''}
                                ${r.locationId ? `<a title="tesla.c${teslaSuffix}" href="https://www.tesla.c${teslaSuffix}/findus/location/supercharger/${r.locationId}" target="_blank"><img src="../images/red_dot_t.svg"/></a>` : ''}
                            </div>`;
                        },
                        className: 'links'
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
        if (!target.is('a, img, dropdown-menu *')) {
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



