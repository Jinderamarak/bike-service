import { Form, useForm } from "@mantine/form";
import React, { useEffect, useState } from "react";
import rideForm from "./rideForm";
import { Button, Drawer, Group, Stack } from "@mantine/core";
import RideFormFields from "./RideFormFields";
import { notifications } from "@mantine/notifications";

export default function RideEditDrawer({
    id,
    date,
    distance,
    description,
    onCancel,
    onRideEdited,
    onRideDeleted,
}) {
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
            const response = await fetch(`/api/rides/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            onRideEdited(data);
        } catch (error) {
            console.error(error);
            notifications.show({
                title: "Failed to update ride",
                message: error.message,
                color: "red",
            });
        } finally {
            setLoadingUpdate(false);
        }
    }

    async function deleteRide() {
        setLoadingDelete(true);
        try {
            const response = await fetch(`/api/rides/${id}`, {
                method: "DELETE",
            });

            const _ = await response.json();
            onRideDeleted(id);
        } catch (error) {
            console.error(error);
            notifications.show({
                title: "Failed to delete ride",
                message: error.message,
                color: "red",
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
                            variant="filled"
                            type="submit"
                            loading={loadingUpdate}
                            disabled={loadingDelete}
                        >
                            Save
                        </Button>
                        <Button
                            variant="filled"
                            color="red"
                            onClick={deleteRide}
                            loading={loadingDelete}
                            disabled={loadingUpdate}
                        >
                            Delete
                        </Button>
                    </Group>
                </Stack>
            </Form>
        </Drawer>
    );
}
