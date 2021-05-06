import $ from "jquery";
import Objects from "../util/Objects";


/**
 * Constructor
 */
export class User {
    constructor() {
        this.roles = [];
        this.username = null;
    }

    setRoles(newValues) {
        this.roles = newValues;
    };

    setUsername(username) {
        this.username = username;
    };

    hasRole(roleName) {
        return $.inArray(roleName, this.roles) >= 0;
    };

    isAuthenticated() {
        return Objects.isNotNullOrUndef(this.username);
    };


}

/**
 * Client side GLOBAL variable for the current user.
 * @type {User}
 */
export const currentUser = new User();
