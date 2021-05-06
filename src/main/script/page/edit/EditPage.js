import EditList from "./EditList";
import EditForm from "./EditForm";
import ChangeDetailTable from "./ChangeDetailTable";

export default class EditPage {

    constructor() {
        this.editList = null;
    }

    onPageShow() {
        if (!EditPage.init) {
            this.editList = new EditList();
            new EditForm();
            new ChangeDetailTable();
            EditPage.init = true;
        }

        this.editList.loadSiteList();
    };

};



