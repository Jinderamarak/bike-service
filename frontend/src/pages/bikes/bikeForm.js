function nameValidator(value) {
    if (value.length > 0) {
        return null;
    }
    return "Name cannot be empty";
}

/** @type {any} */
const bikeForm = {
    mode: "controlled",
    initialValues: {
        name: "",
        description: "",
        hasColor: false,
        color: "",
    },
    validate: {
        name: nameValidator,
    },
};

export function bikeFormToBody(values) {
    return {
        name: values.name,
        description: values.description || null,
        color: values.hasColor ? values.color : null,
    };
}

export default bikeForm;
