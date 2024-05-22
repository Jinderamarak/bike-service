function nameValidator(value) {
    if (value.length > 0) {
        return null;
    }
    return "Name cannot be empty";
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
