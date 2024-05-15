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
  Drawer,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useState } from "react";

const RidesList = [
  {
    year: 2024,
    month: 1,
    totalDistance: 1501,
    rides: [
      { id: 1, date: "2024-01-01", distance: 501, description: "first ride" },
      { id: 2, date: "2024-01-02", distance: 1000 },
      {
        id: 3,
        date: "2024-01-03",
        distance: 12,
        description: "third ride and its super looooooooooooong description",
      },
    ],
  },
];

export default function Rides() {
  const [editing, setEditing] = useState();
  const editedRide = RidesList.flatMap((ride) => ride.rides).find(
    (r) => r.id === editing
  );

  const newForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      date: new Date(),
      distance: "",
      description: "",
    },
    validate: {
      distance: (value) =>
        value > 0 ? null : "Distance should be greater than 0",
    },
  });

  function createRide() {
    const { date, distance, description } = newForm.getValues();
    alert(`Creating ride: ${date}, ${distance} km, ${description}`);
  }

  return (
    <Container size="lg" style={{ width: "100%" }} p="0">
      <Flex direction={{ base: "column", xs: "row" }} wrap="nowrap" gap="xs">
        <Paper shadow="xl" p="xs" style={{ flexShrink: 0 }}>
          <form onSubmit={newForm.onSubmit(createRide)}>
            <Stack>
              <DateInput
                withAsterisk
                label="Date"
                key={newForm.key("date")}
                {...newForm.getInputProps("date")}
              />
              <NumberInput
                withAsterisk
                label="Distance"
                placeholder="(km)"
                key={newForm.key("distance")}
                {...newForm.getInputProps("distance")}
              />
              <Textarea
                label="Description"
                placeholder="(optional)"
                key={newForm.key("description")}
                {...newForm.getInputProps("description")}
              />
              <Button variant="filled" type="submit">
                Add
              </Button>
            </Stack>
          </form>
        </Paper>
        <Stack
          gap="sm"
          style={{
            flexGrow: 1,
            overflow: "hidden",
          }}
        >
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
              <Stack gap="xs">
                <Group justify="space-between" pb="xs">
                  <Text fw="bold" size="lg">
                    {ride.year}-{ride.month}
                  </Text>
                  <Text fw="bold" size="lg">
                    {ride.totalDistance} km
                  </Text>
                </Group>
                {ride.rides.map((ride) => (
                  <Group
                    key={ride.id}
                    justify="flex-start"
                    style={{
                      cursor: "pointer",
                      flexWrap: "nowrap",
                      overflow: "hidden",
                    }}
                    onClick={() => setEditing(ride.id)}
                  >
                    <Text style={{ flexShrink: 0 }}>{ride.date}</Text>
                    <Text
                      style={{
                        flexGrow: 1,
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {ride.description}
                    </Text>
                    <Text size="md" fw="bolder" style={{ flexShrink: 0 }}>
                      {ride.distance} km
                    </Text>
                  </Group>
                ))}
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Flex>
      <Drawer
        offset={8}
        radius="md"
        opened={editing}
        onClose={() => setEditing(undefined)}
        title="Editing Ride"
        position="right"
      >
        <Stack gap="sm">
          <DateInput label="Date" />
          <NumberInput
            label="Distance"
            placeholder="(km)"
            value={editedRide?.distance}
          />
          <Textarea
            label="Description"
            placeholder="(optional)"
            value={editedRide?.description}
          />
          <Group justify="space-between">
            <Button variant="filled">Save</Button>
            <Button variant="light" color="red">
              Delete
            </Button>
          </Group>
        </Stack>
      </Drawer>
    </Container>
  );
}
