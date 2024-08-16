import React, { useEffect } from "react";
import {
    Checkbox,
    ColorInput,
    TextInput,
    Textarea,
    Text,
    Combobox,
    InputBase,
    useCombobox,
    Input,
} from "@mantine/core";
import useStravaService from "../../services/stravaService.js";
import { useQuery } from "@tanstack/react-query";

export default function BikeFormFields({ form, disabled }) {
    const stravaService = useStravaService();
    const stravaBikesQuery = useQuery({
        queryKey: ["stravaBikes"],
        queryFn: () => stravaService.getBikes().catch(() => null),
    });
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    useEffect(() => {
        if (stravaBikesQuery.data) {
            combobox.selectOption(
                1 +
                    stravaBikesQuery.data.findIndex((bike) => {
                        return bike.id === form.values.stravaGear;
                    })
            );
        } else {
            combobox.selectOption(0);
        }
    }, [form, stravaBikesQuery]);

    return (
        <>
            <TextInput
                withAsterisk
                label="Name"
                placeholder="Jack's Mountain Bike"
                key={form.key("name")}
                {...form.getInputProps("name")}
                disabled={disabled}
            />
            <Textarea
                label="Description"
                placeholder="(optional)"
                key={form.key("description")}
                {...form.getInputProps("description")}
                disabled={disabled}
            />
            <Checkbox
                label="Custom Color"
                key={form.key("hasColor")}
                {...form.getInputProps("hasColor", { type: "checkbox" })}
                disabled={disabled}
            />
            {form.values.hasColor && (
                <ColorInput
                    key={form.key("color")}
                    {...form.getInputProps("color")}
                    disabled={disabled || !form.values.hasColor}
                />
            )}
            {(stravaBikesQuery.data || form.values.stravaGear) && (
                <>
                    <Text size="sm">Link with Strava gear</Text>
                    <Combobox
                        store={combobox}
                        onOptionSubmit={(val) => {
                            form.setFieldValue("stravaGear", val);
                            combobox.closeDropdown();
                        }}
                    >
                        <Combobox.Target>
                            <InputBase
                                component="button"
                                type="button"
                                pointer
                                rightSection={<Combobox.Chevron />}
                                rightSectionPointerEvents="none"
                                onClick={() => combobox.toggleDropdown()}
                            >
                                {stravaBikeName(
                                    stravaBikesQuery.data,
                                    form.values.stravaGear
                                )}
                            </InputBase>
                        </Combobox.Target>
                        <Combobox.Dropdown>
                            <Combobox.Options>
                                <Combobox.Option value={null}>
                                    None
                                </Combobox.Option>
                                {stravaBikesQuery.data?.map((gear) => (
                                    <Combobox.Option
                                        key={gear.id}
                                        value={gear.id}
                                    >
                                        {gear.name}
                                    </Combobox.Option>
                                ))}
                            </Combobox.Options>
                        </Combobox.Dropdown>
                    </Combobox>
                </>
            )}
        </>
    );
}

function stravaBikeName(bikes, bikeId) {
    if (!bikeId) {
        return <Input.Placeholder>None</Input.Placeholder>;
    }

    const bike = bikes?.find((bike) => bike.id === bikeId);
    return bike ? bike.name : `<${bikeId}>`;
}
