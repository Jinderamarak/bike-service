import React, { useEffect, useState } from "react";
import { Stack, Button, TextInput, Checkbox, NumberInput } from "@mantine/core";
import useUserService from "../../services/userService.js";
import { Form, useForm } from "@mantine/form";
import { useAuth } from "../../components/AuthContext.jsx";
import { useRecoilState } from "recoil";
import { networkStatusAtom } from "../../data/useNetworkStatus.jsx";

export default function User() {
    const [isOnline, _] = useRecoilState(networkStatusAtom);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const auth = useAuth();
    const userService = useUserService();
    const updateForm = useForm({
        initialValues: {
            username: "",
            hasMonthlyGoal: false,
            monthlyGoal: 0,
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

    function update(values) {
        setLoadingUpdate(true);
        const body = {
            username: values.username,
            monthlyGoal: values.hasMonthlyGoal ? values.monthlyGoal : null,
        };

        userService.update(body).finally(() => setLoadingUpdate(false));
    }

    function deleteUser() {
        setLoadingDelete(true);
        userService
            .delete()
            .then(() => auth.setSession(null))
            .finally(() => setLoadingDelete(false));
    }

    return (
        <Stack>
            <Form form={updateForm} onSubmit={update}>
                <Stack>
                    <TextInput
                        withAsterisk
                        label="Username"
                        key={updateForm.key("username")}
                        {...updateForm.getInputProps("username")}
                        disabled={loadingUpdate || loadingDelete}
                    />
                    <Checkbox
                        label="Monthly goal"
                        key={updateForm.key("hasMonthlyGoal")}
                        {...updateForm.getInputProps("hasMonthlyGoal", {
                            type: "checkbox",
                        })}
                        disabled={loadingUpdate || loadingDelete}
                    />
                    {updateForm.values.hasMonthlyGoal && (
                        <NumberInput
                            label="Monthly goal"
                            placeholder="(km)"
                            key={updateForm.key("monthlyGoal")}
                            {...updateForm.getInputProps("monthlyGoal")}
                            disabled={loadingUpdate || loadingDelete}
                        />
                    )}
                    <Button
                        type="submit"
                        variant="filled"
                        loading={loadingUpdate}
                        disabled={loadingDelete || !isOnline}
                    >
                        Update User
                    </Button>
                </Stack>
            </Form>
            <Button
                variant="light"
                loading={loadingDelete}
                disabled={loadingUpdate || !isOnline}
                onClick={deleteUser}
            >
                Delete User
            </Button>
        </Stack>
    );
}
