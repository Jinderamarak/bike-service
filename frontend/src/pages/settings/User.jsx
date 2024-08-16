import React, { useEffect, useState } from "react";
import { Stack, Button, TextInput, Checkbox, NumberInput } from "@mantine/core";
import useUserService from "../../services/userService.js";
import { Form, useForm } from "@mantine/form";
import { useAuth } from "../../components/AuthContext.jsx";
import { useRecoilState } from "recoil";
import { networkStatusAtom } from "../../data/useNetworkStatus.jsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function User() {
    const [isOnline, _] = useRecoilState(networkStatusAtom);
    const auth = useAuth();
    const userService = useUserService();
    const updateForm = useForm({
        initialValues: {
            username: "",
            hasMonthlyGoal: false,
            monthlyGoal: 0,
        },
    });

    const queryClient = useQueryClient();
    const updateMutation = useMutation({
        /** @param {*} values */
        mutationFn: (values) =>
            userService.update({
                username: values.username,
                monthlyGoal: values.hasMonthlyGoal ? values.monthlyGoal : null,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });
    const deleteMutation = useMutation({
        mutationFn: userService.delete,
        onSuccess: () => {
            auth.setSession(null);
            queryClient.invalidateQueries();
        },
    });

    useEffect(() => {
        userService.current().then((user) => {
            updateForm.setValues(() => ({
                username: user.username,
                hasMonthlyGoal: user.monthlyGoal !== null,
                monthlyGoal: user.monthlyGoal ?? 0,
            }));
        });
    }, []);

    return (
        <Stack>
            <Form form={updateForm} onSubmit={updateMutation.mutate}>
                <Stack>
                    <TextInput
                        withAsterisk
                        label="Username"
                        key={updateForm.key("username")}
                        {...updateForm.getInputProps("username")}
                        disabled={
                            updateMutation.isPending || deleteMutation.isPending
                        }
                    />
                    <Checkbox
                        label="Monthly goal"
                        key={updateForm.key("hasMonthlyGoal")}
                        {...updateForm.getInputProps("hasMonthlyGoal", {
                            type: "checkbox",
                        })}
                        disabled={
                            updateMutation.isPending || deleteMutation.isPending
                        }
                    />
                    {updateForm.values.hasMonthlyGoal && (
                        <NumberInput
                            label="Monthly goal"
                            placeholder="(km)"
                            key={updateForm.key("monthlyGoal")}
                            {...updateForm.getInputProps("monthlyGoal")}
                            disabled={
                                updateMutation.isPending ||
                                deleteMutation.isPending
                            }
                        />
                    )}
                    <Button
                        type="submit"
                        variant="filled"
                        loading={updateMutation.isPending}
                        disabled={deleteMutation.isPending || !isOnline}
                    >
                        Update User
                    </Button>
                </Stack>
            </Form>
            <Button
                variant="light"
                loading={deleteMutation.isPending}
                disabled={updateMutation.isPending || !isOnline}
                onClick={() => deleteMutation.mutate()}
            >
                Delete User
            </Button>
        </Stack>
    );
}
