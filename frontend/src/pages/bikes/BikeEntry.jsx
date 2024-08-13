import React from "react";
import {
    ActionIcon,
    ColorSwatch,
    Group,
    Paper,
    Stack,
    Text,
} from "@mantine/core";
import { IconPencil, IconBrandStrava } from "@tabler/icons-react";
import { WhenOnline } from "../../components/WhenNetwork.jsx";

export default function BikeEntry({
    id,
    name,
    description,
    color,
    onEditBike,
    stravaGear,
}) {
    function handleOnEditClick() {
        onEditBike({ id, name, description, color, stravaGear });
    }

    return (
        <Paper withBorder p="md">
            <Stack>
                <Group wrap="nowrap">
                    <Text fw="bold" size="lg" truncate="end" flex="1 1 auto">
                        {name}
                    </Text>
                    { stravaGear && <IconBrandStrava size={24} /> }
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
