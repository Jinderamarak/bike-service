import React, { useEffect, useState } from "react";
import { Button, Skeleton, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { FRONTEND_RESOURCES } from "../../constants.js";
import useStatusService from "../../services/statusService.js";
import { WhenOnline } from "../../components/WhenNetwork.jsx";
import { workerCall } from "../../lib/WorkerCom.js";

// @ts-ignore
const FRONTEND_VERSION = APP_VERSION;

export default function Versions() {
    const statusService = useStatusService();
    const [loading, setLoading] = useState(false);
    const [serverStatus, setServerStatus] = useState(null);
    const [workerVersion, setWorkerVersion] = useState(null);

    async function updateFrontend() {
        setLoading(true);

        await workerCall("update");

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

    useEffect(() => {
        statusService.get().then(setServerStatus);
        workerCall("version").then((data) => {
            setWorkerVersion(data?.version ?? "None");
        });
    }, []);

    return (
        <Stack>
            <Skeleton visible={serverStatus == null}>
                <Text>Backend: {serverStatus?.version}</Text>
            </Skeleton>
            <Text>Frontend: {FRONTEND_VERSION}</Text>
            <Skeleton visible={workerVersion == null}>
                <Text>Worker: {workerVersion}</Text>
            </Skeleton>
            <WhenOnline>
                <Button
                    variant="filled"
                    onClick={updateFrontend}
                    loading={loading}
                >
                    Update
                </Button>
            </WhenOnline>
        </Stack>
    );
}
