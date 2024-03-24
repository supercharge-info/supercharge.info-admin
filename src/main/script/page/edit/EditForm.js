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

        $.getJSON(URL.data.country, $.proxy(this.populateCountryOptions, this));
        $.getJSON(URL.data.parking, $.proxy(this.populateParkingOptions, this));

        EventBus.addListener(EditEvents.site_loaded, this.loadNewSite, this);
        EventBus.addListener(EditEvents.site_reset, this.resetForm, this);
        EventBus.addListener(EditEvents.site_deleted, this.handleDeleteResponse, this);
        EventBus.addListener(EditEvents.load_history_complete, this.historyButtonUpdate, this);
        EventBus.addListener(EditEvents.load_change_log_complete, this.changeLogButtonUpdate, this);

        this.siteEditForm.find('select[name="status"]').on('change', () => this.handleStatusChange());
        this.siteEditForm.find('select[name="address[countryId]"]').on('change', () => this.handleCountryChange());
        this.latitudeInput = $("#latitude-input");
        this.latitudeInput.on('paste', $.proxy(this.handleLatitudeChange, this));
        this.longitudeInput = $("#longitude-input");
        this.longitudeInput.on('paste', $.proxy(this.handleLongitudeChange, this));

        this.initButtons();
    }

    initButtons() {
        this.copyButton = $("#edit-site-copy-button");
        this.saveButton = $("#edit-site-save-button");
        this.elevationButton = $("#elevation-lookup-button");
        this.editHistButton = $("#edit-site-history-button");
        this.changeLogButton = $("#change-site-history-button");
        this.deleteButton = $("#edit-site-delete-button");

        $("#edit-site-reset-button").on('click', e => this.handleResetButton(e));
        this.saveButton.click($.proxy(this.handleSaveButton, this));
        this.copyButton.click($.proxy(this.handleCopyButton, this));
        this.elevationButton.click($.proxy(this.handleElevationLookupButton, this));
        this.editHistButton.click($.proxy(this.handleHistoryButton, this));
        this.changeLogButton.click($.proxy(this.handleChangeLogButton, this));
        this.deleteButton.click($.proxy(this.handleDeleteButton, this));
        this.enableButtons(false);
    }

    toggleDeleteButton(show) {
        this.deleteButton.closest('#delete-container').toggle(show);
    }

    enableButtons(enabled) {
        /* Activate buttons */
        this.editHistButton.add(this.changeLogButton).add(this.deleteButton)
            .add(this.copyButton).prop('disabled', !enabled);
    }

    handleSaveButton(event) {
        event.preventDefault();
        const data = this.siteEditForm.serializeJSON();
        if ($('#edit-change-detail-table .btn').length) {
            if (!confirm('You have unsaved changelog edits that will be lost, continue?')) {
                return;
            }
        }
        $.ajax({
            type: "POST",
            url: URL.site.edit,
            contentType: "application/json",
            data: JSON.stringify(data),
            success: $.proxy(this.handleSaveResponse, this),
            dataType: "json"
        });
    }

    handleDeleteResponse(event, siteId) {
        this.resetForm();
        this.handleSaveResponse({
            result: 'DELETED',
            messages: [`Site ${siteId} has been successfully deleted.`]
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
            EventBus.dispatch(EditEvents.site_edit_selection, response.siteId);
            EventBus.dispatch(EditEvents.site_list_changed);
        }
    }

    loadNewSite(event, site) {
        if (!this.isReload) {
            /* clear any existing message */
            this.siteEditForm.trigger('reset');
            this.messageBox.html("").removeClass('alert alert-danger alert-success');
            EventBus.dispatch(EditEvents.clear_panels);
        } else {
            /* Ok, we have reloaded the site after a save/edit, without clearing messages */
            this.isReload = false;
        }

        /* populate form */
        FormFiller.populateForm(this.siteEditForm, site);
        this.handleStatusChange(true);
        this.handleCountryChange();
        const date = this.siteEditForm.find('input[name="dateModified"]');
        date.val(new Date(date.val()).toLocaleString());
        this.siteEditForm.find('input[name="notify"][value="yes"]').closest('.btn').button('toggle');
        this.enableButtons(true);
        $('html').animate({ scrollTop: 0, scrollLeft: 0 });

        EventBus.dispatch(EditEvents.site_list_highlight, site.id);
    }

    populateCountryOptions(countries) {
        this.countries = Object.fromEntries(countries.map(c => [c.id, c]));
        $("#address-country-select").append(
            countries.sort((a,b) =>
                // Sort USA, then China, then alphabetic
                a.name == 'USA' ? -1 : b.name == 'USA' ? 1
                : a.name == 'China' ? -1 : b.name == 'China' ? 1
                : a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
            ).map(
                c => $("<option value='" + c.id + "'>" + c.name + "</option>")
            )
        );
    }

    populateParkingOptions(parking) {
        this.parking = Object.fromEntries(parking.map(p => [p.parkingId, p]));
        $("#parking-select").append(
            parking.map(
                p => $(`<option value='${p.parkingId}' title='${p.description}'>${p.name}</option>`)
            )
        );
    }

    handleResetButton(event) {
        event.preventDefault();
        this.resetForm();
        this.messageBox.html("").removeClass('alert alert-danger alert-success');
    }

    resetForm() {
        EventBus.dispatch(EditEvents.site_list_highlight, 0);
        EventBus.dispatch(EditEvents.clear_panels);
        this.siteEditForm.trigger('reset');
        this.handleStatusChange(true);
        this.handleCountryChange();
        this.enableButtons(false);
    }

    handleCopyButton() {
        this.siteEditForm.find("input[name='id']").val("");
        this.siteEditForm.find("input[name='dateModified']").val("");
        this.siteEditForm.find("input[name='version']").val("");
        EventBus.dispatch(EditEvents.site_list_highlight, 0);
        EventBus.dispatch(EditEvents.clear_panels);
        this.enableButtons(false);
        this.handleStatusChange(true);
    }

    handleStatusChange(reset) {
        const newStatus = this.siteEditForm.find('select[name="status"]').val();
        if (reset) {
            if (this.siteEditForm.find("input[name='id']").val()) {
                this.status = newStatus;
            } else {
                this.status = null;
            }
        }
        this.siteEditForm.find('input[name="notify"]').closest('.btn-group')
            .children()[this.status == newStatus ? 'addClass' : 'removeClass']('disabled');
    }

    handleCountryChange() {
        if (!this.countries) return;
        const PLUG_MAP = {
            "plugTPC"       : "plugs[tpc]",
            "plugNACS"      : "plugs[nacs]",
            "plugCCS1"      : "plugs[ccs1]",
            "plugCCS2"      : "plugs[ccs2]",
            "plugType2"     : "plugs[type2]",
            "plugGBT"       : "plugs[gbt]"
        };
        const newCountry = this.countries[this.siteEditForm.find('select[name="address[countryId]"]').val()];
        for (var x in PLUG_MAP) {
            var plugField = this.siteEditForm.find(`input[name="${PLUG_MAP[x]}"]`);
            if (newCountry && newCountry[x]) {
                plugField[0].removeAttribute('readonly');
                plugField.removeClass('gray');
            } else {
                plugField[0].setAttribute('readonly', true);
                plugField[0].value = '';
                plugField.addClass('gray');
            }
        }
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

    handleDeleteButton(event) {
        event.preventDefault();
        const siteId = this.siteEditForm.find("input[name='id']").val();
        const siteName = this.siteEditForm.find("input[name='name']").val();
        EventBus.dispatch(EditEvents.site_delete_selection, siteId, siteName);
    }

}
