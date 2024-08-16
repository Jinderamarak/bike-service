import {
    Flex,
    Stack,
    Paper,
    Group,
    Text,
    Container,
    Skeleton,
} from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import RideCreateForm from "./RideCreateForm.jsx";
import React from "react";
import RideMonth from "./RideMonth.jsx";
import RideEditDrawer from "./RideEditDrawer.jsx";
import RideYearGroup from "../../components/RideYearGroup.jsx";
import WithSelectedBike from "../../components/WithSelectedBike.jsx";
import { WhenOffline } from "../../components/WhenNetwork.jsx";
import { useQuery } from "@tanstack/react-query";
import { useRecoilState } from "recoil";
import { selectedBikeIdAtom } from "../../data/persistentAtoms.js";
import useRideService from "../../services/rideService.js";

export default function RidesPage() {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [editedRide, setEditedRide] = useState(null);
    const [selectedBike, _] = useRecoilState(selectedBikeIdAtom);
    const rideService = useRideService(selectedBike);

    const totalQuery = useQuery({
        queryKey: ["rides", selectedBike, "total", selectedYear],
        queryFn: () => rideService.totalDistance(selectedYear),
    });

    return (
        <Container size="lg" p={0} style={{ width: "100%" }}>
            <WithSelectedBike>
                <Flex direction={{ base: "column", xs: "row" }} gap="md">
                    <RideCreateForm />
                    <Stack
                        gap="md"
                        style={{
                            flexGrow: 1,
                            overflow: "hidden",
                        }}
                    >
                        <WhenOffline>
                            <Text fs="italic" ta="center">
                                Some rides can be unavailable while offline!
                            </Text>
                        </WhenOffline>
                        <Skeleton visible={totalQuery.isLoading}>
                            <Paper withBorder p="md">
                                <Group justify="space-between">
                                    <Text fw="bold" size="xl">
                                        Total Distance
                                    </Text>
                                    <Text fw="bold" size="lg">
                                        {(totalQuery.data ?? 0).toFixed(2)} km
                                    </Text>
                                </Group>
                            </Paper>
                        </Skeleton>
                        {Array.from({ length: 12 }).map((_, i) => (
                            <RideMonth
                                key={`${selectedYear}-${12 - i}`}
                                year={selectedYear}
                                month={12 - i}
                                onEditRide={setEditedRide}
                            />
                        ))}
                        <Group justify="center">
                            <RideYearGroup
                                year={selectedYear}
                                onYearSelected={setSelectedYear}
                            />
                        </Group>
                    </Stack>
                </Flex>
                <RideEditDrawer
                    id={editedRide?.id}
                    date={editedRide?.date}
                    distance={editedRide?.distance}
                    description={editedRide?.description}
                    stravaRide={editedRide?.stravaRide}
                    onClose={() => setEditedRide(null)}
                />
            </WithSelectedBike>
        </Container>
    );
}
