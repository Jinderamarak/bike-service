import React, { useEffect, useState } from "react";
import { Container, Group, Skeleton, Stack } from "@mantine/core";
import { AreaChart } from "@mantine/charts";
import { selectedBikeIdAtom } from "../../data/persistentAtoms.js";
import { useRecoilState } from "recoil";
import RideYearGroup from "../../components/RideYearGroup.jsx";
import WithSelectedBike from "../../components/WithSelectedBike.jsx";
import { mapStatsData } from "./data.js";
import WithNetwork from "../../components/WithNetwork.jsx";
import useRideService from "../../services/rideService.js";
import useUserService from "../../services/userService.js";
import { useQuery } from "@tanstack/react-query";

function goalLine(goal) {
    if (goal === null) return [];
    return [
        {
            y: goal,
            label: "Monthly goal",
            color: "red",
        },
    ];
}

export default function StatsPage() {
    const [selectedBike, _] = useRecoilState(selectedBikeIdAtom);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const rideService = useRideService(selectedBike);
    const userService = useUserService();

    const goalQuery = useQuery({
        queryKey: ["user", "monthlyGoal"],
        queryFn: () => userService.current().then((user) => user.monthlyGoal),
    });

    const statsQuery = useQuery({
        queryKey: ["rides", selectedBike, "stats", selectedYear],
        queryFn: () =>
            rideService.getMonthlyRides(selectedYear).then(mapStatsData),
    });

    return (
        <Container size="lg" p={0} style={{ width: "100%" }}>
            <WithSelectedBike>
                <WithNetwork>
                    <Stack gap="md">
                        <Skeleton visible={statsQuery.isLoading}>
                            <AreaChart
                                h={200}
                                data={statsQuery.data ?? []}
                                dataKey="month"
                                series={[
                                    {
                                        label: "Total Distance",
                                        name: "totalDistance",
                                        color: "blue",
                                    },
                                ]}
                                areaChartProps={{ syncId: "statsPage" }}
                                tickLine="xy"
                                withLegend
                                unit=" km"
                                referenceLines={goalLine(goalQuery.data)}
                                withXAxis={false}
                                valueFormatter={(v) => v.toFixed(2)}
                                connectNulls={false}
                            />
                        </Skeleton>
                        <Skeleton visible={statsQuery.isLoading}>
                            <AreaChart
                                h={200}
                                data={statsQuery.data ?? []}
                                dataKey="month"
                                series={[
                                    {
                                        label: "Rides",
                                        name: "rides",
                                        color: "indigo",
                                    },
                                ]}
                                areaChartProps={{ syncId: "statsPage" }}
                                tickLine="xy"
                                withLegend
                                connectNulls={false}
                            />
                        </Skeleton>
                        <Group justify="center">
                            <RideYearGroup
                                year={selectedYear}
                                onYearSelected={setSelectedYear}
                            />
                        </Group>
                    </Stack>
                </WithNetwork>
            </WithSelectedBike>
        </Container>
    );
}
