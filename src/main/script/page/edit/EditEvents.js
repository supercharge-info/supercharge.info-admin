const EditEvents = {

    /**
     * Indicates that data in the list of sited to edit has changed, and that the list should be reloaded.
     */
    site_list_changed: "site_list_changed",

    /**
     * Indicates a site has been selected or the table has been redrawn, and highlighting on the list should be updated.
     */
    site_list_highlight: "site_list_highlight",

    /**
     * Indicates that the current site has been deleted, and that the form should be reset/list reloaded.
     */
    site_deleted: "site_deleted",

    /**
     * The 'delete' button on one site has been clicked.
     */
    site_delete_selection: "site_delete_selection",

    /**
     * The 'edit' button on one site has been clicked.
     */
    site_edit_selection: "site_edit_selection",

    /**
     * Indicates that a single site has be retrieved from the DB.
     * @data is loaded site object.
     */
    site_loaded: "site_loaded",

    /**
     * Reset the form to edit a site, allowing for state to be managed properly.
     */
    site_reset: "site_reset",

    /**
     * Clear panels associated with editing a site.
     */
    clear_panels: "clear_panels",

    /**
     * Indicates that history should be loaded for this specified site.
     * @data is siteId
     */
    load_history_trigger: "load_history_trigger",

    /**
     * Indicates that history table has completed loading or unloading.
     * @data is true/false
     */
    load_history_complete: "load_history_complete",

    /**
     * Indicates that changelogs should be loaded for this specified site.
     * @data is siteId
     */
    load_change_log_trigger: "load_change_log_trigger",

    /**
     * Indicates that changelog table has completed loading or unloading.
     * @data is true/false
     */
    load_change_log_complete: "load_change_log_complete"

};

export default EditEvents;



