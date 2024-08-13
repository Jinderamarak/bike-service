import React from "react";
import { Group, NumberInput, Text, Textarea } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconBrandStrava } from "@tabler/icons-react";

export default function RideFormFields({ form, disabled }) {
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
            {form.values.stravaRide && (
                <Group>
                    <IconBrandStrava size={24} />
                    <Text>Ride synced from Strava</Text>
                </Group>
            )}
        </>
    );
}
