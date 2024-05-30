import React, { useEffect, useState } from "react";
import {
    selectedBikeIdAtom,
    selectedBikeColorAtom,
} from "../../data/persistentAtoms";
import { useRecoilState } from "recoil";
import {
    Combobox,
    Input,
    InputBase,
    Skeleton,
    useCombobox,
    Text,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import useBikes from "../../data/useBikes";

export default function BikeSelect() {
    const { bikes } = useBikes();
    const [_, setSelectedColor] = useRecoilState(selectedBikeColorAtom);
    const [selectedBike, setSelectedBike] = useRecoilState(selectedBikeIdAtom);
    const bikeCombobox = useCombobox();
    const navigate = useNavigate();

    function selectBike(bikeId) {
        bikeCombobox.closeDropdown();
        if (bikeId < 0) {
            navigate("/bikes");
            return;
        }
        setSelectedBike(bikeId);
    }

    useEffect(() => {
        if (bikes === null) return;
        if (selectedBike !== null && selectedBike >= 0) {
            let bike = bikes.find((b) => b.id === selectedBike);
            if (bike === undefined) {
                setSelectedBike(null);
            }
        }

        let bike = bikes.find((b) => b.id === selectedBike);
        setSelectedColor(bike?.color ?? null);
    }, [bikes, selectedBike, setSelectedBike]);

    return (
        <Skeleton
            visible={bikes === null}
            maw={{ base: "100%", xs: "15rem" }}
            style={{ overflow: "hidden" }}
        >
            <Combobox
                store={bikeCombobox}
                onOptionSubmit={selectBike}
                width="fit-content"
            >
                <Combobox.Target>
                    <InputBase
                        component="button"
                        type="button"
                        pointer
                        rightSection={<Combobox.Chevron />}
                        rightSectionPointerEvents="none"
                        onClick={() => bikeCombobox.toggleDropdown()}
                        style={{ overflow: "hidden" }}
                    >
                        <Text
                            style={{
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {(bikes ?? []).find((b) => b.id === selectedBike)
                                ?.name || (
                                <Input.Placeholder>
                                    Select Bike
                                </Input.Placeholder>
                            )}
                        </Text>
                    </InputBase>
                </Combobox.Target>
                <Combobox.Dropdown>
                    <Combobox.Options>
                        {(bikes ?? []).map((bike) => (
                            <Combobox.Option key={bike.id} value={bike.id}>
                                {bike.name}
                            </Combobox.Option>
                        ))}
                        <Combobox.Option key={-1} value="-1">
                            + Manage Bikes
                        </Combobox.Option>
                    </Combobox.Options>
                </Combobox.Dropdown>
            </Combobox>
        </Skeleton>
    );
}
