import React from "react";
import { Form, useForm } from "@mantine/form";
import bikeForm from "./bikeForm";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { Button, Paper, Stack } from "@mantine/core";
import BikeFormFields from "./BikeFormFields";

export default function BikeCreateForm({ onBikeCreated }) {
    const [loading, setLoading] = useState(false);
    const newForm = useForm(bikeForm);

    async function createBike(values) {
        setLoading(true);
        const body = {
            name: values.name,
            description: values.description || null,
        };

        try {
            const response = await fetch("/api/bikes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            onBikeCreated(data);
        } catch (error) {
            console.error(error);
            notifications.show({
                title: "Failed to create bike",
                message: error.message,
                color: "red",
            });
        } finally {
            setLoading(false);
            newForm.reset();
        }
    }

    return (
        <Stack style={{ flexShrink: 0 }}>
            <Paper withBorder p="xs">
                <Form form={newForm} onSubmit={createBike}>
                    <Stack>
                        <BikeFormFields form={newForm} disabled={loading} />
                        <Button loading={loading} variant="light" type="submit">
                            Create
                        </Button>
                    </Stack>
                </Form>
            </Paper>
        </Stack>
    );
}
