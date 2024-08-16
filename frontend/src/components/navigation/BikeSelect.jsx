import React, { useEffect } from "react";
import {
    selectedBikeIdAtom,
    selectedBikeColorAtom,
} from "../../data/persistentAtoms.js";
import { useRecoilState } from "recoil";
import {
    Combobox,
    Input,
    InputBase,
    Skeleton,
    useCombobox,
    Text,
} from "@mantine/core";
import useBikeService from "../../services/bikeService.js";
import { useQuery } from "@tanstack/react-query";

export default function BikeSelect() {
    const [_, setSelectedColor] = useRecoilState(selectedBikeColorAtom);
    const [selectedBike, setSelectedBike] = useRecoilState(selectedBikeIdAtom);
    const bikeCombobox = useCombobox();
    const bikeService = useBikeService();
    const bikesQuery = useQuery({
        queryKey: ["bikes"],
        queryFn: () => bikeService.getAll(),
    });

    function selectBike(bikeId) {
        bikeCombobox.closeDropdown();
        setSelectedBike(bikeId);
    }

    useEffect(() => {
        if (bikesQuery.isLoading) return;
        if (selectedBike !== null && selectedBike >= 0) {
            let bike = bikesQuery.data.find((b) => b.id === selectedBike);
            if (bike === undefined) {
                setSelectedBike(null);
            }
        }

        let bike = bikesQuery.data.find((b) => b.id === selectedBike);
        setSelectedColor(bike?.color ?? null);
    }, [bikesQuery, selectedBike, setSelectedBike]);

    return (
        <Skeleton
            visible={bikesQuery.isLoading}
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
                            {(bikesQuery.data ?? []).find(
                                (b) => b.id === selectedBike
                            )?.name || (
                                <Input.Placeholder>
                                    Select Bike
                                </Input.Placeholder>
                            )}
                        </Text>
                    </InputBase>
                </Combobox.Target>
                <Combobox.Dropdown>
                    <Combobox.Options>
                        {(bikesQuery.data ?? []).map((bike) => (
                            <Combobox.Option key={bike.id} value={`${bike.id}`}>
                                {bike.name}
                            </Combobox.Option>
                        ))}
                    </Combobox.Options>
                </Combobox.Dropdown>
            </Combobox>
        </Skeleton>
    );
}
