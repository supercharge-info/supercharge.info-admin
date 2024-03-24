const mvc = "/service/supercharge";

const U = {};

U.login = {
    "login": mvc + "/login",
    "logout": mvc + "/login/out",
    "check": mvc + "/login/check"
};

U.account = {
    "stats": mvc + "/account/stats",
    "edits": mvc + "/account/edits"
};

U.change = {
    "list": mvc + "/allChanges",
    "delete": mvc + "/changes/delete",
    "restoreAdded": mvc + "/changes/restoreAdded"
};

U.val = {
    "database": mvc + "/validation/database",
    "webscrape": mvc + "/validation/webscrape"
};

U.site = {
    "delete": mvc + "/siteadmin/delete",
    "load": mvc + "/siteadmin/load",
    "loadAll": mvc + "/siteadmin/loadAll",
    "edit": mvc + "/siteadmin/edit",
    "changeDetail": mvc + "/siteadmin/changeDetail",
    "changeLog": mvc + "/siteadmin/changeLogEdits",
    "changeEdit": mvc + "/siteadmin/changeEdit",
    "changeAdd": mvc + "/siteadmin/changeAdd"
};

U.system = {
    "properties": mvc + "/system/properties"
};

U.feature = {
    "load": mvc + "/feature/load",
    "list": mvc + "/feature/list",
    "delete": mvc + "/feature/delete",
    "edit": mvc + "/feature/edit"
};

U.data = {
    country: mvc + "/countryAll",
    parking: mvc + "/parking"
};


U.version = {
    "number": mvc + "/version/number",
    "timestamp": mvc + "/version/timestamp"
};

export default U;

