import React from "react";
import { Form, useForm } from "@mantine/form";
import { bikeForm, bikeFormToBody } from "./bikeForm.js";
import { Button, Paper, Stack } from "@mantine/core";
import BikeFormFields from "./BikeFormFields.jsx";
import { useRecoilState } from "recoil";
import { networkStatusAtom } from "../../data/useNetworkStatus.jsx";
import useBikeService from "../../services/bikeService.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function BikeCreateForm() {
    const bikeService = useBikeService();
    const [online, _] = useRecoilState(networkStatusAtom);
    const newForm = useForm(bikeForm);

    const queryClient = useQueryClient();
    const createMutation = useMutation({
        mutationFn: (values) => bikeService.create(bikeFormToBody(values)),
        onSuccess: () => {
            newForm.reset();
            queryClient.invalidateQueries({ queryKey: ["bikes"] });
        },
    });

    return (
        <Stack style={{ flexShrink: 0 }}>
            <Paper withBorder p="md">
                <Form form={newForm} onSubmit={createMutation.mutate}>
                    <Stack>
                        <BikeFormFields
                            form={newForm}
                            disabled={createMutation.isPending || !online}
                        />
                        <Button
                            disabled={!online}
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
