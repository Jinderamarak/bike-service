import React, { useMemo } from "react";
import { Divider, Group, Paper, Stack, Text } from "@mantine/core";
import RideEntry from "./RideEntry";

export default function RideMonth({
    year,
    month,
    totalDistance,
    rides,
    onEditRide,
}) {
    const label = useMemo(() => {
        return `${year}-${month < 10 ? `0${month}` : month}`;
    }, [year, month]);

    if (rides.length === 0) {
        return <Divider label={label} labelPosition="center" />;
    }

    return (
        <Paper withBorder p="md">
            <Stack gap="md">
                <Group justify="space-between">
                    <Text fw="bold" size="lg">
                        {label}
                    </Text>
                    <Text fw="bold" size="lg">
                        {totalDistance.toFixed(2)} km
                    </Text>
                </Group>
                <Divider />
                {rides.map((ride) => (
                    <RideEntry
                        {...ride}
                        key={ride.id}
                        onEditRide={onEditRide}
                    />
                ))}
            </Stack>
        </Paper>
    );
}
