import $ from "jquery";
import "bootstrap";
import Events from "../util/Events";
import Objects from "../util/Objects";
import LoginPage from "../page/login/LoginPage";
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

    this.pageMap = {
        login: {page: new LoginPage()},
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
    this.changePage("login");
};

NavBar.prototype.initListeners = function () {
    $("#navbar-menu-item-list").find("a").click($.proxy(this.handlePageChangeClick, this));
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
        if (!target.is(".dropdown-toggle") && (!target.is(".form-control") || target.closest(".navbar").length === 0)) {
            navbarCollapse.collapse('toggle');
        }
    }
};

NavBar.prototype.changePage = function (newPageName) {
    const navBar = this;

    $.each(this.pageMap, function (pageName, pageDefinition) {
        if (pageName === newPageName && newPageName !== navBar.currentPage) {
            const roleRequired = Objects.isNotNullOrUndef(pageDefinition.requiredRole);

            if (roleRequired && !currentUser.isAuthenticated()) {
                alert("Login to access page:" + newPageName);
                return;
            }
            if (roleRequired && !currentUser.hasRole(pageDefinition.requiredRole)) {
                alert("Insufficient privileges to access page:" + newPageName +
                    " need=" + pageDefinition.requiredRole +
                    " have=" + currentUser.roles);
                return;
            }
            navBar.hideCurrentPage();
            navBar.currentPage = newPageName;
            navBar.showCurrentPage();
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

export default NavBar;


