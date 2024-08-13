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

export default function BikeFormFields({
    form,
    disabled,
    availableStravaGear,
}) {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    useEffect(() => {
        if (availableStravaGear) {
            combobox.selectOption(
                1 +
                    availableStravaGear.findIndex((gear) => {
                        console.log(gear.id, form.values.stravaGear);
                        return gear.id === form.values.stravaGear;
                    })
            );
        } else {
            combobox.selectOption(0);
        }

        // console.log(combobox.selectedOptionIndex);
    }, [form, availableStravaGear]);

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
            {availableStravaGear && (
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
                                {availableStravaGear.find(
                                    (gear) => gear.id === form.values.stravaGear
                                )?.name || (
                                    <Input.Placeholder>None</Input.Placeholder>
                                )}
                            </InputBase>
                        </Combobox.Target>
                        <Combobox.Dropdown>
                            <Combobox.Options>
                                <Combobox.Option value={null}>
                                    None
                                </Combobox.Option>
                                {availableStravaGear.map((gear) => (
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
