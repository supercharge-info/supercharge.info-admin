const EditEvents = {

    /**
     * Indicates that data in the list of sited to edit has changed, and that the list should be reloaded.
     */
    site_list_changed: "site_list_changed",

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



