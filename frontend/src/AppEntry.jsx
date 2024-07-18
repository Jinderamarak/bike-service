import React, { useEffect, useRef, useState } from "react";
import { Center, Group, Loader, Stack, Title, Transition } from "@mantine/core";
import { useLocalStorageSync } from "./data/persistentAtoms.js";
import { useNetworkStatusSync } from "./data/useNetworkStatus.jsx";
import { useDataSync } from "./data/useDataSync.js";
import { workerCall } from "./lib/WorkerCom.js";

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
    const [loaded, setLoaded] = useState(false);
    const app = useRef(null);

    useLocalStorageSync();
    useNetworkStatusSync();
    useDataSync();

    /**
     * @param {AbortSignal} signal
     */
    async function initialize(signal) {
        const [_, mod] = await Promise.all([
            workerCall("status", {}),
            import("./App.jsx"),
        ]);

        if (!signal.aborted) {
            app.current = mod.default;
            setLoaded(true);
        }
    }

    useEffect(() => {
        const controller = new AbortController();
        initialize(controller.signal);
        return () => controller.abort();
    }, []);

    if (!loaded) {
        return <Loading />;
    }
    return <app.current />;
}
