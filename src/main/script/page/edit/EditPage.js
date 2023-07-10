import EditList from "./EditList";
import EditForm from "./EditForm";
import ChangeDetailTable from "./ChangeDetailTable";
import ChangeLogTable from "./ChangeLogTable";

export default class EditPage {

    constructor() {
        this.editList = null;
    }

    onPageShow() {
        if (!EditPage.init) {
            this.editList = new EditList();
            new EditForm();
            new ChangeDetailTable();
            new ChangeLogTable();
            EditPage.init = true;
        }

        this.editList.loadSiteList();
    }

}



