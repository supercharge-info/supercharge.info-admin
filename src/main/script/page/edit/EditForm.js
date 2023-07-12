import "jquery-serializejson";
import URL from "../../URL";
import FormFiller from "../../util/FormFiller";
import EventBus from "../../util/EventBus";
import EditEvents from "./EditEvents";

export default class EditForm {

    constructor() {
        this.isReload = false;

        this.siteEditForm = $('#site-edit-form');
        this.messageBox = $("#edit-site-message-div");

        this.siteEditForm.on('reset', () => this.handleReset());
        EventBus.addListener(EditEvents.site_loaded, this.loadNewSite, this);
        EventBus.addListener(EditEvents.load_history_complete, this.historyButtonUpdate, this);
        EventBus.addListener(EditEvents.load_change_log_complete, this.changeLogButtonUpdate, this);

        this.latitudeInput = $("#latitude-input");
        this.latitudeInput.on('paste', $.proxy(this.handleLatitudeChange, this));
        this.longitudeInput = $("#longitude-input");
        this.longitudeInput.on('paste', $.proxy(this.handleLongitudeChange, this));

        $.getJSON(URL.data.country, $.proxy(this.populateCountryOptions, this));

        this.initButtons();
    }

    initButtons() {
        this.copyButton = $("#edit-site-copy-button");
        this.saveButton = $("#edit-site-save-button");
        this.elevationButton = $("#elevation-lookup-button");
        this.editHistButton = $("#edit-site-history-button");
        this.changeLogButton = $("#change-site-history-button");

        this.saveButton.click($.proxy(this.handleSaveButton, this));
        this.copyButton.click($.proxy(this.handleCopyButton, this));
        this.elevationButton.click($.proxy(this.handleElevationLookupButton, this));
        this.editHistButton.click($.proxy(this.handleHistoryButton, this));
        this.changeLogButton.click($.proxy(this.handleChangeLogButton, this));
        this.enableButtons(false);
    }

    enableButtons(enabled) {
        /* Activate buttons */
        this.elevationButton.add(this.editHistButton).add(this.changeLogButton)
            .add(this.copyButton).prop('disabled', !enabled);
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
    }

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
    }

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
        $('input[name="notify"][value="yes"]').closest('.btn').button('toggle');
        this.enableButtons(true);
        $('html').animate({ scrollTop: 0, scrollLeft: 0 });
    }

    populateCountryOptions(countries) {
        $("#address-country-select").append(
            countries.sort((a,b) =>
                // Sort USA, then China, then alphabetic
                a.name == 'USA' ? -1 : b.name == 'USA' ? 1 : a.name == 'China' ? -1 : b.name == 'China' ? 1 : a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
            ).map(
                country => $("<option value='" + country.id + "'>" + country.name + "</option>")
            )
        );

    }

    handleReset() {
        $('input[name="notify"][value="yes"]').closest('.btn').button('toggle');
        this.enableButtons(false);
    }

    handleCopyButton() {
        this.siteEditForm.find("input[name='id']").val("");
        this.siteEditForm.find("input[name='dateModified']").val("");
        this.enableButtons(false);
    }

    handleElevationLookupButton(event) {
        event.preventDefault();
        const lat = this.latitudeInput.val();
        const lng = this.longitudeInput.val();
        if (lat && lng) {
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
        } else {
            alert('Please enter both latitude and longitude');
        }
    }

    /**
     * When "lat, lng" (or lat [space] lng) is pasted in latitude field move the lng value into the lng input
     */
    handleLatitudeChange() {
        const latInput = this.latitudeInput;
        const lngInput = this.longitudeInput;
        /* have to do this in a timeout because we receive this even before the pasted text is avail in input */
        setTimeout(() => {
            const pastedText = latInput.val().trim();
            const latLngArray = pastedText.match(/^(-?[0-9.]+)(?:\s+|\s*,\s*)(-?[0-9.]+)$/);
            if (latLngArray !== null) {
                const latArr = latLngArray[1].split('.');
                const lngArr = latLngArray[2].split('.');
                if (latArr.length <= 2 && lngArr.length <= 2) {
                    const newLat = latArr[0] + (latArr.length == 2 && latArr[1] ? '.' + latArr[1].substring(0, 6) : '');
                    const newLng = lngArr[0] + (lngArr.length == 2 && lngArr[1] ? '.' + lngArr[1].substring(0, 6) : '');
                    if (!isNaN(newLat) && !isNaN(newLng)) {
                        latInput.val(newLat);
                        lngInput.val(newLng);
                        this.elevationButton.click();
                    }
                }
            } else if (pastedText.match(/^-?[0-9.]+$/)) {
                const latArr = pastedText.split('.');
                if (latArr.length <= 2) {
                    const newLat = latArr[0] + (latArr.length == 2 && latArr[1] ? '.' + latArr[1].substring(0, 6) : '');
                    if (!isNaN(newLat)) {
                        latInput.val(newLat);
                        if (lngInput.val()) {
                            this.elevationButton.click();
                        }
                    }
                }
            }
        }, 50);
    }

    handleLongitudeChange() {
        const lngInput = this.longitudeInput;
        /* have to do this in a timeout because we receive this even before the pasted text is avail in input */
        setTimeout(() => {
            const pastedText = lngInput.val().trim();
            if (pastedText.match(/^-?[0-9.]+$/)) {
                const lngArr = pastedText.split('.');
                if (lngArr.length <= 2) {
                    const newLng = lngArr[0] + (lngArr.length == 2 && lngArr[1] ? '.' + lngArr[1].substring(0, 6) : '');
                    if (!isNaN(newLng)) {
                        lngInput.val(newLng);
                        if (this.latitudeInput.val()) {
                            this.elevationButton.click();
                        }
                    }
                 }
             }
         }, 50);
    }

    handleChangeLogButton(event) {
        event.preventDefault();
        this.changeLogButton.prop('disabled', true);
        const siteId = this.siteEditForm.find("input[name='id']").val();
        EventBus.dispatch(EditEvents.load_change_log_trigger, siteId);
    }

    changeLogButtonUpdate(event, loaded) {
        const icon = this.changeLogButton.find('span');
        this.changeLogButton.text(loaded ? " Hide Change Logs" : " Manage Change Logs")
            .prepend(icon)[loaded ? 'addClass' : 'removeClass']('active').prop('disabled', false);
        if (loaded && this.editHistButton.is('.active')) {
            const siteId = this.siteEditForm.find("input[name='id']").val();
            EventBus.dispatch(EditEvents.load_history_trigger, siteId);
        }
    }

    handleHistoryButton(event) {
        event.preventDefault();
        this.editHistButton.prop('disabled', true);
        const siteId = this.siteEditForm.find("input[name='id']").val();
        EventBus.dispatch(EditEvents.load_history_trigger, siteId);
    }

    historyButtonUpdate(event, loaded) {
        const icon = this.editHistButton.find('span');
        this.editHistButton.text(loaded ? " Hide Edit History" : " View Edit History")
            .prepend(icon)[loaded ? 'addClass' : 'removeClass']('active').prop('disabled', false);
        if (loaded && this.changeLogButton.is('.active')) {
            const siteId = this.siteEditForm.find("input[name='id']").val();
            EventBus.dispatch(EditEvents.load_change_log_trigger, siteId);
        }
    }

}
