import React from "react";
import { Group, Text } from "@mantine/core";

export default function RideEntry({
    id,
    date,
    distance,
    description,
    onEditRide,
}) {
    function handleClick() {
        onEditRide({ id, date, distance, description });
    }

    return (
        <Group
            justify="flex-start"
            wrap="nowrap"
            onClick={handleClick}
            style={{ cursor: "pointer", overflow: "hidden" }}
        >
            <Text>{date}</Text>
            <Text truncate="end" style={{ flexGrow: 1 }}>
                {description}
            </Text>
            <Text size="md" fw="bolder" style={{ whiteSpace: "nowrap" }}>
                {distance.toFixed(2)} km
            </Text>
        </Group>
    );
}
