import "jquery-serializejson";
import $ from "jquery";
import URL from "../../URL";
import FormFiller from "../../util/FormFiller";
import EventBus from "../../util/EventBus";
import EditEvents from "./EditEvents";

export default class EditForm {

    constructor() {
        this.isReload = false;

        this.siteEditForm = $('#site-edit-form');
        this.messageBox = $("#edit-site-message-div");

        EventBus.addListener(EditEvents.site_loaded, this.loadNewSite, this);

        this.latitudeInput = $("#latitude-input");
        this.latitudeInput.bind('paste', $.proxy(this.handleLatitudeChange, this));

        $.getJSON(URL.data.country, $.proxy(this.populateCountryOptions, this));

        this.initButtons();
    }

    initButtons() {
        this.copyButton = $("#edit-site-copy-button");
        this.saveButton = $("#edit-site-save-button");
        this.elevationButton = $("#elevation-lookup-button");
        this.changeHistButton = $("#edit-site-history-button");

        this.saveButton.click($.proxy(this.handleSaveButton, this));
        this.copyButton.click($.proxy(this.handleCopyButton, this));
        this.elevationButton.click($.proxy(this.handleElevationLookupButton, this));
        this.changeHistButton.click($.proxy(this.handleHistoryButton, this))
    }

    handleSaveButton(event) {
        event.preventDefault();
        const data = this.siteEditForm.serializeJSON();
        $.ajax({
            type: "POST",
            url: URL.site.edit,
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
            this.isReload = true;
            EventBus.dispatch(EditEvents.site_edit_selection, response.siteId);
            EventBus.dispatch(EditEvents.site_list_changed);
        }
    };

    loadNewSite(event, site) {
        if (!this.isReload) {
            /* clear any existing message*/
            this.messageBox.html("");
        } else {
            /* Ok, we have reloaded the site after a save/edit, without clearing messages */
            this.isReload = false;
        }

        /* populate form */
        FormFiller.populateForm(this.siteEditForm, site);
    };

    populateCountryOptions(countries) {
        const select = $("#address-country-select");

        $.each(countries, function (index, country) {
            select.append("<option value='" + country.id + "'>" + country.name + "</option>");
        });

    };

    handleCopyButton(countries) {
        this.siteEditForm.find("input[name='id']").val("");
        this.siteEditForm.find("input[name='dateModified']").val("");
    };

    handleElevationLookupButton(event) {
        event.preventDefault();
        const lat = this.siteEditForm.find("input[name='gps[latitude]']").val();
        const lng = this.siteEditForm.find("input[name='gps[longitude]']").val();
        const elevationService = new google.maps.ElevationService;
        const elevationField = this.siteEditForm.find("input[name='elevationMeters']");
        elevationService.getElevationForLocations({
            'locations': [new google.maps.LatLng(lat, lng, false)]
        }, function (results, status) {
            if (status === 'OK') {
                // Retrieve the first result
                if (results[0]) {
                    elevationField.val(Math.round(results[0].elevation));
                } else {
                    elevationField.val("NONE");
                }
            } else {
                elevationField.val('Elevation service failed due to: ' + status);
            }
        });
    };

    /**
     * When "lat, lng" (or lat [space] lng) is pasted in latitude field move the lng value into the lng input
     */
    handleLatitudeChange(event) {
        const latInput = this.siteEditForm.find("input[name='gps[latitude]']");
        const lngInput = this.siteEditForm.find("input[name='gps[longitude]']");
        /* have to do this in a timeout because we receive this even before the pasted text is avail in input */
        setTimeout(function () {
            const pastedText = latInput.val().trim();
            const latLngArray = pastedText.match(/^([0-9.-]+)(\s+|\s*,\s*)([0-9.-]+)$/);
            if (latLngArray !== null) {
                const newLat = latLngArray[1].trim();
                const newLng = latLngArray[3].trim();
                if (!isNaN(newLat) && !isNaN(newLng)) {
                    latInput.val(newLat);
                    lngInput.val(newLng);
                }
            }
        }, 50);
    };

    handleHistoryButton(event) {
        event.preventDefault();
        const siteId = this.siteEditForm.find("input[name='id']").val();
        EventBus.dispatch(EditEvents.load_history_trigger, siteId);
    }

};