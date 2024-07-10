import React, { useEffect, useState } from "react";
import { Button, Skeleton, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { FRONTEND_RESOURCES } from "../../constants.js";

// @ts-ignore
const FRONTEND_VERSION = APP_VERSION;

export default function Versions() {
    const [loading, setLoading] = useState(false);
    const [serverStatus, setServerStatus] = useState(null);
    const [workerVersions, setWorkerVersions] = useState([]);

    async function updateFrontend() {
        setLoading(true);
        try {
            for (const resource of FRONTEND_RESOURCES) {
                try {
                    const response = await fetch(resource, { cache: "reload" });
                    if (!response.ok) {
                        throw new Error(
                            `Request responsed with ${response.status} status code`
                        );
                    }
                } catch (error) {
                    notifications.show({
                        title: `Failed to update ${resource}`,
                        message: error.message,
                        color: "red",
                        withBorder: true,
                    });
                }
            }

            notifications.show({
                title: "Frontend updated",
                message: "Reloading page to apply changes",
                color: "green",
                withBorder: true,
            });
            setTimeout(() => {
                location.reload();
            }, 2000);
        } finally {
            setLoading(false);
        }
    }

    function handleOnMessage(event) {
        if (event.data.type === "version") {
            setWorkerVersions((current) => [...current, event.data.version]);
        }
    }

    useEffect(() => {
        let controller = new AbortController();
        fetch("/api/status", { signal: controller.signal })
            .then((response) => response.json())
            .then((data) => setServerStatus(data))
            .catch((err) => {
                if (err.name === "AbortError") return;
                console.error(err);
                notifications.show({
                    title: "Failed to fetch backend version",
                    message: err.message,
                    color: "red",
                    withBorder: true,
                });
            });

        setWorkerVersions([]);

        navigator.serviceWorker?.addEventListener("message", handleOnMessage);
        navigator.serviceWorker?.ready?.then((registration) => {
            registration.active.postMessage({ type: "version" });
        });

        return () => {
            controller.abort();
            navigator.serviceWorker?.removeEventListener(
                "message",
                handleOnMessage
            );
        };
    }, []);

    return (
        <Stack>
            <Skeleton visible={serverStatus == null}>
                <Text>Backend: {serverStatus?.version}</Text>
            </Skeleton>
            <Text>Frontend: {FRONTEND_VERSION}</Text>
            <Text>Worker: {workerVersions.join(", ")}</Text>
            <Button variant="filled" onClick={updateFrontend} loading={loading}>
                Update
            </Button>
        </Stack>
    );
}
