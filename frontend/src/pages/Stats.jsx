import { Button, Container, Group, Skeleton, Stack, Text } from "@mantine/core";
import { AreaChart } from "@mantine/charts";
import { useEffect, useState } from "react";
import { selectedBikeAtom } from "../atoms";
import { useRecoilState } from "recoil";

const Months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function mapData(data) {
  return data
    .map((item) => ({
      ...item,
      rides: item.rides.length === 0 ? null : item.rides.length,
      totalDistance: item.rides.length === 0 ? null : item.totalDistance,
      month: Months[item.month - 1],
    }))
    .reverse();
}

export default function Stats() {
  const [selectedBike, _] = useRecoilState(selectedBikeAtom);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [years, setYears] = useState([new Date().getFullYear()]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (selectedBike === null) return;
    setStats(null);

    let controller = new AbortController();
    fetch(`/api/bikes/${selectedBike}/rides/monthly/${selectedYear}`, {
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data) => setStats(mapData(data)))
      .catch((err) => console.warn(err));

    return () => controller.abort();
  }, [selectedBike, selectedYear]);

  useEffect(() => {
    if (selectedBike === null) return;

    let controller = new AbortController();
    fetch(`/api/bikes/${selectedBike}/rides/years`, {
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data) => setYears(data))
      .catch((err) => console.warn(err));

    return () => controller.abort();
  }, [selectedBike]);

  if (selectedBike === null) {
    return (
      <Container size="lg" style={{ width: "100%" }} p="md">
        <Text align="center">Please select a bike to see its stats</Text>
      </Container>
    );
  }

  return (
    <Stack gap="md">
      <Skeleton visible={stats === null}>
        <AreaChart
          h={180}
          data={stats ?? []}
          dataKey="month"
          series={[
            { label: "Total Distance", name: "totalDistance", color: "blue" },
          ]}
          areaChartProps={{ syncId: "statsPage" }}
          tickLine="xy"
          withLegend
          unit=" km"
          referenceLines={[{ y: 100, label: "Monthly goal", color: "red" }]}
          withXAxis={false}
          valueFormatter={(v) => v.toFixed(2)}
        />
      </Skeleton>
      <Skeleton visible={stats === null}>
        <AreaChart
          h={180}
          data={stats ?? []}
          dataKey="month"
          series={[{ label: "Rides", name: "rides", color: "indigo" }]}
          areaChartProps={{ syncId: "statsPage" }}
          tickLine="xy"
          withLegend
        />
      </Skeleton>
      <Group justify="center">
        <Button.Group>
          {(years.length === 0 ? [new Date().getFullYear()] : years).map(
            (year) => (
              <Button
                key={year}
                variant={year === selectedYear ? "filled" : "default"}
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </Button>
            )
          )}
        </Button.Group>
      </Group>
    </Stack>
  );
}
