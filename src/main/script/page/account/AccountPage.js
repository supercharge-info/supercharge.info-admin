import URL from "../../URL";
import 'datatables.net';
import 'datatables.net-bs';
import HC from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import YtdGraph from './YtdGraph';
import SiteEditsSunburst from './SiteEditsSunburst';
import {currentUser} from "../../nav/User";

export default class AccountPage {

    /**
     * @constructor
     */
    constructor() {
        // Allow copying image, printing, go fullscreen
        HC_exporting(HC);
        this.loginTable = $("#login-attempts-table");
        this.editorGraphsContainer = $("#editor-graphs-container");
        this.editHistoryTable = $("#edit-history-table");
    }

    onPageShow() {
        $.getJSON(URL.account.stats, r => this.handleStatsResults(r));
        if (currentUser.hasRole('editor')) {
            $.getJSON(URL.account.edits, r => this.handleEditsResults(r));
        } else {
            $('#site-edits-pie').empty();
            if (this.dataTable) {
                this.dataTable.destroy();
                this.editHistoryTable.find("thead, tbody").empty();
                this.dataTable = null;
            }
        }
    }

    handleStatsResults(response) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.loginTable.show().find("tbody").html("")
            .append(response.attempts.map(attempt => `<tr>
                <td>${ new Date(attempt.date)[
                    today > new Date(attempt.date) ? 'toLocaleDateString' : 'toLocaleTimeString'
                ]() }</td>
                <td>${ attempt.result }</td>
                <td>${ attempt.remoteIP }</td>
            </tr>`));
        if (response.logins && Object.keys(response.logins).length != 0) {
            YtdGraph.draw("ytd-logins-graph", "Account Logins YTD", "Logins", response.logins);
        } else {
            $('#ytd-logins-graph').empty();
        }

        if (response.edits && Object.keys(response.edits).length != 0) {
            this.editorGraphsContainer.show();
            YtdGraph.draw("ytd-site-edits-graph", "Sites You've Edited YTD", "Sites Edited", response.edits);
        } else {
            $('#ytd-site-edits-graph').empty();
        }
        if (response.additions && Object.keys(response.additions).length != 0) {
            this.editorGraphsContainer.show();
            YtdGraph.draw("ytd-site-additions-graph", "Sites You've <b>Added</b> YTD", "Site Additions", response.additions);
        } else {
            $('#ytd-site-additions-graph').empty();
        }
    }

    handleEditsResults(response) {
        if (Array.isArray(response) && response.length != 0) {
            this.editorGraphsContainer.show();
            if (!this.sunburst) {
                this.sunburst = new SiteEditsSunburst();
            }
            this.sunburst.draw(response);

            if (!this.dataTable) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                this.editHistoryTable.find('thead').html(`<tr>
                    <th>id</th>
                    <th>name</th>
                    <th>version</th>
                    <th>field</th>
                    <th>old value</th>
                    <th>new value</th>
                    <th>change date</th>
                </tr>`);
                this.dataTable = this.editHistoryTable.DataTable({
                    data: response,
                    order: [[6, 'desc']],
                    lengthMenu: [10, 25, 100, 1000, 10000],
                    columns: [
                        { data: 'siteId' },
                        { data: 'siteName' },
                        { data: 'version', searchable: false },
                        { data: 'fieldName' },
                        { data: 'oldValue' },
                        { data: 'newValue' },
                        {
                            data: 'changeDate.epochSecond',
                            searchable: false,
                            render: (d, t) => t == 'sort' ? d : new Date(d * 1000)[
                                d * 1000 < today.getTime() ? 'toLocaleDateString' : 'toLocaleTimeString'
                            ]() }
                    ],
                    dom: "<'row'<'col-sm-4'f><'col-sm-4 dataTables_middle dataTables_title'><'col-sm-4'l>>"
                        + "<'row'<'col-sm-12'tr>><'row'<'col-sm-5'i><'col-sm-7'p>>"
                });
                $(this.dataTable.table().container()).find('.row:first > div:eq(1)').text('Your historical edits');
                $(window).keydown($.proxy(this.handleFindShortcut, this));
            } else {
                this.dataTable.clear().rows.add(response).draw();
            }
        } else {
            $('#site-edits-pie').empty();
             if (this.dataTable) {
                this.dataTable.destroy();
                this.editHistoryTable.find("thead, tbody").empty();
                this.dataTable = null;
            }
        }
    }

    handleFindShortcut(event) {
        if (this.dataTable && this.editHistoryTable.closest('.page').is(':visible') && String.fromCharCode(event.which) == "F" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();

            const navHeight = $('.navbar-header').height() || $('.navbar').height();
            const input = $(this.dataTable.table().container()).find('input');
            $('html').animate({ scrollTop: input.offset().top - navHeight - 10 }, { complete: () => input.focus() });
        }
    }

}
