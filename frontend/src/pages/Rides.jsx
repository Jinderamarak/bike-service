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
  Skeleton,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useEffect, useMemo, useState } from "react";
import { useRecoilState } from "recoil";
import { selectedBikeAtom } from "../atoms";

export default function Rides() {
  const [selectedBike, _] = useRecoilState(selectedBikeAtom);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [years, setYears] = useState([new Date().getFullYear()]);

  const [rideGroups, setRideGroups] = useState(null);
  const totalDistance = useMemo(() => {
    if (rideGroups === null) return null;
    return rideGroups.reduce((acc, group) => acc + group.totalDistance, 0);
  }, [rideGroups]);

  const [loadingDelete, setLoadingDelete] = useState(false);

  const [editing, setEditing] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const editForm = useForm({
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

  const [loadingCreate, setLoadingCreate] = useState(false);
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
    setLoadingCreate(true);
    const { date, distance, description } = newForm.getValues();
    const body = {
      date: date.toISOString().split("T")[0],
      distance,
      description: description || null,
    };

    fetch(`/api/bikes/${selectedBike}/rides`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((ride) => {
        const year = new Date(ride.date).getFullYear();
        const month = new Date(ride.date).getMonth() + 1;
        const group = rideGroups?.find(
          (g) => g.year === year && g.month === month
        );

        if (group) {
          group.rides.push(ride);
          group.totalDistance += ride.distance;
          setRideGroups([...rideGroups]);
        }

        if (year !== selectedYear) {
          setSelectedYear(year);
        }
      })
      .finally(() => {
        setLoadingCreate(false);
        newForm.reset();
      });
  }

  function deleteRide(rideId) {
    setLoadingDelete(true);
    fetch(`/api/rides/${rideId}`, {
      method: "DELETE",
    })
      .then(() => {
        rideGroups.forEach((group) => {
          group.rides.forEach((ride) => {
            if (ride.id === rideId) {
              group.totalDistance -= ride.distance;
            }
          });
          group.rides = group.rides.filter((ride) => ride.id !== rideId);
        });
        setRideGroups([...rideGroups]);
      })
      .finally(() => {
        setLoadingDelete(false);
        setEditing(null);
      });
  }

  function updateRide() {
    setLoadingEdit(true);
    const { date, distance, description } = editForm.getValues();
    const body = {
      date: date.toISOString().split("T")[0],
      distance,
      description: description || null,
    };

    fetch(`/api/rides/${editing}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((ride) => {
        const year = new Date(ride.date).getFullYear();
        const month = new Date(ride.date).getMonth() + 1;
        const group = rideGroups?.find(
          (g) => g.year === year && g.month === month
        );

        if (group) {
          const editedRide = group.rides.find((r) => r.id === ride.id);

          const distanceDiff = ride.distance - editedRide.distance;
          group.totalDistance += distanceDiff;

          editedRide.date = ride.date;
          editedRide.distance = ride.distance;
          editedRide.description = ride.description;
          setRideGroups([...rideGroups]);
        }
      })
      .finally(() => {
        setLoadingEdit(false);
        setEditing(null);
      });
  }

  function editRide(rideId) {
    setEditing(rideId);
    const editedRide = rideGroups
      .flatMap((group) => group.rides)
      .find((r) => r.id === rideId);

    editForm.setValues({
      date: new Date(editedRide.date),
      distance: editedRide.distance,
      description: editedRide.description,
    });
  }

  function selectYear(year) {
    setSelectedYear(year);
    setRideGroups(null);
  }

  useEffect(() => {
    if (selectedBike === null) return;
    setRideGroups(null);

    let controller = new AbortController();
    fetch(`/api/bikes/${selectedBike}/rides/monthly/${selectedYear}`, {
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data) => setRideGroups(data))
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
        <Text align="center">Please select a bike to see its rides</Text>
      </Container>
    );
  }

  const lastWithRides = (rideGroups ?? []).find((g) => g.rides.length !== 0);
  const currentMonth =
    new Date().getFullYear() == selectedYear ? new Date().getMonth() + 1 : 12;
  const cutoffMonth = Math.max(currentMonth, lastWithRides?.month ?? 1);
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
                disabled={loadingCreate}
              />
              <NumberInput
                withAsterisk
                label="Distance"
                placeholder="(km)"
                key={newForm.key("distance")}
                {...newForm.getInputProps("distance")}
                disabled={loadingCreate}
              />
              <Textarea
                label="Description"
                placeholder="(optional)"
                key={newForm.key("description")}
                {...newForm.getInputProps("description")}
                disabled={loadingCreate}
              />
              <Button loading={loadingCreate} variant="filled" type="submit">
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
          <Skeleton visible={totalDistance === null}>
            <Paper shadow="xl" py="xs" px="md">
              <Group justify="space-between">
                <Text fw="bold" size="xl">
                  Total Distance
                </Text>
                <Text fw="bold" size="lg">
                  {totalDistance} km
                </Text>
              </Group>
            </Paper>
          </Skeleton>
          {(rideGroups ?? [])
            .filter((g) => g.month <= cutoffMonth)
            .map((group) => (
              <Paper
                key={`${group.year}-${group.month}`}
                shadow="xl"
                py="xs"
                px="md"
              >
                <Stack gap="xs">
                  <Group justify="space-between" pb="xs">
                    <Text fw="bold" size="lg">
                      {group.year}-{group.month < 10 ? "0" : ""}
                      {group.month}
                    </Text>
                    <Text fw="bold" size="lg">
                      {group.totalDistance} km
                    </Text>
                  </Group>
                  {group.rides.map((ride) => (
                    <Group
                      key={ride.id}
                      justify="flex-start"
                      style={{
                        cursor: "pointer",
                        flexWrap: "nowrap",
                        overflow: "hidden",
                      }}
                      onClick={() => editRide(ride.id)}
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
      </Flex>
      <Drawer
        offset={8}
        radius="md"
        opened={editing}
        onClose={() => setEditing(undefined)}
        title="Editing Ride"
        position="right"
      >
        <form onSubmit={editForm.onSubmit(updateRide)}>
          <Stack gap="sm">
            <DateInput
              label="Date"
              key={editForm.key("date")}
              {...editForm.getInputProps("date")}
              disabled={loadingEdit || loadingDelete}
            />
            <NumberInput
              label="Distance"
              placeholder="(km)"
              key={editForm.key("distance")}
              {...editForm.getInputProps("distance")}
              disabled={loadingEdit || loadingDelete}
            />
            <Textarea
              label="Description"
              placeholder="(optional)"
              key={editForm.key("description")}
              {...editForm.getInputProps("description")}
              disabled={loadingEdit || loadingDelete}
            />
            <Group justify="space-between">
              <Button
                loading={loadingEdit}
                disabled={loadingDelete}
                variant="filled"
                type="submit"
              >
                Save
              </Button>
              <Button
                loading={loadingDelete}
                disabled={loadingEdit}
                variant="filled"
                color="red"
                onClick={() => deleteRide(editing)}
              >
                Delete
              </Button>
            </Group>
          </Stack>
        </form>
      </Drawer>
    </Container>
  );
}
