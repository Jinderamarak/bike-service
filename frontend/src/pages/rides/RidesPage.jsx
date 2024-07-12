import {
    Flex,
    Stack,
    Paper,
    Group,
    Text,
    Container,
    Skeleton,
} from "@mantine/core";
import { useMemo, useState } from "react";
import RideCreateForm from "./RideCreateForm.jsx";
import React from "react";
import RideMonth from "./RideMonth.jsx";
import RideEditDrawer from "./RideEditDrawer.jsx";
import RideYearGroup from "../../components/RideYearGroup.jsx";
import WithSelectedBike from "../../components/WithSelectedBike.jsx";
import useRides from "../../data/useRides.js";
import { WhenOffline } from "../../components/WhenNetwork.jsx";

export default function RidesPage() {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [editedRide, setEditedRide] = useState(null);
    const { rides, loading, addRide, editRide, deleteRide } =
        useRides(selectedYear);

    function handleOnRideCreated(ride) {
        addRide(ride);
    }

    function handleOnRideEdit(ride) {
        setEditedRide(ride);
    }

    function handleOnCancel() {
        setEditedRide(null);
    }

    function handleOnRideEdited(newRide) {
        setEditedRide(null);
        editRide(newRide);
    }

    function handleOnRideDeleted(rideId) {
        setEditedRide(null);
        deleteRide(rideId);
    }

    const totalDistance = useMemo(() => {
        return rides.reduce((acc, group) => acc + group.totalDistance, 0);
    }, [rides]);

    const cutoffMonth = useMemo(() => {
        const lastWithRides = rides.find((g) => g.rides?.length !== 0);
        const now = new Date();
        const currentMonth =
            now.getFullYear() == selectedYear ? now.getMonth() + 1 : 12;
        return Math.max(currentMonth, lastWithRides?.month ?? 1);
    }, [rides, selectedYear]);

    return (
        <Container size="lg" p={0} style={{ width: "100%" }}>
            <WithSelectedBike>
                <Flex direction={{ base: "column", xs: "row" }} gap="md">
                    <RideCreateForm onRideCreated={handleOnRideCreated} />
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
                        <Skeleton visible={totalDistance === null}>
                            <Paper withBorder p="md">
                                <Group justify="space-between">
                                    <Text fw="bold" size="xl">
                                        Total Distance
                                    </Text>
                                    <Text fw="bold" size="lg">
                                        {(totalDistance ?? 0).toFixed(2)} km
                                    </Text>
                                </Group>
                            </Paper>
                        </Skeleton>
                        {rides
                            .filter((g) => g.month <= cutoffMonth)
                            .map((group, i) => (
                                <RideMonth
                                    key={`${group.year}-${group.month}`}
                                    loading={loading[i]}
                                    {...group}
                                    onEditRide={handleOnRideEdit}
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
                    onCancel={handleOnCancel}
                    onRideEdited={handleOnRideEdited}
                    onRideDeleted={handleOnRideDeleted}
                />
            </WithSelectedBike>
        </Container>
    );
}
