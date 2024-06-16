import React, { useEffect, useState } from "react";
import { Group, Skeleton, Stack, Text } from "@mantine/core";

export default function Hostnames() {
    const [tests, setTests] = useState(null);

    function handleOnMessage(event) {
        if (event.data.type === "checkHosts") {
            setTests(event.data.results);
        }
    }

    useEffect(() => {
        navigator.serviceWorker.addEventListener("message", handleOnMessage);
        navigator.serviceWorker.ready.then((registration) => {
            registration.active.postMessage({ type: "checkHosts" });
        });

        return () => {
            navigator.serviceWorker.removeEventListener(
                "message",
                handleOnMessage
            );
        };
    }, []);

    return (
        <Stack>
            <Skeleton visible={tests == null}>
                {(tests ?? []).map((test) => (
                    <Group key={test.host}>
                        {test.host}
                        <HostStatus state={test.available} />
                    </Group>
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
