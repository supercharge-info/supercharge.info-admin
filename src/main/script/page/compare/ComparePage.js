import URL from "../../URL";
import 'datatables.net';
import 'datatables.net-bs';
import EventBus from "../../util/EventBus";
import EditEvents from "../edit/EditEvents";


/**
 * @constructor
 */
class ComparePage {

    constructor(china) {
        this.suffix = "";
        if (china) {
            this.suffix = "-china";
        } else {
            $('#page-comparison ul.nav > li > a').click($.proxy(this.handleTabChange, this));
        }
        this.validationWebScrapeDiv = $(`#validation-web-scrape${this.suffix}-report`);
    }

    onPageShow() {
        if (!this.validationWebScrapeDiv.is(':visible') && this.other) {
            return this.other.onPageShow();
        }
        if (!this.loaded && this.validationWebScrapeDiv.children().length <= 1) {
            this.loaded = true;
            $.get(URL.val.webscrape + this.suffix)
                .done($.proxy(this.populateWebScrapeReport, this))
                .fail(() => {
                    this.loaded = false;
                    if(confirm('Failed to load compare page, do you want to retry?')) {
                        this.onPageShow();
                    }
                });
        }
    }

    populateWebScrapeReport(reportHtml) {
        this.validationWebScrapeDiv.html(reportHtml);

        this.missingLocalSitesTable = $(`#missing-local-sites-table${this.suffix}`);
        this.missingTeslaSitesTable = $(`#missing-tesla-sites-table${this.suffix}`);
        this.fieldMismatchesTable = $(`#field-mismatches-table${this.suffix}`);

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

        // Data Tables, site links
        this.missingLocalSitesTable = this.missingLocalSitesTable.on('click','td:first-child a',ComparePage.handleMissingSiteClick).DataTable({
            lengthMenu: [ 10, 25, 100, 1000, 10000],
            dom: "<'row'<'col-sm-4'f><'col-sm-4 dataTables_middle'><'col-sm-4'l>>"
                + "<'row'<'col-sm-12'tr>><'row'<'col-sm-5'i><'col-sm-7'p>>"
        });
        this.missingTeslaSitesTable = this.missingTeslaSitesTable.on('click','td:first-child a',ComparePage.handleExistingSiteClick).DataTable({
            order: [[1, 'asc']],
            lengthMenu: [ 10, 25, 100, 1000, 10000],
            dom: "<'row'<'col-sm-6'f><'col-sm-6'l>>"
                + "<'row'<'col-sm-12'tr>><'row'<'col-sm-5'i><'col-sm-7'p>>"
        });
        this.fieldMismatchesTable.addClass('datatable-multi-row').find('tbody tr:not(:has(td[rowspan]))').each((i,e) => {
            const tr = $(e).prev();
            tr.children('[rowspan]').attr('data-datatable-multi-row-rowspan','2').removeAttr('rowspan');
            tr.children().eq(1).append($('<script type="text/template">').addClass('extra-row-content').text($(e).remove().prop('outerHTML')));
        });
        this.fieldMismatchesTable = this.fieldMismatchesTable.on('click','td:first-child a',ComparePage.handleExistingSiteClick).DataTable({
            order: [[2, 'asc']],
            'fnDrawCallback': ComparePage.dtRowSpanRedraw,
            lengthMenu: [ 10, 25, 100, 1000, 10000],
            dom: "<'row'<'col-sm-6'f><'col-sm-6'l>>"
                + "<'row'<'col-sm-12'tr>><'row'<'col-sm-5'i><'col-sm-7'p>>"
        });

        if (!this.suffix) {
            this.countrySelect = $('<select>').addClass('form-control input-sm').append('<option value="">All Countries</option>').append(Object.keys(this.countryList).sort().map(e => $(`<option>${e}</option>`)));
            $(this.missingLocalSitesTable.table().container()).find('.row:first > div:eq(1)').append($('<label>').text('Country:').append(this.countrySelect));
            this.countrySelect.on('change', () => {
                [ this.missingLocalSitesTable, this.missingTeslaSitesTable, this.fieldMismatchesTable ].forEach(t => t.column((i, d, n) => n.innerText == 'country').search(`^${this.countrySelect.val() || '.*'}$`, true, false).draw());
            });
        }
        $(window).keydown($.proxy(this.handleFindShortcut, this));
    }

