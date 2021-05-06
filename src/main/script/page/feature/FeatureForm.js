import $ from "jquery";
import URL from "../../URL";
import EventBus from "../../util/EventBus";
import FeatureEvents from "./FeatureEvents";
import FormFiller from "../../util/FormFiller";

export default class FeatureForm {
    constructor() {
        this.saveButton = $("#feature-save-button");
        this.form = $("#feature-form");
        this.messageBox = $("#feature-edit-message-box");
        this.saveButton.click($.proxy(this.handleSaveButton, this));

        EventBus.addListener(FeatureEvents.feature_selected_for_edit, this.loadForEdit, this);
    }


    handleSaveButton(event) {
        event.preventDefault();
        const data = this.form.serializeJSON();
        $.ajax({
            type: "POST",
            url: URL.feature.edit,
            contentType: "application/json",
            data: JSON.stringify(data),
            success: $.proxy(this.handleSaveResponse, this),
            dataType: "json"
        });
    };


    handleSaveResponse(response) {
        this.messageBox.html("<ul></ul>");
        this.messageBox.attr('style', (response.result === "SUCCESS") ? 'color:green' : 'color:red');
        const ol = this.messageBox.find("ul");
        $.each(response.messages, function (index, value) {
            ol.append(`<li>${value}</li>`);
        });

        if (response.result === "SUCCESS") {
            EventBus.dispatch(FeatureEvents.feature_list_changed);
            EventBus.dispatch(FeatureEvents.feature_selected_for_edit, response.featureId);
        }
    };

    loadForEdit(event, featureId) {
        this.form.trigger("reset");
        $.getJSON(URL.feature.load + "/" + featureId, function (feature) {
            console.log(JSON.stringify(feature));
            FormFiller.populateForm(this.form, feature);
        });
    };
}