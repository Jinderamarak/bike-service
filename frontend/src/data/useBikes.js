import { useEffect } from "react";
import { atom, useRecoilState } from "recoil";
import useBikeService from "../services/bikeService.js";

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
    const bikeService = useBikeService();
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
        bikeService
            .getAll()
            .then(setBikes)
            .finally(() => setLoading(false));
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
