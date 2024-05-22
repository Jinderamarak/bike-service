import React from "react";
import { Form, useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import bikeForm from "./bikeForm";
import { Button, Drawer, Group, Stack } from "@mantine/core";
import BikeFormFields from "./BikeFormFields";
import { notifications } from "@mantine/notifications";

export default function BikeEditDrawer({
    id,
    name,
    description,
    onCancel,
    onBikeEdited,
    onBikeDeleted,
}) {
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const editForm = useForm(bikeForm);

    async function updateBike(values) {
        setLoadingUpdate(true);
        const body = {
            name: values.name,
            description: values.description || null,
        };

        try {
            const response = await fetch(`/api/bikes/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            onBikeEdited(data);
        } catch (error) {
            console.error(error);
            notifications.show({
                title: "Failed to update bike",
                message: error.message,
                color: "red",
            });
        } finally {
            setLoadingUpdate(false);
        }
    }

    async function deleteBike() {
        setLoadingDelete(true);
        try {
            const response = await fetch(`/api/bikes/${id}`, {
                method: "DELETE",
            });

            const _ = await response.json();
            onBikeDeleted(id);
        } catch (error) {
            console.error(error);
            notifications.show({
                title: "Failed to delete bike",
                message: error.message,
                color: "red",
            });
        } finally {
            setLoadingDelete(false);
        }
    }

    useEffect(() => {
        editForm.setValues({ name, description });
    }, [name, description]);

    return (
        <Drawer
            opened={id !== undefined}
            onClose={onCancel}
            title={`Editing ${name}`}
            position="right"
        >
            <Form form={editForm} onSubmit={updateBike}>
                <Stack>
                    <BikeFormFields
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
                            onClick={deleteBike}
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
