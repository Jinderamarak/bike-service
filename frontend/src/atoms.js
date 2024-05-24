import { atom } from "recoil";

const storedSelectedBike = localStorage.getItem("selectedBike");
export const selectedBikeAtom = atom({
    key: "selectedBike",
    default: storedSelectedBike ? parseFloat(storedSelectedBike) : null,
});

export const selectedColorAtom = atom({
    key: "selectedColor",
    default: null,
});
