import URL from "../../URL";
import $ from 'jquery'
import xss from 'xss-filters';

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


export default ValidationPage;

