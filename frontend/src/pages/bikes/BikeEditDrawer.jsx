import React from "react";
import { Form, useForm } from "@mantine/form";
import { useEffect } from "react";
import { bikeForm, bikeFormToBody } from "./bikeForm.js";
import { Button, Drawer, Group, Stack, Text } from "@mantine/core";
import BikeFormFields from "./BikeFormFields.jsx";
import { modals } from "@mantine/modals";
import { useRecoilState } from "recoil";
import { networkStatusAtom } from "../../data/useNetworkStatus.jsx";
import useBikeService from "../../services/bikeService.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function BikeEditDrawer({
    id,
    name,
    description,
    color,
    stravaGear,
    onClose,
}) {
    const bikeService = useBikeService();
    const [online, _] = useRecoilState(networkStatusAtom);
    const editForm = useForm(bikeForm);

    const queryClient = useQueryClient();
    const updateMutation = useMutation({
        mutationFn: (values) => bikeService.update(id, bikeFormToBody(values)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bikes"] });
            onClose();
        },
    });
    const deleteMutation = useMutation({
        mutationFn: () => bikeService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bikes"] });
            onClose();
        },
    });

    function askDeleteBike() {
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
            onConfirm: deleteMutation.mutate,
        });
    }

    useEffect(() => {
        editForm.setValues({
            name,
            description,
            hasColor: Boolean(color),
            color: color || "",
            stravaGear: stravaGear,
        });
    }, [name, description, color, stravaGear]);

    return (
        <Drawer
            opened={id !== undefined}
            onClose={onClose}
            title={`Editing ${name}`}
            position="right"
        >
            <Form form={editForm} onSubmit={updateMutation.mutate}>
                <Stack>
                    <BikeFormFields
                        form={editForm}
                        disabled={
                            updateMutation.isPending ||
                            deleteMutation.isPending ||
                            !online
                        }
                    />
                    <Group justify="space-between">
                        <Button
                            variant="light"
                            color="red"
                            onClick={askDeleteBike}
                            loading={deleteMutation.isPending}
                            disabled={updateMutation.isPending || !online}
                        >
                            Delete
                        </Button>
                        <Button
                            variant="filled"
                            type="submit"
                            loading={updateMutation.isPending}
                            disabled={deleteMutation.isPending || !online}
                        >
                            Save
                        </Button>
                    </Group>
                </Stack>
            </Form>
        </Drawer>
    );
}
