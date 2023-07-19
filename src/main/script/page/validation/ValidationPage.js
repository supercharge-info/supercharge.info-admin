import URL from "../../URL";
import { sanitize } from 'dompurify';
import EventBus from "../../util/EventBus";
import EditEvents from "../edit/EditEvents";

/**
 * @constructor
 */
const ValidationPage = function () {
    this.validationTable = $("#validation-table");
};

ValidationPage.prototype.onPageShow = function () {
    if (!this.loaded) {
        $.getJSON(URL.val.database, $.proxy(this.populateTable, this));
    }
};

ValidationPage.prototype.populateTable = function (data) {
    this.loaded = true;

    const tableBody = this.validationTable.find("tbody");
    this.data = data.reduce((a, c) => {
        if (!(c.validation.category in a)) {
            a[c.validation.category] = [];
        }
        a[c.validation.category].push(c);
        return a;
    }, {});

    if (!this.tabs) {
        this.tabs = $('<ul>').addClass('nav nav-pills')
            .append(Object.keys(this.data).map((c) => {
                const count = this.data[c].reduce((n, v) => n + v.failureRows.length, 0);
                const tab = $('<a href="#" data-target="#validation-table">')
                    .text(c.replace('_',' ').replace(/(\w)(\w+)/g, (a,s,r) => s + r.toLowerCase()))
                    .click(e => {
                        e.preventDefault();
                        $(e.target).tab('show');
                    }).on('shown.bs.tab', () =>
                        ValidationPage.showCategory(tableBody, this.data[c]));
                if (count > 0) {
                    tab.append(' ').append($('<span class="badge">').text(count));
                }
                return $('<li>').prop('role', 'presentation').append(tab);
            })).replaceAll(this.validationTable.prev());
        this.tabs.find('a:first').tab('show');
    }

};

ValidationPage.showCategory = function (tableBody, data) {

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
        const e = $(elem);
        const index = e.index();
        e.closest("table").find(`td:nth-child(${index+1})`).each((i, elem) => {
            elem.innerHTML = elem.innerText.replace(/\d+/g, "<a title='click to populate edit form' href='#edit'>$&</a>");
            $(elem).find("a").click(ValidationPage.handleSiteClick);
        });
    });

    tableBody.find("th:contains('url_discuss')").each((i, elem) => {
        const e = $(elem);
        const index = e.index();
        e.closest("table").find(`td:nth-child(${index+1})`).each((i, elem) => {
            if (elem.innerText && elem.innerText != "null") {
                elem.innerHTML = `<a target='_blank' href='${elem.innerText}'>${elem.innerText}</a>`;
            }
        });
    });

    tableBody.find("th:contains('location_id')").each((i, elem) => {
        const e = $(elem);
        const index = e.index();
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
            row = row + `<td>${sanitize(value)}</td>`;
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

    EventBus.dispatch("change-page", "edit");

    const link = $(event.target);
    const siteId = link.text();
    EventBus.dispatch(EditEvents.site_edit_selection, siteId);
};

export default ValidationPage;

