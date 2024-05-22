import React, { useState } from "react";
import rideForm from "./rideForm";
import { Form, useForm } from "@mantine/form";
import { useRecoilState } from "recoil";
import { selectedBikeAtom } from "../../atoms";
import { notifications } from "@mantine/notifications";
import RideFormFieds from "./RideFormFields";
import { Stack, Paper, Button } from "@mantine/core";

export default function RideCreateForm({ onRideCreated }) {
    const [selectedBike, _] = useRecoilState(selectedBikeAtom);
    const [loading, setLoading] = useState(false);
    const newForm = useForm(rideForm);

    async function handleSubmit(values) {
        setLoading(true);
        const body = {
            date: values.date.toISOString().split("T")[0],
            distance: values.distance,
            description: values.description || null,
        };

        try {
            const response = await fetch(`/api/bikes/${selectedBike}/rides`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            newForm.reset();
            onRideCreated(data);
        } catch (error) {
            console.error(error);
            notifications.show({
                title: "Failed to create ride",
                message: error.message,
                color: "red",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Stack style={{ flexShrink: 0 }}>
            <Paper withBorder p="md">
                <Form form={newForm} onSubmit={handleSubmit}>
                    <Stack>
                        <RideFormFieds form={newForm} disabled={loading} />
                        <Button
                            loading={loading}
                            variant="filled"
                            type="submit"
                        >
                            Create
                        </Button>
                    </Stack>
                </Form>
            </Paper>
        </Stack>
    );
}
