import React, { useEffect, useState } from "react";
import { Stack, Transition } from "@mantine/core";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Login from "./pages/Login.jsx";
import AppAuth from "./AppAuth.jsx";

export default function App() {
    const [transition, setTransition] = useState(false);

    useEffect(() => {
        setTransition(true);
    }, []);

    return (
        <BrowserRouter>
            <Transition mounted={transition} transition="fade">
                {(styles) => (
                    <Stack p="md" gap="md" style={{ ...styles }}>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="*" element={<AppAuth />} />
                        </Routes>
                    </Stack>
                )}
            </Transition>
        </BrowserRouter>
    );
}
