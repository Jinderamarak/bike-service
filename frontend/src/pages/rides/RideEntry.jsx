import React from "react";
import { Group, Text } from "@mantine/core";
import { IconBrandStrava } from "@tabler/icons-react";

export default function RideEntry({
    id,
    date,
    distance,
    stravaRide,
    description,
    onEditRide,
}) {
    function handleClick() {
        onEditRide({ id, date, distance, description, stravaRide });
    }

    return (
        <Group
            justify="flex-start"
            wrap="nowrap"
            onClick={handleClick}
            style={{ cursor: "pointer", overflow: "hidden" }}
        >
            <Text>{date}</Text>
            {stravaRide && <IconBrandStrava size={24} />}
            <Text truncate="end" style={{ flexGrow: 1 }}>
                {description}
            </Text>
            <Text size="md" fw="bolder" style={{ whiteSpace: "nowrap" }}>
                {distance.toFixed(2)} km
            </Text>
        </Group>
    );
}
