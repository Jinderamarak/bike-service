import React, { useRef } from "react";
import {
    AspectRatio,
    Container,
    Flex,
    Image,
    Paper,
    Text,
} from "@mantine/core";
import WithSelectedBike from "../../components/WithSelectedBike.jsx";
import ComponentPoint from "./ComponentPoint.jsx";

/**
 * @typedef {"ok" | "warn" | "fail"} EventVariant
 */

/**
 * @typedef ComponentPoint
 * @property {number} id
 * @property {number} x
 * @property {number} y
 * @property {string} name
 * @property {ComponentEvent | null} lastEvent
 */

/**
 * @typedef ComponentProduct
 * @property {number} id
 * @property {string} name
 * @property {number} distance
 * @property {number} days
 */

/**
 * @typedef ComponentDetail
 * @property {number} id
 * @property {string} name
 * @property {ComponentProduct} product
 * @property {ComponentEvent[]} events
 * @property {ServiceInterval[]} intervals
 */

/**
 * @typedef ComponentEvent
 * @property {number} id
 * @property {number} componentId
 * @property {number | null} intervalId
 * @property {EventVariant} variant
 * @property {string} description
 */

/**
 * @typedef ServiceInterval
 * @property {number} id
 * @property {number} componentId
 * @property {number} interval
 * @property {"kilometer" | "day"} unit
 * @property {string} description
 */

/** @type {ComponentPoint[]} */
const defaultPoints = [
    {
        id: 1,
        x: 0.9,
        y: 0.9,
        name: "Front Tire",
        lastEvent: {
            id: 1,
            componentId: 1,
            intervalId: null,
            variant: "ok",
            description: "Installation",
        },
    },
    {
        id: 2,
        x: 0.1,
        y: 0.9,
        name: "Rear Tire",
        lastEvent: {
            id: 2,
            componentId: 2,
            intervalId: null,
            variant: "fail",
            description: "Puncture",
        },
    },
    {
        id: 3,
        x: 0.85,
        y: 0.6,
        name: "Front Brake",
        lastEvent: {
            id: 3,
            componentId: 3,
            intervalId: null,
            variant: "ok",
            description: "Installation",
        },
    },
    {
        id: 4,
        x: 0.15,
        y: 0.55,
        name: "Rear Brake",
        lastEvent: {
            id: 4,
            componentId: 4,
            intervalId: 1,
            variant: "warn",
            description: "Brake pad wear",
        },
    },
    {
        id: 5,
        x: 0.4,
        y: 0.07,
        name: "Seat",
        lastEvent: {
            id: 5,
            componentId: 5,
            intervalId: null,
            variant: "ok",
            description: "Installation",
        },
    },
];

export default function ServicingPage() {
    //const [points, setPoints] = useState(defaultPoints);
    const points = defaultPoints;
    const container = useRef(null);

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
                                <ComponentPoint key={point.id} {...point} />
                            ))}
                        </AspectRatio>
                    </Paper>
                </Flex>
            </WithSelectedBike>
        </Container>
    );
}
