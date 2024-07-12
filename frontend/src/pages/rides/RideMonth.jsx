import React from "react";
import { Divider, Group, Paper, Skeleton, Stack, Text } from "@mantine/core";
import RideEntry from "./RideEntry.jsx";

export default function RideMonth({
    year,
    month,
    totalDistance,
    rides,
    loading,
    onEditRide,
}) {
    if (loading) {
        return <Skeleton height={100} />;
    } else if (rides === null) {
        return null;
    }

    const label = `${year}-${month < 10 ? `0${month}` : month}`;
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
