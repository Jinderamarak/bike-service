import React, { useState } from "react";
import { Container, Flex, Paper, Skeleton, Stack, Text } from "@mantine/core";
import BikeCreateForm from "./BikeCreateForm.jsx";
import BikeEntry from "./BikeEntry.jsx";
import BikeEditDrawer from "./BikeEditDrawer.jsx";
import useBikeService from "../../services/bikeService.js";
import { useQuery } from "@tanstack/react-query";

export default function BikesPage() {
    const bikeService = useBikeService();
    const [editedBike, setEditedBike] = useState(null);

    const bikesQuery = useQuery({
        queryKey: ["bikes"],
        queryFn: bikeService.getAll,
    });

    return (
        <Container size="lg" p={0} style={{ width: "100%" }}>
            <Flex direction={{ base: "column", xs: "row" }} gap="md">
                <BikeCreateForm />
                <Skeleton
                    visible={bikesQuery.isLoading}
                    style={{ flexGrow: 1, overflow: "hidden" }}
                >
                    <Stack gap="md">
                        {bikesQuery.data?.length === 0 && (
                            <Paper withBorder p="md">
                                <Text fw="bold" size="lg" ta="center">
                                    No Bikes
                                </Text>
                            </Paper>
                        )}
                        {(bikesQuery.data ?? []).map((bike) => (
                            <BikeEntry
                                {...bike}
                                key={bike.id}
                                onEditBike={setEditedBike}
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
                onClose={() => setEditedBike(null)}
            />
        </Container>
    );
}
