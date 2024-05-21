import React from "react";
import { TextInput, Textarea } from "@mantine/core";

export default function BikeFormFields({ form, disabled }) {
    return (
        <>
            <TextInput
                withAsterisk
                label="Name"
                placeholder="Jack's Mountain Bike"
                key={form.key("name")}
                {...form.getInputProps("name")}
                disabled={disabled}
            />
            <Textarea
                label="Description"
                placeholder="(optional)"
                key={form.key("description")}
                {...form.getInputProps("description")}
                disabled={disabled}
            />
        </>
    );
}
