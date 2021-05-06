import URL from "../../URL";
import $ from 'jquery'
import nodePackage from '../../../../../package.json'

/**
 *
 * @constructor
 */
class Version {

    populate() {

        $.get(URL.version.number, function (data) {
            $("#build-version-container").append(data);
        });

        $.get(URL.version.timestamp, function (data) {
            $("#build-timestamp-container").append(data);
        });

        $("#admin-ui-version-container").html(nodePackage.version)

    }

}

export default Version;

