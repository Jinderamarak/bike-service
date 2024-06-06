import React, { useEffect, useState } from "react";
import { Skeleton, Stack, Text } from "@mantine/core";

// @ts-ignore
const FRONTEND_VERSION = APP_VERSION;

export default function Versions() {
    const [serverStatus, setServerStatus] = useState(null);
    const [workerVersions, setWorkerVersions] = useState([]);

    useEffect(() => {
        let controller = new AbortController();
        fetch("/api/status", { signal: controller.signal })
            .then((response) => response.json())
            .then((data) => setServerStatus(data))
            .catch((error) => console.error(error));

        setWorkerVersions([]);
        navigator.serviceWorker.addEventListener("message", (event) => {
            if (event.data.type === "version") {
                setWorkerVersions((current) => [
                    ...current,
                    event.data.version,
                ]);
            }
        });
        navigator.serviceWorker.ready.then((registration) => {
            registration.active.postMessage({ type: "version" });
        });

        return () => controller.abort();
    }, []);

    return (
        <Stack>
            <Skeleton visible={serverStatus == null}>
                <Text>Backend: {serverStatus?.version}</Text>
            </Skeleton>
            <Text>Frontend: {FRONTEND_VERSION}</Text>
            <Text>Worker: {workerVersions.join(", ")}</Text>
        </Stack>
    );
}
