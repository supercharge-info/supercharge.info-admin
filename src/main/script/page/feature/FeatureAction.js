import EventBus from "../../util/EventBus";
import URL from "../../URL";
import FeatureEvents from "./FeatureEvents";

export default class FeatureAction {
    constructor() {
        EventBus.addListener(FeatureEvents.feature_selected_for_delete, this.doDelete, this);
    }

    doDelete(event, featureId) {
        $.post(URL.feature.delete, { featureId }, function () {
            EventBus.dispatch(FeatureEvents.feature_list_changed);
        }).fail(function () {
            alert("Error occurred while deleting " + featureId);
        });
    }

}
