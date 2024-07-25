import React, { useEffect, useRef, useState } from "react";
import {
    AspectRatio,
    Container,
    Flex,
    Image,
    Paper,
    Popover,
    useMantineTheme,
    Text,
    Indicator,
} from "@mantine/core";
import WithSelectedBike from "../../components/WithSelectedBike.jsx";
import { useDisclosure } from "@mantine/hooks";
import useDrag from "../../lib/useDrag.js";

/**
 * @typedef {"ok" | "warn" | "fail"} EventVariant
 */

/**
 * @typedef ComponentPoint
 * @property {number} id
 * @property {number} x
 * @property {number} y
 * @property {string} name
 * @property {string} product
 * @property {ComponentEvent} lastEvent
 */

/**
 * @typedef ComponentDetail
 * @property {number} id
 * @property {string} name
 * @property {string} product
 * @property {number} distance
 * @property {number} days
 */

/**
 * @typedef ComponentEvent
 * @property {number} id
 * @property {number} componentId
 * @property {EventVariant} variant
 * @property {string} description
 */

const defaultPoints = [
    { id: 0, x: 0.5, y: 0.5 },
    { id: 1, x: 0.1, y: 0.1 },
    { id: 2, x: 0.9, y: 0.1 },
    { id: 3, x: 0.1, y: 0.9 },
    { id: 4, x: 0.9, y: 0.9 },
];

export default function ServicingPage() {
    const [points, setPoints] = useState(defaultPoints);
    const container = useRef(null);

    function onPointUpdate(id, x, y) {
        setPoints((points) =>
            points.map((point) =>
                point.id === id ? { ...point, x, y } : point
            )
        );
    }

    return (
        <Container size="lg" p={0} style={{ width: "100%" }}>
            <WithSelectedBike>
                <Flex direction="column" gap="md">
                    <Paper withBorder p="md">
                        <AspectRatio
                            ratio={16 / 9}
                            pos="relative"
                            ref={container}
                        >
                            <Image
                                src="/bikes/mtb_crop.png"
                                radius="md"
                                fit="contain"
                            />
                            {points.map((point) => (
                                <BikeItem
                                    key={point.id}
                                    {...point}
                                    onPointUpdate={onPointUpdate}
                                    container={container}
                                />
                            ))}
                        </AspectRatio>
                    </Paper>
                </Flex>
            </WithSelectedBike>
        </Container>
    );
}

function clamp(x) {
    return Math.max(0, Math.min(1, x));
}

function BikeItem({ id, x, y, onPointUpdate, container }) {
    const theme = useMantineTheme();

    function onMove(x, y) {
        const rect = container.current.getBoundingClientRect();
        const nx = clamp((x - rect.left) / rect.width);
        const ny = clamp((y - rect.top) / rect.height);
        onPointUpdate(id, nx, ny);
    }

    const hole = () => {};
    const ref = useDrag(hole, onMove, hole);

    const primary = theme.colors[theme.primaryColor][0];
    const [opened, { close, open }] = useDisclosure();
    return (
        <div
            style={{
                position: "absolute",
                left: `${x * 100}%`,
                top: `${y * 100}%`,
                width: "2rem",
                height: "2rem",
                cursor: "crosshair",
                transform: "translate(-50%, -50%)",
            }}
            ref={ref}
        >
            <Popover position="bottom" opened={opened}>
                <Popover.Target>
                    <Indicator processing offset={2}>
                        <svg
                            viewBox="0 0 10 10"
                            onMouseEnter={open}
                            onMouseLeave={close}
                        >
                            <circle cx="5" cy="5" r="5" fill={theme.white} />
                            <circle cx="5" cy="5" r="3" fill={primary} />
                        </svg>
                    </Indicator>
                </Popover.Target>
                <Popover.Dropdown>
                    <Text size="sm">{id}</Text>
                </Popover.Dropdown>
            </Popover>
        </div>
    );
}
