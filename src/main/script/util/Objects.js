const Objects = {};

/**
 * Returns "" if the object is null.
 */
Objects.nullSafeToString = function (object) {
    return Objects.isNullOrUndef(object) ? "" : object.toString();
};

/**
 * true if null or undefined
 */
Objects.isNullOrUndef = function (object) {
    return ((object === null) || (typeof object === 'undefined'));
};

/**
 * true if NOT null and NOT undefined
 */
Objects.isNotNullOrUndef = function (object) {
    return ((object !== null) && (typeof object !== 'undefined'));
};

/**
 * true if a number
 */
Objects.isNumber = function (testArg) {
    return (typeof testArg === "number") && !isNaN(testArg);
};


export default Objects;

