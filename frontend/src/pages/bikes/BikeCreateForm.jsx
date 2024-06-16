import React from "react";
import { Form, useForm } from "@mantine/form";
import bikeForm, { bikeFormToBody } from "./bikeForm";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { Button, Paper, Stack } from "@mantine/core";
import BikeFormFields from "./BikeFormFields";
import { useRecoilState } from "recoil";
import { networkStatusAtom } from "../../data/useNetworkStatus";

export default function BikeCreateForm({ onBikeCreated }) {
    const [online, _] = useRecoilState(networkStatusAtom);
    const [loading, setLoading] = useState(false);
    const newForm = useForm(bikeForm);

    async function createBike(values) {
        setLoading(true);
        const body = bikeFormToBody(values);

        try {
            const response = await fetch("/api/bikes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            newForm.reset();
            onBikeCreated(data);
        } catch (error) {
            console.error(error);
            notifications.show({
                title: "Failed to create bike",
                message: error.message,
                color: "red",
                withBorder: true,
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Stack style={{ flexShrink: 0 }}>
            <Paper withBorder p="md">
                <Form form={newForm} onSubmit={createBike}>
                    <Stack>
                        <BikeFormFields
                            form={newForm}
                            disabled={loading || !online}
                        />
                        <Button
                            disabled={!online}
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
