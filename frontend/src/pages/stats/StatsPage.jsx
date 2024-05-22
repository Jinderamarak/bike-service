import { Button, Container, Group, Skeleton, Stack, Text } from "@mantine/core";
import { AreaChart } from "@mantine/charts";
import { useEffect, useState } from "react";
import { selectedBikeAtom } from "../../atoms";
import { useRecoilState } from "recoil";
import RideYearGroup from "../../components/RideYearGroup";
import React from "react";
import WithSelectedBike from "../../components/WithSelectedBike";
import { mapStatsData } from "./data";

export default function StatsPage() {
    const [selectedBike, _] = useRecoilState(selectedBikeAtom);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (selectedBike === null) return;
        setStats(null);

        let controller = new AbortController();
        fetch(`/api/bikes/${selectedBike}/rides/monthly/${selectedYear}`, {
            signal: controller.signal,
        })
            .then((response) => response.json())
            .then((data) => setStats(mapStatsData(data)))
            .catch((err) => console.warn(err));

        return () => controller.abort();
    }, [selectedBike, selectedYear]);

    return (
        <Container size="lg" p={0} style={{ width: "100%" }}>
            <WithSelectedBike>
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
                            referenceLines={[
                                { y: 100, label: "Monthly goal", color: "red" },
                            ]}
                            withXAxis={false}
                            valueFormatter={(v) => v.toFixed(2)}
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
                        />
                    </Skeleton>
                    <Group justify="center">
                        <RideYearGroup
                            year={selectedYear}
                            onYearSelected={setSelectedYear}
                        />
                    </Group>
                </Stack>
            </WithSelectedBike>
        </Container>
    );
}
