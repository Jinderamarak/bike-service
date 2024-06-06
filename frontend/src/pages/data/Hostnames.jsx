import React, { useEffect, useState } from "react";
import { Group, Skeleton, Stack, Text } from "@mantine/core";

export default function Hostnames() {
    const [serverStatus, setServerStatus] = useState(null);
    const [reachable, setReachable] = useState({});

    useEffect(() => {
        let controller = new AbortController();
        fetch("/api/status", { signal: controller.signal })
            .then((response) => response.json())
            .then((data) => setServerStatus(data))
            .catch((error) => console.error(error));

        return () => controller.abort();
    }, []);

    useEffect(() => {
        if (serverStatus == null) return;

        let controller = new AbortController();
        Promise.all(
            serverStatus.hostnames.map((host) =>
                fetch(`${host}/api/status`, {
                    signal: controller.signal,
                })
                    .then((response) => response.json())
                    .then(() =>
                        setReachable((prev) => ({
                            ...prev,
                            [host]: true,
                        }))
                    )
                    .catch(() =>
                        setReachable((prev) => ({ ...prev, [host]: false }))
                    )
            )
        );

        const timeout = setTimeout(() => controller.abort(), 5000);
        return () => {
            controller.abort();
            clearTimeout(timeout);
        };
    }, [serverStatus]);

    return (
        <Stack>
            <Skeleton visible={serverStatus == null}>
                {(serverStatus?.hostnames ?? []).map((host) => (
                    <Text key={host}>
                        {host}
                        <Skeleton visible={reachable[host] == undefined}>
                            <HostStatus state={reachable[host]} />
                        </Skeleton>
                    </Text>
                ))}
            </Skeleton>
        </Stack>
    );
}

function HostStatus({ state }) {
    if (state) {
        return <Text c="green">UP</Text>;
    } else {
        return <Text c="red">DOWN</Text>;
    }
}
