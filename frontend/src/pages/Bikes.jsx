import {
  Flex,
  Stack,
  Paper,
  Group,
  Text,
  Container,
  Textarea,
  Button,
  Drawer,
  TextInput,
  Skeleton,
  ActionIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState, useEffect } from "react";
import { IconPencil } from "@tabler/icons-react";

const nameValidator = (value) =>
  value.length > 0 ? null : "Name should not be empty";

export default function Bikes() {
  const [bikes, setBikes] = useState(null);

  const [loadingDelete, setLoadingDelete] = useState(false);

  const [editing, setEditing] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const editForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      description: "",
    },
    validate: {
      name: nameValidator,
    },
  });

  const [loadingCreate, setLoadingCreate] = useState(false);
  const newForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      description: "",
    },
    validate: {
      name: nameValidator,
    },
  });

  function createBike() {
    setLoadingCreate(true);
    const { name, description } = newForm.getValues();
    const body = {
      name,
      description: description || null,
    };

    fetch("/api/bikes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((bike) => setBikes((current) => [...current, bike]))
      .finally(() => {
        setLoadingCreate(false);
        newForm.reset();
      });
  }

  function deleteBike(bikeId) {
    setLoadingDelete(true);
    fetch(`/api/bikes/${bikeId}`, {
      method: "DELETE",
    })
      .then(() => setBikes((current) => current.filter((r) => r.id !== bikeId)))
      .finally(() => setLoadingDelete(false));
  }

  function updateBike() {
    setLoadingEdit(true);
    const { name, description } = editForm.getValues();
    const body = {
      name,
      description: description || null,
    };

    fetch(`/api/bikes/${editing}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((bike) =>
        setBikes((current) => current.map((r) => (r.id === bike.id ? bike : r)))
      )
      .finally(() => {
        setLoadingEdit(false);
        setEditing(null);
      });
  }

  function editBike(bikeId) {
    setEditing(bikeId);
    const editedBike = (bikes ?? []).find((r) => r.id === bikeId);
    editForm.setValues({
      name: editedBike?.name ?? "",
      description: editedBike?.description ?? "",
    });
  }

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/bikes", { signal: controller.signal })
      .then((response) => response.json())
      .then((data) => setBikes(data))
      .catch((err) => console.warn(err));

    return () => controller.abort();
  }, []);

  return (
    <Container size="lg" style={{ width: "100%" }} p="0">
      <Flex direction={{ base: "column", xs: "row" }} wrap="nowrap" gap="xs">
        <Paper shadow="xl" p="xs" style={{ flexShrink: 0 }}>
          <form onSubmit={newForm.onSubmit(createBike)}>
            <Stack>
              <TextInput
                withAsterisk
                label="Name"
                key={newForm.key("name")}
                {...newForm.getInputProps("name")}
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
        <Skeleton visible={bikes === null}>
          <Stack
            gap="sm"
            style={{
              flexGrow: 1,
              overflow: "hidden",
            }}
          >
            {bikes?.length === 0 && (
              <Paper shadow="xl" py="xs" px="md">
                <Text fw="bold" size="lg" ta="center">
                  No Bikes
                </Text>
              </Paper>
            )}
            {(bikes ?? []).map((bike) => (
              <Paper key={bike.id} shadow="xl" py="xs" px="md">
                <Stack gap="xs">
                  <Stack>
                    <Group justify="space-between">
                      <Text fw="bold" size="lg">
                        {bike.name}
                      </Text>
                      <ActionIcon
                        variant="filled"
                        onClick={() => editBike(bike.id)}
                      >
                        <IconPencil
                          style={{ width: "70%", height: "70%" }}
                          stroke={1.5}
                        />
                      </ActionIcon>
                    </Group>
                    {bike.description && <Text>{bike.description}</Text>}
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Skeleton>
      </Flex>
      <Drawer
        offset={8}
        radius="md"
        opened={editing}
        onClose={() => setEditing(undefined)}
        title="Editing Bike"
        position="right"
      >
        <form onSubmit={editForm.onSubmit(updateBike)}>
          <Stack gap="sm">
            <TextInput
              withAsterisk
              label="Name"
              key={editForm.key("name")}
              {...editForm.getInputProps("name")}
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
                loading={loadingEdit || loadingDelete}
                variant="filled"
                type="submit"
              >
                Save
              </Button>
              <Button
                variant="filled"
                color="red"
                onClick={() => deleteBike(editing)}
                loading={loadingEdit || loadingDelete}
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
