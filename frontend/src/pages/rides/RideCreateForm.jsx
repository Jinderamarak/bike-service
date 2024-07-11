import React, { useState } from "react";
import rideForm from "./rideForm.js";
import { Form, useForm } from "@mantine/form";
import { useRecoilState } from "recoil";
import { selectedBikeIdAtom } from "../../data/persistentAtoms.js";
import RideFormFieds from "./RideFormFields.jsx";
import { Stack, Paper, Button } from "@mantine/core";
import useRideService from "../../services/rideService.js";

export default function RideCreateForm({ onRideCreated }) {
    const [selectedBike, _] = useRecoilState(selectedBikeIdAtom);
    const [loading, setLoading] = useState(false);
    const rideService = useRideService(selectedBike);
    const newForm = useForm(rideForm);

    async function handleSubmit(values) {
        setLoading(true);
        const body = {
            date: values.date.toISOString().split("T")[0],
            distance: values.distance,
            description: values.description || null,
        };

        rideService
            .create(body)
            .then((data) => {
                newForm.reset();
                onRideCreated(data);
            })
            .finally(() => setLoading(false));
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
