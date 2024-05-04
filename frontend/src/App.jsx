import { Stack } from "@mantine/core";
import Navigation from "./parts/Navigation";
import Rides from "./pages/Rides";
import Stats from "./pages/Stats";
import Data from "./pages/Data";
import { Routes, Route } from "react-router-dom";
import { useRecoilState } from "recoil";
import { selectedBikeAtom } from "./atoms";
import { useEffect } from "react";

function App() {
  const selectedBike = useRecoilState(selectedBikeAtom)[0];

  useEffect(() => {
    if (selectedBike) {
      localStorage.setItem("selectedBike", selectedBike);
    }
  }, [selectedBike]);

  return (
    <Stack p="xs" gap="xs">
      <Navigation />
      <Routes>
        <Route index element={<Rides />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/data" element={<Data />} />
      </Routes>
    </Stack>
  );
}

export default App;
