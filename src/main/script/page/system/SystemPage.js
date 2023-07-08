import { sanitize } from 'dompurify';
import URL from '../../URL';

/**
 * @constructor
 */
const SystemPage = function () {
    this.table = $("#system-properties-table");
};

SystemPage.prototype.onPageShow = function () {
    this.loadSystemProperties();
};

SystemPage.prototype.loadSystemProperties = function () {
    $.getJSON(URL.system.properties, $.proxy(this.populateSystemPropsTable, this));
};


SystemPage.prototype.populateSystemPropsTable = function (sysProps) {
    const table = this.table;
    table.find("thead").html("" +
        "<tr>" +
        "<th>Name</th>" +
        "<th>Value</th>" +
        "</tr>" +
        "");
    Object.entries(sysProps).forEach(([name, prop]) =>
        table.find("tbody").append("" +
            "<tr>" +
            `<td>${ sanitize(name) }</td>` +
            `<td>${ sanitize(prop) }</td>` +
            "</tr>"
        ));
};

export default SystemPage;

