import Objects from "./Objects";
import $ from "jquery";


export default class FormFiller {

    /**
     * General purpose method for populating the values ofr a <form> HTML element with the
     * values from a JSON object.
     *
     * @param formJQueryObject
     * @param valuesObject
     */
    static populateForm(formJQueryObject, valuesObject) {
        $.each(valuesObject, function (key, value) {
            if (value !== null && typeof value === "object") {
                $.each(value, function (innerKey, innerValue) {
                    FormFiller.populateField(key + "[" + innerKey + "]", formJQueryObject, innerValue);
                });
            } else {
                FormFiller.populateField(key, formJQueryObject, value);
            }
        });
    };

    static populateField(key, form, value) {
        const control = $('[name="' + key + '"]', form);
        if (Objects.isNullOrUndef(value)) {
            control.val(value);
        }
        else {
            control.val('' + value);
        }
    }

}