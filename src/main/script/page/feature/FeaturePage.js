import EventBus from "../../util/EventBus";
import URL from "../../URL";
import FeatureForm from "./FeatureForm";
import FeatureEvents from "./FeatureEvents";
import FeatureAction from "./FeatureAction";
import {currentUser} from "../../nav/User";

export default class FeaturePage {

    constructor() {
        this.table = $("#feature-table");
        new FeatureForm();
        new FeatureAction();
        EventBus.addListener(FeatureEvents.feature_list_changed, this.loadTable, this);
    }

    onPageShow() {
        this.loadTable();
    }

    loadTable() {
        $.getJSON(URL.feature.list, $.proxy(this.populateTable, this));
    }

    populateTable(feedbackArray) {
        const tableHead = this.table.find("thead");
        const tableBody = this.table.find("tbody");
        tableHead.html("" +
            "<tr>" +
            "<th>#</th>" +
            "<th>Action</th>" +
            "<th>Id</th>" +
            "<th>Date</th>" +
            "<th>Title</th>" +
            "<th>Description</th>" +
            "</tr>" +
            "");
        tableBody.html("");
        $.each(feedbackArray, function (index, feature) {
            tableBody.append("" +
                `<tr>` +
                `<td>${index + 1}</td>` +
                "<td>" +
                `<a href='' class='feature-edit-trigger' data-id='${feature.id}'>edit</a>` +
                (!currentUser.hasRole("admin") ? "" : "<br/><br/>" +
                `<a href='' class='feature-delete-trigger' data-id='${feature.id}'>delete</a>`) +
                "</td>" +
                `<td>${feature.id}</td>` +
                `<td>${feature.addedDate}</td>` +
                `<td>${feature.title}</td>` +
                `<td>${feature.description}</td>` +
                "</tr>"
            );

        });

        $(".feature-edit-trigger").on("click", FeaturePage.handleEditClick);
        $(".feature-delete-trigger").on("click", FeaturePage.handleDeleteClick);
    }


    static handleEditClick(event) {
        event.preventDefault();
        const siteId = $(event.target).data("id");
        EventBus.dispatch(FeatureEvents.feature_selected_for_edit, siteId);
    }

    static handleDeleteClick(event) {
        event.preventDefault();
        const feedbackId = $(event.target).data("id");
        if (confirm("Delete feature " + feedbackId + "?")) {
            EventBus.dispatch(FeatureEvents.feature_selected_for_delete, feedbackId);
        }
    }

}
