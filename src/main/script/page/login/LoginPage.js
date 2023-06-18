import {currentUser} from "../../nav/User";
import URL from "../../URL";
import $ from "jquery";
import Version from "./Version";
import SiteEditsGraph from "./SiteEditsGraph";

/**
 * @constructor
 */

class LoginPage {

    constructor() {
        this.loginButton = $("#login-button");

        this.errorBox = $("#login-error-box");
        this.errorBox.css('display', 'none', 'important');

        this.viewAuthed = $("#login-authed-container");
        this.viewNotAuthed = $("#login-not-authed-container");
        this.logoutButton = $("#login-logout-trigger");

        this.loginButton.click($.proxy(this.handleSubmitLogin, this));
        this.logoutButton.click($.proxy(this.handleLogout, this));

        new Version().populate();
    }

    onPageShow() {
        $.getJSON(URL.login.check, $.proxy(this.handleLoginCheckResponse, this));
        $.getJSON(URL.login.results, LoginPage.handleLoginResults);
    };

    handleSubmitLogin() {
        const username = $("#name").val();
        const password = $("#word").val();
        const loginSuccessFunction = $.proxy(this.loginSuccess, this);
        $.ajax({
            type: "POST",
            url: URL.login.login,
            data: "username=" + username + "&password=" + password,
            beforeSend: $.proxy(this.beforeSend, this)
        }).done(loginSuccessFunction)
            .fail(function (jqXHR, textStatus, errorThrown) {
                // We go here on bad password, etc, because server side
                // responds with 401/Unauthorized.
                loginSuccessFunction(jqXHR.responseJSON);
            });
        return false;
    };

    loginSuccess(response) {
        this.loginButton.removeClass('disabled');
        if (response.result === 'SUCCESS') {
            window.location.reload(true);
        } else {
            this.errorBox.css('display', 'inline', 'important');
            this.errorBox.html(response.messages);
        }
    };

    beforeSend() {
        this.errorBox.css('display', 'inline', 'important');
        this.loginButton.addClass('disabled');
    };

    handleLoginCheckResponse(response) {
        if (response !== null && response.result === "SUCCESS") {
            currentUser.setUsername(response.username);
            currentUser.setRoles(response.roles);
            this.viewAuthed.css('display', 'block');
            this.viewNotAuthed.hide();
        } else {
            currentUser.setUsername(null);
            currentUser.setRoles([]);
            this.viewAuthed.hide();
            this.viewNotAuthed.show();
        }
    };

    static handleLoginResults(response) {
        const table = $("#login-attempts-table").show().find("tbody").html("");
        $.each(response.attempts, function (index, attempt) {
            table.append("" +
                "<tr>" +
                "<td>" + attempt.date + "</td>" +
                "<td>" + attempt.result + "</td>" +
                "<td>" + attempt.remoteIP + "</td>" +
                "</tr>"
            )
        })
        SiteEditsGraph.draw(response.edits);
    };

    /**
     * Logout
     */
    handleLogout(event) {
        event.preventDefault();
        $.get(URL.login.logout).always(() => this.handleLoginCheckResponse(null));
    };

}


export default LoginPage;

