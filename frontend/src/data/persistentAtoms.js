import { useEffect } from "react";
import { atom, useRecoilState } from "recoil";

const localSelectedBikeId = localStorage.getItem("selectedBikeId");
export const selectedBikeIdAtom = atom({
    key: "selectedBikeId",
    default: localSelectedBikeId ? parseFloat(localSelectedBikeId) : null,
});

const localSelectedBikeColor = localStorage.getItem("selectedBikeColor");
export const selectedBikeColorAtom = atom({
    key: "selectedBikeColor",
    default: localSelectedBikeColor || null,
});

export function useLocalStorageSync() {
    const [selectedBikeId, _] = useRecoilState(selectedBikeIdAtom);
    const [selectedBikeColor, __] = useRecoilState(selectedBikeColorAtom);

    useEffect(() => {
        if (selectedBikeId) {
            localStorage.setItem("selectedBikeId", `${selectedBikeId}`);
        } else {
            localStorage.removeItem("selectedBikeId");
        }
    }, [selectedBikeId]);

    useEffect(() => {
        if (selectedBikeColor) {
            localStorage.setItem("selectedBikeColor", `${selectedBikeColor}`);
        } else {
            localStorage.removeItem("selectedBikeColor");
        }
    }, [selectedBikeColor]);
}
