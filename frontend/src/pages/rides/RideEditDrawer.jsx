import { Form, useForm } from "@mantine/form";
import React, { useEffect, useState } from "react";
import { rideForm, rideFormToBody } from "./rideForm.js";
import { Button, Drawer, Group, Stack, Text } from "@mantine/core";
import RideFormFields from "./RideFormFields.jsx";
import { modals } from "@mantine/modals";
import { useRecoilState } from "recoil";
import { selectedBikeIdAtom } from "../../data/persistentAtoms.js";
import useRideService from "../../services/rideService.js";

export default function RideEditDrawer({
    id,
    date,
    distance,
    description,
    stravaRide,
    onCancel,
    onRideEdited,
    onRideDeleted,
}) {
    const [selectedBike, _] = useRecoilState(selectedBikeIdAtom);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const rideService = useRideService(selectedBike);
    const editForm = useForm(rideForm);

    async function updateRide(values) {
        setLoadingUpdate(true);
        const body = rideFormToBody(values);
        rideService
            .update(id, body)
            .then(onRideEdited)
            .finally(() => setLoadingUpdate(false));
    }

    function askDeleteRide() {
        setLoadingDelete(true);
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
            onConfirm: deleteRide,
            onCancel: () => setLoadingDelete(false),
            onClose: () => setLoadingDelete(false),
        });
    }

    async function deleteRide() {
        setLoadingDelete(true);

        rideService
            .delete(id)
            .then(() => onRideDeleted(id))
            .finally(() => setLoadingDelete(false));
    }

    useEffect(() => {
        editForm.setValues({
            date: date ? new Date(date) : new Date(),
            distance,
            description,
            stravaRide,
        });
    }, [date, distance, description]);

    return (
        <Drawer
            opened={id !== undefined}
            onClose={onCancel}
            title={`Editing ride from ${date}`}
            position="right"
        >
            <Form form={editForm} onSubmit={updateRide}>
                <Stack>
                    <RideFormFields
                        form={editForm}
                        disabled={loadingUpdate || loadingDelete}
                    />
                    <Group justify="space-between">
                        <Button
                            variant="light"
                            color="red"
                            onClick={askDeleteRide}
                            loading={loadingDelete}
                            disabled={loadingUpdate}
                        >
                            Delete
                        </Button>
                        <Button
                            variant="filled"
                            type="submit"
                            loading={loadingUpdate}
                            disabled={loadingDelete}
                        >
                            Save
                        </Button>
                    </Group>
                </Stack>
            </Form>
        </Drawer>
    );
}
