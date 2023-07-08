import URL from "../../URL";
import nodePackage from '../../../../../package.json';

export default class Version {

    static populate() {

        $.get(URL.version.number, function (data) {
            $("#build-version-container").append(data);
        });

        $.get(URL.version.timestamp, function (data) {
            $("#build-timestamp-container").append(data);
        });

        $("#admin-ui-version-container").html(nodePackage.version);
        $("#admin-ui-timestamp-container").html($('html').attr('data-built-at').replace(/T/, ' ').replace(/(\.\d+)?Z/, ' UTC'));

    }

}

