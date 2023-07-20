import URL from "../../URL";
import EventBus from "../../util/EventBus";
import FeatureEvents from "./FeatureEvents";
import FormFiller from "../../util/FormFiller";

export default class FeatureForm {
    constructor() {
        this.isReload = false;
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
            error: r => this.handleSaveResponse(r.responseJSON),
            dataType: "json"
        });
    }


    handleSaveResponse(response) {
        const ok = response.result === 'SUCCESS';
        this.messageBox.addClass('alert').html('')
            .removeClass(ok ? 'alert-danger' : 'alert-success')
            .addClass(ok ? 'alert-success' : 'alert-danger');

        const icon = `<span class="glyphicon glyphicon-${ok ? 'ok' : 'exclamation-sign'}"></span>`;
        this.messageBox.append(response.messages.map(v => `${icon} ${v}<br />`));

        if (response.result === "SUCCESS") {
            this.isReload = true;
            EventBus.dispatch(FeatureEvents.feature_list_changed);
            EventBus.dispatch(FeatureEvents.feature_selected_for_edit, response.featureId);
        }
    }

    loadForEdit(event, featureId) {
        if (!this.isReload) {
            /* clear any existing message*/
            this.messageBox.html("").removeClass('alert alert-danger alert-success');
        } else {
            /* Ok, we have reloaded the feature after a save/edit, without clearing messages */
            this.isReload = false;
        }
        this.form.trigger("reset");
        $.getJSON(URL.feature.load + "/" + featureId, (feature) => {
            console.log(JSON.stringify(feature));
            FormFiller.populateForm(this.form, feature);
            const date = this.form.find('input[name="modifiedDate"]');
            date.val(new Date(date.val()).toLocaleString());
            $('html').animate({ scrollTop: 0, scrollLeft: 0 }, { complete: () => this.form[0].title.focus() });
        });
    }
}
