import { Form, useForm } from "@mantine/form";
import React, { useEffect, useState } from "react";
import rideForm from "./rideForm";
import { Button, Drawer, Group, Stack, Text } from "@mantine/core";
import RideFormFields from "./RideFormFields";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { useRecoilState } from "recoil";
import { selectedBikeIdAtom } from "../../data/persistentAtoms";

export default function RideEditDrawer({
    id,
    date,
    distance,
    description,
    onCancel,
    onRideEdited,
    onRideDeleted,
}) {
    const [selectedBike, _] = useRecoilState(selectedBikeIdAtom);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const editForm = useForm(rideForm);

    async function updateRide(values) {
        setLoadingUpdate(true);
        const body = {
            date: values.date.toISOString().split("T")[0],
            distance: values.distance,
            description: values.description || null,
        };

        try {
            const response = await fetch(
                `/api/bikes/${selectedBike}/rides/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body),
                }
            );

            const data = await response.json();
            onRideEdited(data);
        } catch (error) {
            console.error(error);
            notifications.show({
                title: "Failed to update ride",
                message: error.message,
                color: "red",
                withBorder: true,
            });
        } finally {
            setLoadingUpdate(false);
        }
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
        try {
            const response = await fetch(
                `/api/bikes/${selectedBike}/rides/${id}`,
                { method: "DELETE" }
            );

            if (response.status !== 204) {
                throw new Error(
                    "Failed to delete ride: status code is not 204"
                );
            }

            onRideDeleted(id);
        } catch (error) {
            console.error(error);
            notifications.show({
                title: "Failed to delete ride",
                message: error.message,
                color: "red",
                withBorder: true,
            });
        } finally {
            setLoadingDelete(false);
        }
    }

    useEffect(() => {
        editForm.setValues({
            date: date ? new Date(date) : new Date(),
            distance,
            description,
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
