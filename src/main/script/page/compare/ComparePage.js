import URL from "../../URL";
import $ from "jquery";


/**
 * @constructor
 */
class ComparePage {

    constructor() {
        this.validationWebScrapeDiv = $("#validation-web-scrape-report");
    }

    onPageShow() {
        this.validationWebScrapeDiv.html("");
        $.get(URL.val.webscrape, $.proxy(this.populateWebScrapeReport, this));
    };

    populateWebScrapeReport(reportHtml) {
        this.validationWebScrapeDiv.html(reportHtml);

        this.missingSitesTable = $("#missing-local-sites-table");

        this.missingSitesTable.find("a").on('click',ComparePage.handleMissingSiteClick);
    };

    static handleMissingSiteClick() {
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
        form.find("select[name='address[countryId]']").find("option:contains(" + country + ")").prop('selected', 'selected');

        $("#page-link-edit").click();
    }

    static getTodayDateString() {
        const now = new Date();
        const day = ("0" + now.getDate()).slice(-2);
        const month = ("0" + (now.getMonth() + 1)).slice(-2);
        return now.getFullYear() + "-" + (month) + "-" + (day);
    }
}


export default ComparePage;

