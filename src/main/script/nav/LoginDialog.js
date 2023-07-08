import URL from "../URL";
import EventBus from "../util/EventBus";

/**
 * @constructor
 */

export default class LoginDialog {

    constructor(nav) {
        this.nav = nav;
        this.dialog = $("#login-dialog");
        this.button = $("#login-button");

        this.errorBox = $("#login-error-box");
        this.errorBox.hide();

        this.dialog.on('shown.bs.modal', () => $('#name').focus())
            .on('hidden.bs.modal', () => this.onHide())
            .on('submit', () => this.handleSubmitLogin());
    }

    show(page) {
        this.destination = page;
        this.dialog.modal('show');
    }

    onHide() {
        this.destination = null;
        this.errorBox.hide();
        $("#name, #word").val('');
    }

    handleSubmitLogin() {
        const username = $("#name").val();
        const password = $("#word").val();
        $.ajax({
            type: "POST",
            url: URL.login.login,
            data: "username=" + username + "&password=" + password,
            beforeSend: () => this.button.prop('disabled', true),
            success: d => this.loginSuccess(d),
            error: d => this.loginSuccess(d.responseJSON)
        });
        return false;
    }

    loginSuccess(response) {
        this.button.prop('disabled', false);
        if (response.result === 'SUCCESS') {
            EventBus.dispatch("login-response", response);
            if (this.destination) {
                EventBus.dispatch("change-page", this.destination);
            }
            this.dialog.modal('hide');
        } else {
            this.errorBox.show().html(response.messages);
        }
    }

}

