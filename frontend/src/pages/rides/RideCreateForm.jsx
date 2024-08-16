import React from "react";
import { rideForm, rideFormToBody } from "./rideForm.js";
import { Form, useForm } from "@mantine/form";
import { useRecoilState } from "recoil";
import { selectedBikeIdAtom } from "../../data/persistentAtoms.js";
import RideFormFieds from "./RideFormFields.jsx";
import { Stack, Paper, Button } from "@mantine/core";
import useRideService from "../../services/rideService.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function RideCreateForm() {
    const [selectedBike, _] = useRecoilState(selectedBikeIdAtom);
    const rideService = useRideService(selectedBike);
    const newForm = useForm(rideForm);

    const queryClient = useQueryClient();
    const createMutation = useMutation({
        mutationFn: (values) => rideService.create(rideFormToBody(values)),
        onSuccess: (data) => {
            const rideDate = new Date(data.date);
            queryClient.invalidateQueries({
                queryKey: [
                    "rides",
                    selectedBike,
                    rideDate.getFullYear(),
                    rideDate.getMonth() + 1,
                ],
            });
            queryClient.invalidateQueries({
                queryKey: [
                    "rides",
                    selectedBike,
                    "total",
                    rideDate.getFullYear(),
                ],
            });
            queryClient.invalidateQueries({
                queryKey: ["activeYears", selectedBike],
            });
            newForm.reset();
        },
    });

    return (
        <Stack style={{ flexShrink: 0 }}>
            <Paper withBorder p="md">
                <Form form={newForm} onSubmit={createMutation.mutate}>
                    <Stack>
                        <RideFormFieds
                            form={newForm}
                            disabled={createMutation.isPending}
                        />
                        <Button
                            loading={createMutation.isPending}
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
