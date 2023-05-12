import URL from "../../URL";
import $ from "jquery";
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

        this.missingLocalSitesTable.find("a").on('click',ComparePage.handleMissingSiteClick);
        this.missingTeslaSitesTable.find("a").on('click',ComparePage.handleExistingSiteClick);
        this.fieldMismatchesTable.find("a").on('click',ComparePage.handleExistingSiteClick);

        this.navItem = $('#page-link-comparison');
        this.dropdown = $('<ul class="dropdown-menu">').insertAfter(this.navItem);
        $('<li class="dropdown">')
            .append($('<a href="#missing-local-sites-table" class="dropdown-toggle" data-target="#" data-toggle="dropdown">Missing Local Sites <span class="caret"></a>'))
            .append($('<ul class="dropdown-menu">').append(this.missingLocalSitesTable.find('[id]').map((i, e) => `<li><a href="#${ e.id }">${ e.id.slice(-1) }</a></li>`).get().join('')))
            .appendTo(this.dropdown);
        $('<li class="dropdown">')
            .append($('<a href="#missing-tesla-sites-table" class="dropdown-toggle" data-target="#" data-toggle="dropdown">Missing Tesla Sites <span class="caret"></a>'))
            .append($('<ul class="dropdown-menu">').append(this.missingTeslaSitesTable.find('[id]').map((i, e) => `<li><a href="#${ e.id }">${ e.id.slice(-1) }</a></li>`).get().join('')))
            .appendTo(this.dropdown);
        $('<li class="dropdown">')
            .append($('<a href="#field-mismatches-table" class="dropdown-toggle" data-target="#" data-toggle="dropdown">Field Mismatches <span class="caret"></a>'))
            .append($('<ul class="dropdown-menu">').append(this.fieldMismatchesTable.find('[id]').map((i, e) => `<li><a href="#${ e.id }">${ e.id.slice(-1) }</a></li>`).get().join('')))
            .appendTo(this.dropdown);
        this.navItem.addClass('dropdown-toggle').append(' <span class="caret">');
        $('body').click($.proxy(this.handleNavClick, this));
    };

    handleNavClick(e) {
        let elem = $(e.target);
        if (this.navItem.parent().is('.open')) {
            if (!this.navItem.nextAll('.dropdown-menu').has(e.target).length) {
                this.navItem.parent().removeClass('open');
            } else if (elem.is('a:not(.dropdown-toggle)')) {
                this.navItem.parent().removeClass('open');
                const dest = $(elem.attr('href'));
                const navHeight = $('.navbar-header').height() || $('.navbar').height();
                const tableHeadHeight = dest.closest('table').find('tr').first().height();
                $('html').animate({ scrollLeft: 0, scrollTop: dest.offset().top - navHeight - tableHeadHeight + 'px' });
                e.preventDefault();
            }
        } else if (this.navItem.is(e.target)) {
            this.navItem.parent().addClass('open');
        }
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

