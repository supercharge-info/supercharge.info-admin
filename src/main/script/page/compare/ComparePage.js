import URL from "../../URL";
import $ from "jquery";
import 'datatables.net';
import 'datatables.net-bs';
import EventBus from "../../util/EventBus";
import EditEvents from "../edit/EditEvents";


/**
 * @constructor
 */
class ComparePage {

    constructor() {
        this.validationWebScrapeDiv = $("#validation-web-scrape-report");
    }

    onPageShow() {
        if (!this.validationWebScrapeDiv.html()) {
            $.get(URL.val.webscrape, $.proxy(this.populateWebScrapeReport, this));
        }
    };

    populateWebScrapeReport(reportHtml) {
        this.validationWebScrapeDiv.html(reportHtml);

        this.missingLocalSitesTable = $("#missing-local-sites-table");
        this.missingTeslaSitesTable = $("#missing-tesla-sites-table");
        this.fieldMismatchesTable = $("#field-mismatches-table");

        // Nav List
        this.navItem = $('#page-link-comparison');
        this.dropdown = $('<ul class="dropdown-menu">').insertAfter(this.navItem);
        $('<li class="dropdown">')
            .append($('<a href="#missing-local-sites-table" data-target="#">Missing Local Sites</a>'))
            .appendTo(this.dropdown);
        $('<li class="dropdown">')
            .append($('<a href="#missing-tesla-sites-table" data-target="#">Missing Tesla Sites</a>'))
            .appendTo(this.dropdown);
        $('<li class="dropdown">')
            .append($('<a href="#field-mismatches-table" data-target="#">Field Mismatches</a>'))
            .appendTo(this.dropdown);
        this.navItem.addClass('dropdown-toggle').attr('data-toggle', 'dropdown').append(' <span class="caret">');
        this.dropdown.find('a').click(ComparePage.handleNavClick);

        // Country Filter
        this.countryList = {};
        this.missingLocalSitesTable
            .add(this.missingTeslaSitesTable).find('tbody td[rowspan] ~ td:nth-child(9)')
            .add(this.fieldMismatchesTable.find('tbody td[rowspan] ~ td:nth-child(7)'))
            .each((i,e) => {
                if (e.innerText in this.countryList) {
                    this.countryList[e.innerText]++;
                } else {
                    this.countryList[e.innerText] = 1;
                }
            });
        this.countrySelect = $('<select>').addClass('form-control input-sm').append('<option value="">All Countries</option>').append(Object.keys(this.countryList).sort().map(e => $(`<option>${e}</option>`)));
        $.fn.dataTable.ext.search.push((s,d) => {
            let col = s.aoColumns.find(e => e.sTitle === 'country');
            if (col) {
                return d[col.idx] === (this.countrySelect.val() || d[col.idx])
            }
            return true;
        });

        // Data Tables, site links
        this.missingLocalSitesTable = this.missingLocalSitesTable.on('click','td:first-child a',ComparePage.handleMissingSiteClick).DataTable({
            lengthMenu: [ 10, 25, 100, 1000, 10000],
            'dom': "<'row'<'col-sm-4'l><'col-sm-4'><'col-sm-4'f>>"
                + "<'row'<'col-sm-12'tr>><'row'<'col-sm-5'i><'col-sm-7'p>>"
        });
        this.missingTeslaSitesTable = this.missingTeslaSitesTable.on('click','td:first-child a',ComparePage.handleExistingSiteClick).DataTable({ lengthMenu: [ 10, 25, 100, 1000, 10000] });
        this.fieldMismatchesTable.addClass('datatable-multi-row').find('tbody tr:not(:has(td[rowspan]))').each((i,e) => {
            let tr = $(e).prev();
            tr.children('[rowspan]').attr('data-datatable-multi-row-rowspan','2').removeAttr('rowspan');
            tr.children().eq(1).append($('<script type="text/template">').addClass('extra-row-content').html($(e).remove().html()));
        });
        this.fieldMismatchesTable = this.fieldMismatchesTable.on('click','td:first-child a',ComparePage.handleExistingSiteClick).DataTable({ 'fnDrawCallback': ComparePage.dtRowSpanRedraw, lengthMenu: [ 10, 25, 100, 1000, 10000] });

        $(this.missingLocalSitesTable.table().container()).find('.row:first > div:eq(1)').append($('<label>').text('Country:').append(this.countrySelect));
        this.countrySelect.on('change', () => { this.missingLocalSitesTable.draw(); this.missingTeslaSitesTable.draw(); this.fieldMismatchesTable.draw() });
    };

