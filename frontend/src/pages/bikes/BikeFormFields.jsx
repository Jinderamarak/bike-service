import React from "react";
import { Checkbox, ColorInput, TextInput, Textarea } from "@mantine/core";

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
            <Checkbox
                label="Custom Color"
                key={form.key("hasColor")}
                {...form.getInputProps("hasColor", { type: "checkbox" })}
                disabled={disabled}
            />
            {form.values.hasColor && (
                <ColorInput
                    key={form.key("color")}
                    {...form.getInputProps("color")}
                    disabled={disabled || !form.values.hasColor}
                />
            )}
        </>
    );
}
