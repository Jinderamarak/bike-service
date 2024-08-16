import React from "react";
import { useRecoilState } from "recoil";
import { selectedBikeIdAtom } from "../data/persistentAtoms.js";
import { Button } from "@mantine/core";
import useRideService from "../services/rideService.js";
import { useQuery } from "@tanstack/react-query";

export default function RideYearGroup({ year, onYearSelected }) {
    const [selectedBike, _] = useRecoilState(selectedBikeIdAtom);
    const rideService = useRideService(selectedBike);
    const query = useQuery({
        queryFn: () => rideService.getActiveYears(),
        queryKey: ["activeYears"],
    });

    return (
        <Button.Group>
            {query.data?.map((y) => (
                <Button
                    key={y}
                    variant={y === year ? "filled" : "light"}
                    onClick={() => onYearSelected(y)}
                >
                    {y}
                </Button>
            ))}
        </Button.Group>
    );
}
