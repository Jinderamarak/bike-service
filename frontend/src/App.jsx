import { Stack, rem } from "@mantine/core";
import Navigation from "./parts/Navigation";
import Rides from "./pages/Rides";
import BikesPage from "./pages/bikes/BikesPage";
import Stats from "./pages/Stats";
import Data from "./pages/Data";
import { Routes, Route } from "react-router-dom";
import { useRecoilState } from "recoil";
import { selectedBikeAtom } from "./atoms";
import { useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { IconAntenna, IconAntennaOff } from "@tabler/icons-react";

function App() {
  const selectedBike = useRecoilState(selectedBikeAtom)[0];

  useEffect(() => {
    if (selectedBike) {
      localStorage.setItem("selectedBike", selectedBike);
    }
  }, [selectedBike]);

  useEffect(() => {
    const offlineHandler = () => {
      notifications.show({
        title: "Offline",
        message: "You are currently offline",
        autoClose: 5000,
        withBorder: true,
        icon: <IconAntennaOff style={{ width: rem(20), height: rem(20) }} />,
      });
    };

    const onlineHandler = () => {
      notifications.show({
        title: "Online",
        message: "You are back online",
        autoClose: 5000,
        withBorder: true,
        icon: <IconAntenna style={{ width: rem(20), height: rem(20) }} />,
      });
    };

    window.addEventListener("offline", offlineHandler);
    window.addEventListener("online", onlineHandler);

    return () => {
      window.removeEventListener("offline", offlineHandler);
      window.removeEventListener("online", onlineHandler);
    };
  }, []);

  return (
    <Stack p="xs" gap="xs">
      <Navigation />
      <Routes>
        <Route index element={<Rides />} />
        <Route path="/bikes" element={<BikesPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/data" element={<Data />} />
      </Routes>
    </Stack>
  );
}

export default App;
