import React, { useMemo } from "react";
import { Divider, Group, Paper, Skeleton, Stack, Text } from "@mantine/core";
import RideEntry from "./RideEntry.jsx";
import { useQuery } from "@tanstack/react-query";
import useRideService from "../../services/rideService.js";
import { useRecoilState } from "recoil";
import { selectedBikeIdAtom } from "../../data/persistentAtoms.js";

export default function RideMonth({ year, month, onEditRide }) {
    const [selectedBike, _] = useRecoilState(selectedBikeIdAtom);
    const rideService = useRideService(selectedBike);
    const ridesQuery = useQuery({
        queryKey: ["rides", selectedBike, year, month],
        queryFn: () => rideService.getMonth(year, month),
    });

    const isRelevant = useMemo(() => {
        if (!ridesQuery.data) {
            return false;
        }

        if (ridesQuery.data?.rides.length > 0) {
            return true;
        }

        const now = new Date();
        if (year !== now.getFullYear()) {
            return true;
        }

        if (month <= now.getMonth() + 1) {
            return true;
        }

        return false;
    }, [ridesQuery.data]);

    if (!isRelevant) {
        return null;
    }

    const label = `${year}-${month < 10 ? `0${month}` : month}`;
    if (ridesQuery.data.rides.length === 0) {
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
                        {ridesQuery.data.totalDistance.toFixed(2)} km
                    </Text>
                </Group>
                <Divider />
                {ridesQuery.data.rides.map((ride) => (
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
