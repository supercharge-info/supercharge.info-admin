import AccountPage from "../page/account/AccountPage";
import ValidationPage from "../page/validation/ValidationPage";
import ComparePage from "../page/compare/ComparePage";
import FeaturePage from "../page/feature/FeaturePage";
import EditPage from "../page/edit/EditPage";
import ChangeLogPage from "../page/changeLog/ChangeLogPage";
import SystemPage from "../page/system/SystemPage";
import '../../css/deferred.css';

export default function() {
	return {
        account: {role: "any", page: new AccountPage()},
        comparison: {role: "editor", page: new ComparePage()},
        validation: {role: "editor", page: new ValidationPage()},
        edit: {role: "editor", page: new EditPage()},
        changeLog: {role: "editor", page: new ChangeLogPage()},
        feature: {role: "feature", page: new FeaturePage()},
        system: {role: "admin", page: new SystemPage()}
    };
}