    static dtRowSpanRedraw() {
        // From: https://stackoverflow.com/a/50183806/1507941
        // Handles using a rowspan in DataTables, which is not supported otherwise
        // Pairs rows together using one "real" row and the lower row existing in a script
        let table = $(this);

        // only apply this to specific tables
        if (table.closest(".datatable-multi-row").length) {
            // for each row in the table body...
            table.find("tbody>tr").each(function() {
                let tr = $(this);

                // get the "extra row" content from the <script> tag.
                // note, this could be any DOM object in the row.
                let extra_row = tr.find(".extra-row-content").html();

                // in case draw() fires multiple times,
                // we only want to add new rows once.
                if (!tr.next().hasClass('dt-added')) {
                    tr.after(extra_row);
                    tr.find("td").each(function() {
                        // for each cell in the top row,
                        // set the "rowspan" according to the data value.
                        let td = $(this);
                        let rowspan = parseInt(td.data("datatable-multi-row-rowspan"), 10);
                        if (rowspan) {
                          td.attr('rowspan', rowspan);
                        }
                    });
                }
            });
        }
    }

    static handleNavClick(e) {
        const dest = $(e.target.hash).closest('#validation-web-scrape-report > *');
        const navHeight = $('.navbar-header').height() || $('.navbar').height();
        $('html').animate({ scrollLeft: 0, scrollTop: dest.offset().top - navHeight + 'px' });
        e.preventDefault();
    }

    static handleMissingSiteClick() {
        event.preventDefault();

        const link = $(event.target);
        const tr = link.parents("tr");
        const title = tr.find("td").eq(0).find("a").html();
        const locationId = tr.find("td").eq(1).html();
        const stallCount = tr.find("td").eq(2).html();
        const latitude = tr.find("td").eq(3).html();
        const longitude = tr.find("td").eq(4).html();
        const address = tr.find("td").eq(5).html();
        const city = tr.find("td").eq(6).html();
        const state = tr.find("td").eq(7).html();
        const country = tr.find("td").eq(8).html();
        const region = tr.find("td").eq(9).html();
        const hours = tr.find("td").eq(10).html();
        const chargers = tr.find("td").eq(11).html();
        const locationType = tr.find("td").eq(12).html();
        const form = $("#site-edit-form");

        // reset all form fields
        form.trigger("reset");
        //
        form.find("input[name='locationId']").val(locationId);
        form.find("input[name='name']").val(title);
        form.find("select[name='status']").find("option[value=OPEN]").prop('selected', 'selected');
        form.find("input[name='dateOpened']").val(ComparePage.getTodayDateString());
        form.find("input[name='hours']").val(hours);
        form.find("input[name='gps[latitude]']").val(latitude);
        form.find("input[name='gps[longitude]']").val(longitude);
        form.find("input[name='stallCount']").val(stallCount);
        form.find("input[name='address[street]']").val(address);
        form.find("input[name='address[city]']").val(city);
        form.find("input[name='address[state]']").val(state);
        // In case country list hasn't loaded yet
        setTimeout(() => form.find(`select[name='address[countryId]'] option:contains(${ country })`).prop('selected', 'selected')
            , $("#address-country-select").children().length > 1 ? 0 : 500);
        form.find("select[name='otherEVs']").find(`option:contains(${ locationType.split(/,\s*/).includes("PARTY") })`).prop('selected', 'selected');

        $("#page-link-edit").click();
    }

    static handleExistingSiteClick() {
        event.preventDefault();

        $("#page-link-edit").click();

        const link = $(event.target);
        const siteId = link.text();
        EventBus.dispatch(EditEvents.site_edit_selection, siteId);
    }

    static getTodayDateString() {
        const now = new Date();
        const day = ("0" + now.getDate()).slice(-2);
        const month = ("0" + (now.getMonth() + 1)).slice(-2);
        return now.getFullYear() + "-" + (month) + "-" + (day);
    }
}


export default ComparePage;

