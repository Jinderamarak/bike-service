import React from "react";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function BikeSelect() {
    const [_, setSelectedColor] = useRecoilState(selectedBikeColorAtom);
    const [selectedBike, setSelectedBike] = useRecoilState(selectedBikeIdAtom);
    const bikeCombobox = useCombobox();
    const bikeService = useBikeService();
    const queryClient = useQueryClient();
    const bikesQuery = useQuery({
        queryKey: ["bikes"],
        queryFn: () => bikeService.getAll(),
    });

    function selectBike(bikeId) {
        bikeCombobox.closeDropdown();
        let bike = bikesQuery.data.find((b) => b.id == bikeId);
        setSelectedColor(bike.color);
        setSelectedBike(bikeId);

        queryClient.invalidateQueries({ queryKey: ["rides"] });
        queryClient.invalidateQueries({ queryKey: ["activeYears"] });
    }

    const bike = bikesQuery.data?.find((b) => b.id == selectedBike);
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
                            {bike?.name || (
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
