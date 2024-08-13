import React, {useEffect, useState} from "react";
import { Container, Flex, Paper, Skeleton, Stack, Text } from "@mantine/core";
import BikeCreateForm from "./BikeCreateForm.jsx";
import BikeEntry from "./BikeEntry.jsx";
import BikeEditDrawer from "./BikeEditDrawer.jsx";
import useBikes from "../../data/useBikes.js";
import useStravaService from "../../services/stravaService.js";

export default function BikesPage() {
    const { bikes, addBike, editBike, deleteBike } = useBikes();
    const [editedBike, setEditedBike] = useState(null);
    const [stravaGear, setStravaGear] = useState(null);
    const stravaService = useStravaService();

    function handleOnBikeCreated(bike) {
        addBike(bike);
    }

    function handleOnBikeEdit(bike) {
        setEditedBike(bike);
    }

    function handleOnCancel() {
        setEditedBike(null);
    }

    function handleOnBikeEdited(bike) {
        setEditedBike(null);
        editBike(bike);
    }

    function handleOnBikeDeleted(bikeId) {
        setEditedBike(null);
        deleteBike(bikeId);
    }

    useEffect(() => {
        stravaService.getBikes().then(setStravaGear);
    }, []);

    return (
        <Container size="lg" p={0} style={{ width: "100%" }}>
            <Flex direction={{ base: "column", xs: "row" }} gap="md">
                <BikeCreateForm onBikeCreated={handleOnBikeCreated} availableStravaGear={stravaGear} />
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
                name={editedBike?.name ?? ""}
                description={editedBike?.description ?? ""}
                color={editedBike?.color ?? ""}
                stravaGear={editedBike?.stravaGear ?? null}
                availableStravaGear={stravaGear}
                onCancel={handleOnCancel}
                onBikeEdited={handleOnBikeEdited}
                onBikeDeleted={handleOnBikeDeleted}
            />
        </Container>
    );
}
