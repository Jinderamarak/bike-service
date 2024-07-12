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
    const [stats, setStats] = useState(null);
    const [monthlyGoal, setMonthlyGoal] = useState(null);
    const rideService = useRideService(selectedBike);
    const userService = useUserService();

    useEffect(() => {
        if (selectedBike === null) return;
        setStats(null);

        rideService.getMonthlyRides(selectedYear).then((data) => {
            setStats(mapStatsData(data));
        });
    }, [selectedBike, selectedYear]);

    useEffect(() => {
        userService.current().then((user) => setMonthlyGoal(user.monthlyGoal));
    }, []);

    return (
        <Container size="lg" p={0} style={{ width: "100%" }}>
            <WithSelectedBike>
                <WithNetwork>
                    <Stack gap="md">
                        <Skeleton visible={stats === null}>
                            <AreaChart
                                h={200}
                                data={stats ?? []}
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
                                referenceLines={goalLine(monthlyGoal)}
                                withXAxis={false}
                                valueFormatter={(v) => v.toFixed(2)}
                                connectNulls={false}
                            />
                        </Skeleton>
                        <Skeleton visible={stats === null}>
                            <AreaChart
                                h={200}
                                data={stats ?? []}
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
