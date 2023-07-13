import URL from "../../URL";
import EventBus from "../../util/EventBus";
import FeatureEvents from "./FeatureEvents";
import FormFiller from "../../util/FormFiller";

export default class FeatureForm {
    constructor() {
        this.previewButton = $("#feature-preview-button");
        this.saveButton = $("#feature-save-button");
        this.form = $("#feature-form");
        this.messageBox = $("#feature-edit-message-box");
        this.previewButton.click($.proxy(this.handlePreviewButton, this));
        this.saveButton.click($.proxy(this.handleSaveButton, this));
        this.featuresPreview = $("#features-dialog");

        EventBus.addListener(FeatureEvents.feature_selected_for_edit, this.loadForEdit, this);
    }

    validateForm() {
        const invalid = this.form.find(':invalid');
        if (invalid.length) {
            if (invalid[0].reportValidity && invalid[0].validationMessage) {
                invalid.each((i, e) => e.reportValidity(e.validationMesage));
            } else {
                alert('Please fill out all form fields');
            }
            return false;
        }
        return true;
    }

    handlePreviewButton(event) {
        event.preventDefault();
        if (!this.validateForm()) return;

        this.featuresPreview.find(".modal-title").text("Preview");
        this.featuresPreview.find(".modal-body")
            .html(`<h3>${this.form[0].addedDate.value} - ${this.form[0].title.value}</h3>`)
            .append(`<p>${this.form[0].description.value}</p>`)
            .append("<br/><br/>");
        this.featuresPreview.modal("show");
    }

    handleSaveButton(event) {
        event.preventDefault();
        if (!this.validateForm()) return;

        const data = this.form.serializeJSON();
        $.ajax({
            type: "POST",
            url: URL.feature.edit,
            contentType: "application/json",
            data: JSON.stringify(data),
            success: $.proxy(this.handleSaveResponse, this),
            dataType: "json"
        });
    }


    handleSaveResponse(response) {
        this.messageBox.html("<ul></ul>");
        this.messageBox.attr('style', (response.result === "SUCCESS") ? 'color:green' : 'color:red');
        this.messageBox.find("ul").append(response.messages.map(v => `<li>${v}</li>`));

        if (response.result === "SUCCESS") {
            EventBus.dispatch(FeatureEvents.feature_list_changed);
            EventBus.dispatch(FeatureEvents.feature_selected_for_edit, response.featureId);
        }
    }

    loadForEdit(event, featureId) {
        this.form.trigger("reset");
        $.getJSON(URL.feature.load + "/" + featureId, (feature) => {
            console.log(JSON.stringify(feature));
            FormFiller.populateForm(this.form, feature);
            const date = this.form.find('input[name="modifiedDate"]');
            date.val(new Date(date.val()).toLocaleString());
            $('html').animate({ scrollTop: 0, scrollLeft: 0 }, { complete: () => this.form.find('textarea').focus() });
        });
    }
}
