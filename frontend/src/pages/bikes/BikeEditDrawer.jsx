import React from "react";
import { Form, useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { bikeForm, bikeFormToBody } from "./bikeForm.js";
import { Button, Drawer, Group, Stack, Text } from "@mantine/core";
import BikeFormFields from "./BikeFormFields.jsx";
import { modals } from "@mantine/modals";
import { useRecoilState } from "recoil";
import { networkStatusAtom } from "../../data/useNetworkStatus.jsx";
import useBikeService from "../../services/bikeService.js";

export default function BikeEditDrawer({
    id,
    name,
    description,
    color,
    onCancel,
    onBikeEdited,
    onBikeDeleted,
}) {
    const bikeService = useBikeService();
    const [online, _] = useRecoilState(networkStatusAtom);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const editForm = useForm(bikeForm);

    async function updateBike(values) {
        setLoadingUpdate(true);
        const body = bikeFormToBody(values);

        bikeService
            .update(id, body)
            .then(onBikeEdited)
            .finally(() => setLoadingUpdate(false));
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

        bikeService
            .delete(id)
            .then(() => onBikeDeleted(id))
            .finally(() => setLoadingDelete(false));
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
