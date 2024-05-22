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
import { useRecoilState } from "recoil";
import { selectedBikeAtom } from "../../atoms";
import RideCreateForm from "./RideCreateForm";
import React from "react";
import RideMonth from "./RideMonth";
import RideEditDrawer from "./RideEditDrawer";
import RideYearGroup from "../../components/RideYearGroup";
import WithSelectedBike from "../../components/WithSelectedBike";

export default function RidesPage() {
    const [selectedBike, _] = useRecoilState(selectedBikeAtom);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [rideMonths, setRideMonths] = useState(null);
    const [editedRide, setEditedRide] = useState(null);

    const totalDistance = useMemo(() => {
        if (rideMonths === null) return null;
        return rideMonths.reduce((acc, group) => acc + group.totalDistance, 0);
    }, [rideMonths]);

    function handleOnRideCreated(ride) {
        const date = new Date(ride.date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const group = rideMonths?.find(
            (g) => g.year === year && g.month === month
        );

        if (group) {
            group.rides = [ride, ...group.rides];
            group.totalDistance += ride.distance;
            setRideMonths([...rideMonths]);
        }

        if (year !== selectedYear) {
            setSelectedYear(year);
        }
    }

    function handleOnRideEdit(ride) {
        setEditedRide(ride);
    }

    function handleOnCancel() {
        setEditedRide(null);
    }

    function handleOnRideEdited(newRide) {
        setEditedRide(null);

        const newDate = new Date(newRide.date);
        const newYear = newDate.getFullYear();
        const newMonth = newDate.getMonth() + 1;

        const oldRide = rideMonths
            .flatMap((g) => g.rides)
            .find((r) => r.id === newRide.id);
        const oldDate = new Date(oldRide.date);
        const oldYear = oldDate.getFullYear();
        const oldMonth = oldDate.getMonth() + 1;

        const visitedMonths = [];
        setRideMonths((current) => {
            return current.map((group) => {
                if (visitedMonths.includes(group.month)) {
                    return group;
                }
                visitedMonths.push(group.month);

                if (group.year === oldYear && group.month === oldMonth) {
                    group.rides = group.rides.filter(
                        (r) => r.id !== newRide.id
                    );
                    group.totalDistance -= oldRide.distance;
                }
                if (group.year === newYear && group.month === newMonth) {
                    group.rides = [newRide, ...group.rides];
                    group.totalDistance += newRide.distance;
                }
                return group;
            });
        });
    }

    function handleOnRideDeleted(rideId) {
        setEditedRide(null);

        const ride = rideMonths
            .flatMap((g) => g.rides)
            .find((r) => r.id === rideId);
        const date = new Date(ride.date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        setRideMonths((current) => {
            return current.map((group) => {
                if (group.year === year && group.month === month) {
                    group.rides = group.rides.filter((r) => r.id !== rideId);
                    group.totalDistance -= ride.distance;
                }
                return group;
            });
        });
    }

    useEffect(() => {
        if (selectedBike === null) return;
        setRideMonths(null);

        let controller = new AbortController();
        fetch(`/api/bikes/${selectedBike}/rides/monthly/${selectedYear}`, {
            signal: controller.signal,
        })
            .then((response) => response.json())
            .then((data) => setRideMonths(data))
            .catch((err) => console.warn(err));

        return () => controller.abort();
    }, [selectedBike, selectedYear]);

    const cutoffMonth = useMemo(() => {
        const lastWithRides = (rideMonths ?? []).find(
            (g) => g.rides.length !== 0
        );
        const now = new Date();
        const currentMonth =
            now.getFullYear() == selectedYear ? now.getMonth() + 1 : 12;
        return Math.max(currentMonth, lastWithRides?.month ?? 1);
    }, [rideMonths, selectedYear]);

    return (
        <Container size="lg" p={0} style={{ width: "100%" }}>
            <WithSelectedBike>
                <Flex direction={{ base: "column", xs: "row" }} gap="xs">
                    <RideCreateForm onRideCreated={handleOnRideCreated} />
                    <Stack
                        gap="sm"
                        style={{
                            flexGrow: 1,
                            overflow: "hidden",
                        }}
                    >
                        <Skeleton visible={totalDistance === null}>
                            <Paper withBorder p="xs">
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
                        {(rideMonths ?? [])
                            .filter((g) => g.month <= cutoffMonth)
                            .map((group) => (
                                <RideMonth
                                    key={`${group.year}-${group.month}`}
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
