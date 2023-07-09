import 'bootstrap';
import EventBus from "../util/EventBus";
import Events from "../util/Events";
import URL from "../URL";
import LoginDialog from "./LoginDialog";
import ApiPage from "../page/api/ApiPage";
import {currentUser} from "./User";

export default class NavBar {
    /**
     * Constructor
     */
    constructor() {
        this.initListeners();
        this.login = new LoginDialog();
        this.loginLink = $("#login-link");
        this.usernameLink = $("#username-link");

        $("#logout-link").click(NavBar.handleLogoutClick);
        EventBus.addListener("change-page", this.changePage, this);
        EventBus.addListener("login-response", this.handleLoginCheckResponse, this);

        this.pageMap = {
            api: {page: new ApiPage()}
        };
        this.loading = true;
        import('./DeferredPages').then(({ default: getPages }) => {
            this.pageMap = { ...this.pageMap, ...getPages() };
            if (this.loading !== true) {
                $('#loading').modal('hide');
                EventBus.dispatch("change-page", this.loading);
            }
            this.loading = false;
        });
    }

    setInitialPage() {
        EventBus.dispatch("change-page", "api");

        $.getJSON(URL.login.check, r => {
            EventBus.dispatch("login-response", r);

            if (currentUser.hasRole('editor')) {
                EventBus.dispatch("change-page", "edit");
            } else if (currentUser.isAuthenticated()) {
                EventBus.dispatch("change-page", "account");
            }
        });
    }

    initListeners() {
        $("#navbar-menu-item-list").find("a[href]").click(NavBar.handlePageChangeClick);
        $("body").click(NavBar.autoCloseCollapsedNavBar);
    }

    /**
     * Navigation
     */
    static handlePageChangeClick(event) {
        const eventDetail = Events.eventDetail(event);
        EventBus.dispatch("change-page", eventDetail.actionName);
    }

    static autoCloseCollapsedNavBar(event) {
        const navbarCollapse = $(".navbar-collapse");
        if ($(".navbar-toggle").is(":visible") && navbarCollapse.is(":visible")) {
            const target = $(event.target);
            if (!target.closest(".dropdown-toggle").length && (!target.is(".form-control") || target.closest(".navbar").length === 0)) {
                navbarCollapse.collapse('toggle');
            }
        }
    }

    changePage(event, newPageName) {
        const { role, page } = this.pageMap[newPageName] || {};
        if (newPageName === this.currentPage) {
            return;
        } else if (page) {
            if (role && !currentUser.isAuthenticated()) {
                this.login.show(newPageName);
                return;
            }
            if (role && role != 'any' && !currentUser.hasRole(role)) {
                alert("Insufficient privileges to access page:" + newPageName +
                    " need=" + role +
                    " have=" + (currentUser.roles || 'none'));
                return;
            }
            this.hideCurrentPage();
            this.currentPage = newPageName;
            this.showCurrentPage();
            page.onPageShow();
        } else if (this.loading) {
            this.loading = newPageName;
            setTimeout(() => {
                if(this.loading && !$('#loading').length) {
                    $('<div class="modal fade" id="loading" tabindex="-1" role="dialog"><div class="modal-dialog modal-dialog-centered modal-sm"><div class="modal-content"><div class="modal-body">Loading, please wait...</div></div></div></div>').appendTo('body')
                    .on('hidden.bs.modal', e => $(e).remove()).modal({ backdrop: 'static', keyboard: false });
                }
            }, 500);
        }
    }

    hideCurrentPage() {
        $("#page-" + this.currentPage).hide();
        $("#page-link-" + this.currentPage).closest("li").removeClass("active");
    }

    showCurrentPage() {
        $("#page-" + this.currentPage).show();
        $("#page-link-" + this.currentPage).closest("li").addClass("active");
        $('html').scrollTop(0).scrollLeft(0);
    }

    /**
     * Logout
     */
    static handleLogoutClick(event) {
        event.preventDefault();
        $.get(URL.login.logout).always(() => EventBus.dispatch("login-response"));
    }

    handleLoginCheckResponse(event, response) {
        if (response?.result === "SUCCESS") {
            currentUser.setUsername(response.username);
            currentUser.setRoles(response.roles);
            this.loginLink.hide();
            this.usernameLink.html(
                `<span class='glyphicon glyphicon-user' aria-hidden='true'></span> <span class="username">${response.username}</span> <span class='caret'/>`
            ).show();
        } else {
            currentUser.setUsername(null);
            currentUser.setRoles([]);
            this.usernameLink.hide();
            this.loginLink.show();
            EventBus.dispatch("change-page", "api");
        }
    }
}
