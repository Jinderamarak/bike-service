import React, { useEffect, useState } from "react";
import { Container, Flex, Paper, Skeleton, Stack, Text } from "@mantine/core";
import BikeCreateForm from "./BikeCreateForm";
import BikeEntry from "./BikeEntry";
import BikeEditDrawer from "./BikeEditDrawer";

export default function BikesPage() {
    const [bikes, setBikes] = useState(null);
    const [editedBike, setEditedBike] = useState(null);

    function handleOnBikeCreated(bike) {
        setBikes((current) => [...current, bike]);
    }

    function handleOnBikeEdit(bike) {
        setEditedBike(bike);
    }

    function handleOnCancel() {
        setEditedBike(null);
    }

    function handleOnBikeEdited(bike) {
        setEditedBike(null);
        setBikes((current) =>
            current.map((r) => (r.id === bike.id ? bike : r))
        );
    }

    function handleOnBikeDeleted(bikeId) {
        setEditedBike(null);
        setBikes((current) => current.filter((r) => r.id !== bikeId));
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
        <Container size="lg" p={0} style={{ width: "100%" }}>
            <Flex direction={{ base: "column", xs: "row" }} gap="md">
                <BikeCreateForm onBikeCreated={handleOnBikeCreated} />
                <Skeleton
                    visible={bikes === null}
                    style={{ flexGrow: 1, overflow: "hidden" }}
                >
                    <Stack gap="md">
                        {bikes?.length === 0 && (
                            <Paper withBorder p="md">
                                <Text fw="bold" size="lg" ta="center">
                                    No Bikes
                                </Text>
                            </Paper>
                        )}
                        {(bikes ?? []).map((bike) => (
                            <BikeEntry
                                {...bike}
                                key={bike.id}
                                onEditBike={handleOnBikeEdit}
                            />
                        ))}
                    </Stack>
                </Skeleton>
            </Flex>
            <BikeEditDrawer
                id={editedBike?.id}
                name={editedBike?.name}
                description={editedBike?.description}
                onCancel={handleOnCancel}
                onBikeEdited={handleOnBikeEdited}
                onBikeDeleted={handleOnBikeDeleted}
            />
        </Container>
    );
}
