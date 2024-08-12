function distanceValidator(value) {
    if (value > 0) {
        return null;
    }
    return "Distance must be greater than 0";
}

/** @type {any} */
export const rideForm = {
    mode: "uncontrolled",
    initialValues: {
        date: new Date(),
        distance: "",
        description: "",
        stravaRide: null,
    },
    validate: {
        distance: distanceValidator,
    },
};

export function rideFormToBody(values) {
    return {
        date: values.date.toISOString().split("T")[0],
        distance: values.distance,
        description: values.description || null,
        stravaRide: values.stravaRide || null,
    };
}
