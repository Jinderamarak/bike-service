import React from "react";
import { Form, useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import bikeForm, { bikeFormToBody } from "./bikeForm";
import { Button, Drawer, Group, Stack, Text } from "@mantine/core";
import BikeFormFields from "./BikeFormFields";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { useRecoilState } from "recoil";
import { networkStatusAtom } from "../../data/useNetworkStatus";

export default function BikeEditDrawer({
    id,
    name,
    description,
    color,
    onCancel,
    onBikeEdited,
    onBikeDeleted,
}) {
    const [online, _] = useRecoilState(networkStatusAtom);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const editForm = useForm(bikeForm);

    async function updateBike(values) {
        setLoadingUpdate(true);
        const body = bikeFormToBody(values);

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
                withBorder: true,
            });
        } finally {
            setLoadingUpdate(false);
        }
    }

    function askDeleteBike() {
        setLoadingDelete(true);
        modals.openConfirmModal({
            title: "Confirm bike deletion",
            children: (
                <Text size="sm">
                    Are you sure you want to delete bike <strong>{name}</strong>
                    ?
                </Text>
            ),
            centered: true,
            labels: { confirm: "Delete bike", cancel: "Cancel" },
            confirmProps: { color: "red" },
            onConfirm: deleteBike,
            onCancel: () => setLoadingDelete(false),
            onClose: () => setLoadingDelete(false),
        });
    }

    async function deleteBike() {
        setLoadingDelete(true);
        try {
            const response = await fetch(`/api/bikes/${id}`, {
                method: "DELETE",
            });

            if (response.status !== 204) {
                throw new Error(
                    "Failed to delete bike: status code is not 204"
                );
            }

            onBikeDeleted(id);
        } catch (error) {
            console.error(error);
            notifications.show({
                title: "Failed to delete bike",
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
            name,
            description,
            hasColor: Boolean(color),
            color: color || "",
        });
    }, [name, description, color]);

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
                        disabled={loadingUpdate || loadingDelete || !online}
                    />
                    <Group justify="space-between">
                        <Button
                            variant="light"
                            color="red"
                            onClick={askDeleteBike}
                            loading={loadingDelete}
                            disabled={loadingUpdate || !online}
                        >
                            Delete
                        </Button>
                        <Button
                            variant="filled"
                            type="submit"
                            loading={loadingUpdate}
                            disabled={loadingDelete || !online}
                        >
                            Save
                        </Button>
                    </Group>
                </Stack>
            </Form>
        </Drawer>
    );
}
