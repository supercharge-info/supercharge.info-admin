import URL from "../../URL";
import $ from 'jquery'
import xss from 'xss-filters';
import EventBus from "../../util/EventBus";
import EditEvents from "../edit/EditEvents";

/**
 * @constructor
 */
const ValidationPage = function () {
    this.validationTable = $("#validation-table");
};

ValidationPage.prototype.onPageShow = function () {
    $.getJSON(URL.val.database, $.proxy(this.populateTable, this));
};

ValidationPage.prototype.populateTable = function (data) {

    const tableBody = this.validationTable.find("tbody");
    tableBody.html("");

    $.each(data, function (key, validationResult) {

        const rowClass = validationResult.pass ? "" : "fail-row";

        tableBody.append("" +
            `<tr class='${rowClass}'>
                <td>${validationResult.validation.category}</td>
                <td>${validationResult.validation.description}</td>
                <td>${validationResult.pass}</td>
                <td>${validationResult.validation.sql}</td>
            </tr>`
        );
        if (!validationResult.pass) {
            ValidationPage.appendFailedRowsTable(tableBody, validationResult.failureRows);
        }
    });

    tableBody.find("th:contains('site_id')").each((i, elem) => {
        let e = $(elem);
        let index = e.index();
        e.closest("table").find(`td:nth-child(${index+1})`).each((i, elem) => {
            elem.innerHTML = elem.innerText.replace(/\d+/g, "<a title='click to populate edit form' href='#edit'>$&</a>");
            $(elem).find("a").click(ValidationPage.handleSiteClick);
        });
    });

    tableBody.find("th:contains('url_discuss')").each((i, elem) => {
        let e = $(elem);
        let index = e.index();
        e.closest("table").find(`td:nth-child(${index+1})`).each((i, elem) => {
            if (elem.innerText && elem.innerText != "null") {
                elem.innerHTML = `<a target='_blank' href='${elem.innerText}'>${elem.innerText}</a>`;
            }
        });
    });

    tableBody.find("th:contains('location_id')").each((i, elem) => {
        let e = $(elem);
        let index = e.index();
        e.closest("table").find(`td:nth-child(${index+1})`).each((i, elem) => {
            if (elem.innerText && elem.innerText != "null") {
                elem.innerHTML = `<a target='_blank' href='https://www.tesla.com/findus/location/supercharger/${elem.innerText}'>${elem.innerText}</a>`;
            }
        });
    });
};

/**
 * Appends to the validation table at the current location another row containing a table with all of the failed
 * rows.
 */
ValidationPage.appendFailedRowsTable = function (tableBody, failRows) {
    let failedRowsHeaderHtml = "";
    let headerBuilt = false;
    let failedRowsHtml = "";

    $.each(failRows, function (index, failRow) {
        let row = "";
        $.each(failRow, function (key, value) {
            row = row + `<td>${xss.inHTMLData(value)}</td>`;
            if (!headerBuilt) {
                failedRowsHeaderHtml += `<th>${key}</th>`;
            }
        });
        headerBuilt = true;
        failedRowsHtml = failedRowsHtml + `<tr>${row}</tr>`;
    });

    tableBody.append(
        `<tr class='fail-row'>
            <td colspan='4'>
                <table>
                    <tr>${failedRowsHeaderHtml}</tr>
                        ${failedRowsHtml} 
                </table>
            </td>
        </tr>`
    );
};

ValidationPage.handleSiteClick = function() {
    event.preventDefault();

    $("#page-link-edit").click();

    const link = $(event.target);
    const siteId = link.text();
    EventBus.dispatch(EditEvents.site_edit_selection, siteId);
}

export default ValidationPage;

