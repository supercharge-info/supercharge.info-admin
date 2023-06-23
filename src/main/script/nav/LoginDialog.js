import URL from "../URL";
import $ from "jquery";

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
            .on('submit', e => this.handleSubmitLogin());
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
    };

    loginSuccess(response) {
        this.button.prop('disabled', false);
        if (response.result === 'SUCCESS') {
            if (this.nav) {
                this.nav.handleLoginCheckResponse(response);
                if (this.destination) {
                    this.nav.changePage(this.destination);
                }
                this.dialog.modal('hide');
            } else {
                window.location.reload(true);
            }
        } else {
            this.errorBox.show().html(response.messages);
        }
    };

}