    handleTabChange(e) {
        const elem = $(e.target);
        if (elem.attr('href') == '#') {
            return;
        }
        e.preventDefault();
        elem.tab('show').closest('.nav').nextAll().hide();

        $(elem.data('target')).show();
        if (!this.other) {
            this.other = new ComparePage(true);
        }
        this.onPageShow();
    }

    static dtRowSpanRedraw() {
        // From: https://stackoverflow.com/a/50183806/1507941
        // Handles using a rowspan in DataTables, which is not supported otherwise
        // Pairs rows together using one "real" row and the lower row existing in a script
        const table = $(this);

        // only apply this to specific tables
        if (table.closest(".datatable-multi-row").length) {
            // for each row in the table body...
            table.find("tbody>tr").each(function() {
                const tr = $(this);

                // get the "extra row" content from the <script> tag.
                // note, this could be any DOM object in the row.
                const extra_row = tr.find(".extra-row-content").html();

                // in case draw() fires multiple times,
                // we only want to add new rows once.
                if (!tr.next().hasClass('dt-added')) {
                    tr.after(extra_row);
                    tr.find("td").each(function() {
                        // for each cell in the top row,
                        // set the "rowspan" according to the data value.
                        const td = $(this);
                        const rowspan = parseInt(td.data("datatable-multi-row-rowspan"), 10);
                        if (rowspan) {
                          td.attr('rowspan', rowspan);
                        }
                    });
                }
            });
        }
    }

    static handleMissingSiteClick() {
        event.preventDefault();

        const link = $(event.target);
        const tr = link.parents("tr");
        const title = tr.find("td").eq(0).find("a").text();
        const locationId = tr.find("td").eq(1).find('a').prop('href');
        const stallCount = tr.find("td").eq(2).text();
        const latitude = tr.find("td").eq(3).text();
        const longitude = tr.find("td").eq(4).text();
        const address = tr.find("td").eq(5).text();
        const city = tr.find("td").eq(6).text();
        const state = tr.find("td").eq(7).text();
        const country = tr.find("td").eq(8).text();
        //const region = tr.find("td").eq(9).text();
        const hours = tr.find("td").eq(10).text();
        //const chargers = tr.find("td").eq(11).text();
        const locationType = tr.find("td").eq(12).text();
        const form = $("#site-edit-form");

        // reset all form fields
        form.trigger("reset");
        //
        form.find("input[name='locationId']").val((locationId.match(/[^/]+$/) || [])[0]);
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

        EventBus.dispatch("change-page", "edit");
    }

    handleFindShortcut(event) {
        if (this.validationWebScrapeDiv.is(':visible') && String.fromCharCode(event.which) == "F" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();

            // Calculate positions
            const navHeight = $('.navbar-header').height() || $('.navbar').height();
            const position = $(window).scrollTop() + $(window).height() - 200;
            const bottomTablePosition = $(this.fieldMismatchesTable.table().container()).offset().top;
            const midTablePosition = $(this.missingTeslaSitesTable.table().container()).offset().top;
            const midTableHeight = $(this.missingTeslaSitesTable.table().container()).height();
            const topTablePosition = $(this.missingLocalSitesTable.table().container()).offset().top;
            const topTableHeight = $(this.missingLocalSitesTable.table().container()).height();

            // Determine best search box
            const input = Math.abs(position - bottomTablePosition) <= Math.abs(position - midTablePosition - midTableHeight)
                ? $(this.fieldMismatchesTable.table().container()).find('input').focus()
                : Math.abs(position - midTablePosition) <= Math.abs(position - topTablePosition - topTableHeight)
                ? $(this.missingTeslaSitesTable.table().container()).find('input')
                : $(this.missingLocalSitesTable.table().container()).find('input');
            $('html').animate({ scrollTop: input.offset().top - navHeight - 10 }, { complete: () => input.focus() });
        }
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

