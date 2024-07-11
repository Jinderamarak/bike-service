import React, { useState } from "react";
import { Center, Stack, Title, Button, Paper, TextInput } from "@mantine/core";
import { Form, useForm } from "@mantine/form";
import useAuthService from "../services/authService.js";
import { useAuth } from "../components/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

function Login() {
    const auth = useAuth();
    const authService = useAuthService();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const loginForm = useForm({
        mode: "controlled",
        initialValues: {
            username: "",
        },
    });

    async function login(values) {
        setLoading(true);
        try {
            const session = await authService.login(values);
            auth.setSession(session);
            navigate("/");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Center>
            <Stack>
                <Title ta="center">Login</Title>
                <Paper withBorder p="md">
                    <Form form={loginForm} onSubmit={login}>
                        <Stack>
                            <TextInput
                                withAsterisk
                                label="Username"
                                key={loginForm.key("username")}
                                {...loginForm.getInputProps("username")}
                                disabled={loading}
                            />
                            <Button
                                loading={loading}
                                variant="filled"
                                type="submit"
                            >
                                Login
                            </Button>
                        </Stack>
                    </Form>
                </Paper>
            </Stack>
        </Center>
    );
}

export default Login;
