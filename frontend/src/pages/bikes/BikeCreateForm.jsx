import React from "react";
import { Form, useForm } from "@mantine/form";
import { bikeForm, bikeFormToBody } from "./bikeForm.js";
import { useState } from "react";
import { Button, Paper, Stack } from "@mantine/core";
import BikeFormFields from "./BikeFormFields.jsx";
import { useRecoilState } from "recoil";
import { networkStatusAtom } from "../../data/useNetworkStatus.jsx";
import useBikeService from "../../services/bikeService.js";

export default function BikeCreateForm({ onBikeCreated, availableStravaGear }) {
    const bikeService = useBikeService();
    const [online, _] = useRecoilState(networkStatusAtom);
    const [loading, setLoading] = useState(false);
    const newForm = useForm(bikeForm);

    async function createBike(values) {
        setLoading(true);
        const body = bikeFormToBody(values);
        bikeService
            .create(body)
            .then((bike) => {
                newForm.reset();
                onBikeCreated(bike);
            })
            .finally(() => setLoading(false));
    }

    return (
        <Stack style={{ flexShrink: 0 }}>
            <Paper withBorder p="md">
                <Form form={newForm} onSubmit={createBike}>
                    <Stack>
                        <BikeFormFields
                            form={newForm}
                            disabled={loading || !online}
                            availableStravaGear={availableStravaGear}
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
