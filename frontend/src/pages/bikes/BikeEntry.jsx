import React from "react";
import {
    ActionIcon,
    ColorSwatch,
    Group,
    Paper,
    Stack,
    Text,
} from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import { WhenOnline } from "../../components/WhenNetwork.jsx";

export default function BikeEntry({
    id,
    name,
    description,
    color,
    onEditBike,
}) {
    function handleOnEditClick() {
        onEditBike({ id, name, description, color });
    }

    return (
        <Paper withBorder p="md">
            <Stack>
                <Group wrap="nowrap">
                    <Text fw="bold" size="lg" truncate="end" flex="1 1 auto">
                        {name}
                    </Text>
                    <ColorSwatch color={color} />
                    <WhenOnline>
                        <ActionIcon
                            variant="filled"
                            onClick={handleOnEditClick}
                        >
                            <IconPencil />
                        </ActionIcon>
                    </WhenOnline>
                </Group>
                {description && (
                    <Text lineClamp={3} style={{ overflowWrap: "anywhere" }}>
                        {description}
                    </Text>
                )}
            </Stack>
        </Paper>
    );
}
