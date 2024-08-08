import React from "react";
import { Popover, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import EventIndicator from "./EventIndicator.jsx";

/**
 * @param {import("./ServicingPage.jsx").ComponentPoint} props
 */
export default function ComponentPoint({ id, x, y, name, lastEvent }) {
    const [opened, { close, open }] = useDisclosure();

    return (
        <div
            style={{
                position: "absolute",
                left: `${x * 100}%`,
                top: `${y * 100}%`,
                width: "2rem",
                height: "2rem",
                transform: "translate(-50%, -50%)",
            }}
        >
            <Popover position="bottom" opened={opened}>
                <Popover.Target>
                    <a
                        href={`#component-${id}`}
                        onMouseEnter={open}
                        onMouseLeave={close}
                    >
                        <EventIndicator variant={lastEvent?.variant ?? "ok"} />
                    </a>
                </Popover.Target>
                <Popover.Dropdown>
                    <Title order={2}>{name}</Title>
                    <Text size="md">{lastEvent?.description}</Text>
                </Popover.Dropdown>
            </Popover>
        </div>
    );
}
