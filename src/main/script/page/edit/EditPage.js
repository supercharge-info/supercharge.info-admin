import EditList from "./EditList";
import EditForm from "./EditForm";
import ChangeDetailTable from "./ChangeDetailTable";
import ChangeLogTable from "./ChangeLogTable";
import {currentUser} from "../../nav/User";

export default class EditPage {

    constructor() {
        this.editList = null;
        this.editForm = null;
    }

    onPageShow() {
        if (!EditPage.init) {
            this.editList = new EditList();
            this.editForm = new EditForm();
            new ChangeDetailTable();
            new ChangeLogTable();
            EditPage.init = true;
        }

        this.editList.loadSiteList();
        this.editForm.resetForm();
        this.editForm.toggleDeleteButton(currentUser.hasRole('admin'));
    }

}



