import React, { lazy, Suspense, useEffect, useState } from "react";
import { Center, Group, Loader, Stack, Title, Transition } from "@mantine/core";
import { useLocalStorageSync } from "./data/persistentAtoms.js";
import { useNetworkStatusSync } from "./data/useNetworkStatus.jsx";

const LazyApp = lazy(() => import("./App.jsx"));

function Loading() {
    const [transition, setTransition] = useState(false);

    useEffect(() => {
        setTransition(true);
    }, []);

    return (
        <Transition mounted={transition} transition="fade">
            {(styles) => (
                <Center h="100%" style={{ ...styles }}>
                    <Stack>
                        <Group justify="center">
                            <Loader />
                        </Group>
                        <Title>Loading</Title>
                    </Stack>
                </Center>
            )}
        </Transition>
    );
}

export default function AppEntry() {
    useLocalStorageSync();
    useNetworkStatusSync();

    return (
        <Suspense fallback={<Loading />}>
            <LazyApp />
        </Suspense>
    );
}
