import $ from "jquery";
import "bootstrap";
import Events from "../util/Events";
import Objects from "../util/Objects";
import URL from "../URL";
import LoginDialog from "./LoginDialog";
import AccountPage from "../page/account/AccountPage";
import ApiPage from "../page/api/ApiPage";
import ValidationPage from "../page/validation/ValidationPage";
import ComparePage from "../page/compare/ComparePage";
import FeaturePage from "../page/feature/FeaturePage";
import EditPage from "../page/edit/EditPage";
import ChangeLogPage from "../page/changeLog/ChangeLogPage";
import SystemPage from "../page/system/SystemPage";
import {currentUser} from "./User";


/**
 * Constructor
 */
const NavBar = function () {
    this.initListeners();
    this.login = new LoginDialog(this);
    this.loginLink = $("#login-link");
    this.usernameLink = $("#username-link");

    $("#logout-link").click($.proxy(this.handleLogoutClick, this));

    this.pageMap = {
        account: {requiredRole: "any", page: new AccountPage()},
        api: {page: new ApiPage()},
        comparison: {requiredRole: "editor", page: new ComparePage()},
        validation: {requiredRole: "editor", page: new ValidationPage()},
        edit: {requiredRole: "editor", page: new EditPage()},
        changeLog: {requiredRole: "editor", page: new ChangeLogPage()},
        feature: {requiredRole: "feature", page: new FeaturePage()},
        system: {requiredRole: "admin", page: new SystemPage()}
    }
};

NavBar.prototype.setInitialPage = function () {
    this.changePage("api");

    $.getJSON(URL.login.check, r => {
        this.handleLoginCheckResponse(r);

        if (currentUser.hasRole('editor')) {
            this.changePage('edit'); 
        } else if (currentUser.isAuthenticated()) {
            this.changePage("account");
        }
    });
};

NavBar.prototype.initListeners = function () {
    $("#navbar-menu-item-list").find("a[href]").click($.proxy(this.handlePageChangeClick, this));
    $("body").click($.proxy(this.autoCloseCollapsedNavBar, this));
};

NavBar.prototype.handlePageChangeClick = function (event) {
    const eventDetail = Events.eventDetail(event);
    this.changePage(eventDetail.actionName);
};

NavBar.prototype.autoCloseCollapsedNavBar = function (event) {
    const navbarCollapse = $(".navbar-collapse");
    if ($(".navbar-toggle").is(":visible") && navbarCollapse.is(":visible")) {
        const target = $(event.target);
        if (!target.closest(".dropdown-toggle").length && (!target.is(".form-control") || target.closest(".navbar").length === 0)) {
            navbarCollapse.collapse('toggle');
        }
    }
};

NavBar.prototype.changePage = function (newPageName) {
    Object.entries(this.pageMap).forEach(([pageName, pageDefinition]) => {
        if (pageName === newPageName && newPageName !== this.currentPage) {
            const roleRequired = Objects.isNotNullOrUndef(pageDefinition.requiredRole);

            if (roleRequired && !currentUser.isAuthenticated()) {
                this.login.show(newPageName);
                return;
            }
            if (roleRequired && pageDefinition.requiredRole != 'any' && !currentUser.hasRole(pageDefinition.requiredRole)) {
                alert("Insufficient privileges to access page:" + newPageName +
                    " need=" + pageDefinition.requiredRole +
                    " have=" + currentUser.roles);
                return;
            }
            this.hideCurrentPage();
            this.currentPage = newPageName;
            this.showCurrentPage();
            pageDefinition.page.onPageShow();
        }
    });
};

NavBar.prototype.hideCurrentPage = function () {
    $("#page-" + this.currentPage).hide();
    $("#page-link-" + this.currentPage).closest("li").removeClass("active");
};

NavBar.prototype.showCurrentPage = function () {
    $("#page-" + this.currentPage).show();
    $("#page-link-" + this.currentPage).closest("li").addClass("active");
    $('html').scrollTop(0).scrollLeft(0);
};

/**
 * Logout
 */
NavBar.prototype.handleLogoutClick = function(event) {
    event.preventDefault();
    $.get(URL.login.logout).always(() => this.handleLoginCheckResponse(null));
};

NavBar.prototype.handleLoginCheckResponse = function(response) {
    if (response !== null && response.result === "SUCCESS") {
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
        this.changePage("api");
    }
};


export default NavBar;


