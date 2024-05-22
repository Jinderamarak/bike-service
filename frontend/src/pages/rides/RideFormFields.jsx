import React from "react";
import { NumberInput, Textarea } from "@mantine/core";
import { DateInput } from "@mantine/dates";

export default function RideFormFieds({ form, disabled }) {
    return (
        <>
            <DateInput
                withAsterisk
                label="Date"
                key={form.key("date")}
                {...form.getInputProps("date")}
                disabled={disabled}
            />
            <NumberInput
                withAsterisk
                label="Distance"
                placeholder="(km)"
                key={form.key("distance")}
                {...form.getInputProps("distance")}
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
