import {
  Flex,
  Stack,
  Paper,
  Group,
  Text,
  Container,
  NumberInput,
  Textarea,
  Button,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";

const RidesList = [
  {
    year: 2024,
    month: 1,
    totalDistance: 1501,
    rides: [
      { id: 1, date: "2024-01-01", distance: 501, description: "first ride" },
      { id: 2, date: "2024-01-02", distance: 1000 },
      { id: 3, date: "2024-01-03", distance: 12, description: "third ride" },
    ],
  },
];

export default function Rides() {
  return (
    <Container size="lg" style={{ width: "100%" }} p="0">
      <Flex direction={{ base: "column", xs: "row" }} wrap="wrap" gap="xs">
        <Paper shadow="xl" p="xs" style={{ flexShrink: 0 }}>
          <Stack>
            <DateInput label="Date" />
            <NumberInput label="Distance" placeholder="(km)" />
            <Textarea label="Description" placeholder="(optional)" />
            <Button variant="filled">Add</Button>
          </Stack>
        </Paper>
        <Stack gap="sm" style={{ flexGrow: 1 }}>
          <Paper shadow="xl" py="xs" px="md">
            <Group justify="space-between">
              <Text fw="bold" size="xl">
                Total Distance
              </Text>
              <Text fw="bold" size="lg">
                2045 km
              </Text>
            </Group>
          </Paper>
          {RidesList.map((ride) => (
            <Paper
              key={`${ride.year}-${ride.month}`}
              shadow="xl"
              py="xs"
              px="md"
            >
              <Group justify="space-between" pb="xs">
                <Text fw="bold" size="lg">
                  {ride.year}-{ride.month}
                </Text>
                <Text fw="bold" size="lg">
                  {ride.totalDistance} km
                </Text>
              </Group>
              {ride.rides.map((ride) => (
                <Group key={ride.id} justify="flex-start">
                  <Text>{ride.date}</Text>
                  <Text style={{ flexGrow: 1 }}>{ride.description}</Text>
                  <Text size="md">{ride.distance} km</Text>
                </Group>
              ))}
            </Paper>
          ))}
        </Stack>
      </Flex>
    </Container>
  );
}
