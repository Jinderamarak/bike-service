import { notifications } from "@mantine/notifications";
import { useEffect } from "react";
import { atom, useRecoilState } from "recoil";

const innerBikeStore = atom({
    key: "innerBikeStore",
    default: null,
});

const innerBikeSubscribers = atom({
    key: "innerBikeSubscribers",
    default: 0,
});

const innerBikeLoading = atom({
    key: "innerBikeLoading",
    default: true,
});

export default function useBikes() {
    const [bikes, setBikes] = useRecoilState(innerBikeStore);
    const [subscribers, setSubscribers] = useRecoilState(innerBikeSubscribers);
    const [loading, setLoading] = useRecoilState(innerBikeLoading);

    useEffect(() => {
        setSubscribers((s) => s + 1);
        return () => {
            setSubscribers((s) => s - 1);
        };
    }, []);

    useEffect(() => {
        if (subscribers === 0) {
            setBikes(null);
            return;
        }

        if (bikes) {
            return;
        }

        setLoading(true);
        fetch("/api/bikes")
            .then((res) => res.json())
            .then((bikes) => {
                setBikes(bikes);
            })
            .catch((err) => {
                console.error(err);
                notifications.show({
                    title: "Failed to fetch bikes",
                    message: err.message,
                    color: "red",
                    withBorder: true,
                });
            })
            .finally(() => {
                setLoading(false);
            });
    }, [subscribers]);

    function addBike(bike) {
        setBikes((current) => [...current, bike]);
    }

    function editBike(bike) {
        setBikes((current) =>
            current.map((b) => (b.id === bike.id ? bike : b))
        );
    }

    function deleteBike(bikeId) {
        setBikes((current) => current.filter((b) => b.id !== bikeId));
    }

    return {
        bikes,
        loading,
        addBike,
        editBike,
        deleteBike,
    };
}
