import {
  Paper,
  Flex,
  Button,
  Collapse,
  Burger,
  Text,
  useMatches,
  Combobox,
  InputBase,
  Input,
  useCombobox,
} from "@mantine/core";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { selectedBikeAtom } from "../atoms";

const BikeList = [
  { id: 1, name: "Jindra's Top Fuel 5" },
  { id: 2, name: "Franta's Cannondale Scalpel" },
];

export default function Navigation() {
  const [selectedBike, setSelectedBike] = useRecoilState(selectedBikeAtom);
  const bikeCombobox = useCombobox();

  const [isOpened, setIsOpened] = useState(false);
  const alwaysOpened = useMatches({
    base: false,
    xs: true,
  });

  const navigate = useNavigate();
  const location = useLocation();

  function goToRides() {
    setIsOpened(false);
    navigate("/");
  }

  function goToStats() {
    setIsOpened(false);
    navigate("/stats");
  }

  function goToData() {
    setIsOpened(false);
    navigate("/data");
  }

  const isRides = location.pathname === "/";
  const isStats = location.pathname === "/stats";
  const isData = location.pathname === "/data";
  return (
    <Paper shadow="xl" p="sm">
      <Flex direction={{ base: "column", xs: "row" }} gap="sm">
        <Flex direction="row" justify="space-between" style={{ flexShrink: 0 }}>
          <Text size="xl">Bike Service</Text>
          <Burger
            hiddenFrom="xs"
            opened={isOpened}
            onClick={() => setIsOpened(!isOpened)}
          />
        </Flex>
        <Collapse in={isOpened || alwaysOpened} style={{ flexGrow: 1 }}>
          <Flex
            direction={{ base: "column", xs: "row" }}
            wrap="nowrap"
            gap="sm"
            justify="center"
          >
            <Button onClick={goToRides} variant={buttonVariant(isRides)}>
              Rides
            </Button>
            <Button onClick={goToStats} variant={buttonVariant(isStats)}>
              Stats
            </Button>
            <Button onClick={goToData} variant={buttonVariant(isData)}>
              Data
            </Button>
          </Flex>
        </Collapse>
        <Combobox
          store={bikeCombobox}
          onOptionSubmit={(val) => {
            setSelectedBike(val);
            bikeCombobox.closeDropdown();
          }}
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
              {
                <Text
                  style={{
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  {BikeList.find((b) => b.id === selectedBike)?.name || (
                    <Input.Placeholder>Select Bike</Input.Placeholder>
                  )}
                </Text>
              }
            </InputBase>
          </Combobox.Target>
          <Combobox.Dropdown>
            <Combobox.Options>
              {BikeList.map((bike) => (
                <Combobox.Option key={bike.id} value={bike.id}>
                  {bike.name}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>
      </Flex>
    </Paper>
  );
}

function buttonVariant(isActive) {
  return isActive ? "filled" : "default";
}
