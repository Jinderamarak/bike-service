import React, { useState } from "react";
import { Center, Stack, Title, Button, Paper, TextInput } from "@mantine/core";
import { Form, useForm } from "@mantine/form";
import { Link, useNavigate } from "react-router-dom";
import useUserService from "../services/userService.js";
import { notifications } from "@mantine/notifications";

export default function Register() {
    const userService = useUserService();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const registerForm = useForm({
        mode: "controlled",
        initialValues: {
            username: "",
        },
    });

    async function register(values) {
        setLoading(true);
        const body = {
            username: values.username,
            monthlyGoal: null,
        };

        try {
            const user = await userService.create(body);
            notifications.show({
                title: "User created",
                message: `User ${user.username} created successfully`,
                color: "green",
                withBorder: true,
            });
            navigate("/login");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Center>
            <Stack>
                <Title ta="center">Register</Title>
                <Paper withBorder p="md">
                    <Form form={registerForm} onSubmit={register}>
                        <Stack>
                            <TextInput
                                withAsterisk
                                label="Username"
                                key={registerForm.key("username")}
                                {...registerForm.getInputProps("username")}
                                disabled={loading}
                            />
                            <Button
                                loading={loading}
                                variant="filled"
                                type="submit"
                            >
                                Register
                            </Button>
                        </Stack>
                    </Form>
                </Paper>
                <Link to="/login">
                    <Center>Log in to an existing account</Center>
                </Link>
            </Stack>
        </Center>
    );
}
