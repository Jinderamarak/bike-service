import React from "react";
import { ActionIcon, Group, Paper, Stack, Text } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";

export default function BikeEntry({ id, name, description, onEditBike }) {
    function handleOnEditClick() {
        onEditBike({ id, name, description });
    }

    return (
        <Paper withBorder p="xs">
            <Stack>
                <Group justify="space-between" wrap="nowrap">
                    <Text
                        fw="bold"
                        size="lg"
                        style={{
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                        }}
                    >
                        {name}
                    </Text>
                    <ActionIcon variant="light" onClick={handleOnEditClick}>
                        <IconPencil />
                    </ActionIcon>
                </Group>
                {description && (
                    <Text style={{ overflowWrap: "anywhere" }}>
                        {description}
                    </Text>
                )}
            </Stack>
        </Paper>
    );
}
