import { Form, useForm } from "@mantine/form";
import React, { useEffect } from "react";
import { rideForm, rideFormToBody } from "./rideForm.js";
import { Button, Drawer, Group, Stack, Text } from "@mantine/core";
import RideFormFields from "./RideFormFields.jsx";
import { modals } from "@mantine/modals";
import { useRecoilState } from "recoil";
import { selectedBikeIdAtom } from "../../data/persistentAtoms.js";
import useRideService from "../../services/rideService.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function RideEditDrawer({
    id,
    date,
    distance,
    description,
    stravaRide,
    onClose,
}) {
    const [selectedBike, _] = useRecoilState(selectedBikeIdAtom);
    const rideService = useRideService(selectedBike);
    const editForm = useForm(rideForm);

    const queryClient = useQueryClient();
    const updateMutation = useMutation({
        mutationFn: (values) => rideService.update(id, rideFormToBody(values)),
        onSuccess: (data) => {
            const newDate = new Date(data.date);
            queryClient.invalidateQueries({
                queryKey: [
                    "rides",
                    newDate.getFullYear(),
                    newDate.getMonth() + 1,
                ],
            });
            queryClient.invalidateQueries({
                queryKey: ["rides", "total", newDate.getFullYear()],
            });

            const oldDate = new Date(date);
            queryClient.invalidateQueries({
                queryKey: [
                    "rides",
                    oldDate.getFullYear(),
                    oldDate.getMonth() + 1,
                ],
            });
            queryClient.invalidateQueries({
                queryKey: ["rides", "total", oldDate.getFullYear()],
            });

            queryClient.invalidateQueries({ queryKey: ["activeYears"] });
            onClose();
        },
    });
    const deleteMutation = useMutation({
        mutationFn: () => rideService.delete(id),
        onSuccess: () => {
            const oldDate = new Date(date);
            queryClient.invalidateQueries({
                queryKey: [
                    "rides",
                    oldDate.getFullYear(),
                    oldDate.getMonth() + 1,
                ],
            });
            queryClient.invalidateQueries({ queryKey: ["rides", "total"] });
            queryClient.invalidateQueries({ queryKey: ["activeYears"] });
            onClose();
        },
    });

    function askDeleteRide() {
        modals.openConfirmModal({
            title: "Confirm ride deletion",
            children: (
                <Text size="sm">
                    Are you sure you want to delete ride from{" "}
                    <strong>{date}</strong>?
                </Text>
            ),
            centered: true,
            labels: { confirm: "Delete ride", cancel: "Cancel" },
            confirmProps: { color: "red" },
            onConfirm: deleteMutation.mutate,
        });
    }

    useEffect(() => {
        editForm.setValues({
            date: date ? new Date(date) : new Date(),
            distance,
            description,
            stravaRide,
        });
    }, [date, distance, description, stravaRide]);

    return (
        <Drawer
            opened={id !== undefined}
            onClose={onClose}
            title={`Editing ride from ${date}`}
            position="right"
        >
            <Form form={editForm} onSubmit={updateMutation.mutate}>
                <Stack>
                    <RideFormFields
                        form={editForm}
                        disabled={
                            updateMutation.isPending || deleteMutation.isPending
                        }
                    />
                    <Group justify="space-between">
                        <Button
                            variant="light"
                            color="red"
                            onClick={askDeleteRide}
                            loading={deleteMutation.isPending}
                            disabled={updateMutation.isPending}
                        >
                            Delete
                        </Button>
                        <Button
                            variant="filled"
                            type="submit"
                            loading={updateMutation.isPending}
                            disabled={deleteMutation.isPending}
                        >
                            Save
                        </Button>
                    </Group>
                </Stack>
            </Form>
        </Drawer>
    );
}
