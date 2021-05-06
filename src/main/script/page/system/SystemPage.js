import $ from 'jquery'
import URL from '../../URL'

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
    for (let prop in sysProps) {
        if (sysProps.hasOwnProperty(prop)) {
            table.find("tbody").append("" +
                "<tr>" +
                "<td>" + prop + "</td>" +
                "<td>" + sysProps[prop] + "</td>" +
                "</tr>"
            );
        }
    }
};

export default SystemPage;

