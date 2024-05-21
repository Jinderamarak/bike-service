function nameValidator(value) {
    return value.length > 0 ? null : "Name should not be empty";
}

/** @type {any} */
const bikeForm = {
    mode: "uncontrolled",
    initialValues: {
        name: "",
        description: "",
    },
    validate: {
        name: nameValidator,
    },
};

export default bikeForm;
