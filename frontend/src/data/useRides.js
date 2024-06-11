import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { selectedBikeIdAtom } from "./persistentAtoms";

function mergeRideMonths(first, second) {
    if (first.rides == null) return second;
    if (second.rides == null) return first;
    return {
        year: first.year,
        month: first.month,
        totalDistance: first.totalDistance + second.totalDistance,
        rides: [...first.rides, ...second.rides],
    };
}

function unmergeRideMonths(group, rideId) {
    const old = group.rides.find((r) => r.id === rideId);
    if (old) {
        return {
            year: group.year,
            month: group.month,
            totalDistance: group.totalDistance - old.distance,
            rides: group.rides.filter((r) => r.id !== rideId),
        };
    }

    return group;
}

function createDefault(year) {
    return Array(12)
        .fill(null)
        .map((_, i) => ({
            year,
            month: 12 - i,
            totalDistance: 0,
            rides: null,
        }));
}

function idx(m) {
    return 12 - m;
}

export default function useRides(year) {
    const [selectedBike, _] = useRecoilState(selectedBikeIdAtom);
    const [rides, setRides] = useState(createDefault(year));
    const [loading, setLoading] = useState(Array(12).fill(true));

    async function fetchRides(signal) {
        setRides(createDefault(year));
        setLoading(Array(12).fill(true));

        for (let month = 12; month > 0; month--) {
            if (signal.aborted) return;

            try {
                const res = await fetch(
                    `/api/bikes/${selectedBike}/rides/${year}/${month}`,
                    { signal }
                );
                const data = await res.json();
                setRides((current) => {
                    return current.map((group) => {
                        if (group.month === month) {
                            return mergeRideMonths(group, data);
                        }
                        return group;
                    });
                });
            } catch (err) {
                if (err.name === "AbortError") return;
                console.error(err);
                notifications.show({
                    title: `Failed to fetch rides from ${year}-${month}`,
                    message: err.message,
                    color: "red",
                });
            } finally {
                setLoading((current) => {
                    return [
                        ...current.slice(0, idx(month)),
                        false,
                        ...current.slice(idx(month) + 1),
                    ];
                });
            }
        }
    }

    useEffect(() => {
        if (selectedBike == null) {
            return;
        }

        const controller = new AbortController();
        fetchRides(controller.signal);

        return () => controller.abort();
    }, [selectedBike, year]);

    function addRide(ride) {
        const date = new Date(ride.date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const newGroup = {
            year,
            month,
            totalDistance: ride.distance,
            rides: [ride],
        };

        setRides((current) => {
            return current.map((group) => {
                if (group.month === month) {
                    return mergeRideMonths(newGroup, group);
                }
                return group;
            });
        });
    }

    function editRide(ride) {
        const date = new Date(ride.date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const newGroup = {
            year,
            month,
            totalDistance: ride.distance,
            rides: [ride],
        };

        setRides((current) => {
            return current.map((group) => {
                const edited = unmergeRideMonths(group, ride.id);
                if (edited.month === month) {
                    return mergeRideMonths(newGroup, edited);
                }
                return edited;
            });
        });
    }

    function deleteRide(rideId) {
        setRides((current) => {
            return current.map((group) => {
                return unmergeRideMonths(group, rideId);
            });
        });
    }

    return {
        rides,
        loading,
        addRide,
        editRide,
        deleteRide,
    };
}
