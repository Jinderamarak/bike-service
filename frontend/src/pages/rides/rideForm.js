function distanceValidator(value) {
    if (value > 0) {
        return null;
    }
    return "Distance must be greater than 0";
}

/** @type {any} */
const rideForm = {
    mode: "uncontrolled",
    initialValues: {
        date: new Date(),
        distance: "",
        description: "",
    },
    validate: {
        distance: distanceValidator,
    },
};

export default rideForm;
