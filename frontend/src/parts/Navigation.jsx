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
  Skeleton,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { selectedBikeAtom } from "../atoms";

export default function Navigation() {
  const [bikes, setBikes] = useState(null);
  const [selectedBike, setSelectedBike] = useRecoilState(selectedBikeAtom);
  const bikeCombobox = useCombobox();

  const [isOpened, setIsOpened] = useState(false);
  const alwaysOpened = useMatches({
    base: false,
    xs: true,
  });

  const navigate = useNavigate();
  const location = useLocation();

  function selectBike(bikeId) {
    bikeCombobox.closeDropdown();
    if (bikeId < 0) {
      navigate("/bikes");
      return;
    }
    setSelectedBike(bikeId);
  }

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

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/bikes", { signal: controller.signal })
      .then((response) => response.json())
      .then((data) => setBikes(data))
      .catch((err) => console.warn(err));

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (bikes === null) return;
    if (selectedBike !== null && selectedBike >= 0) {
      let bike = bikes.find((b) => b.id === selectedBike);
      if (bike === undefined) {
        setSelectedBike(null);
      }
    }
  }, [bikes, selectedBike, setSelectedBike]);

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
        <Skeleton visible={bikes === null}>
          <Combobox store={bikeCombobox} onOptionSubmit={selectBike}>
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
                  {(bikes ?? []).find((b) => b.id === selectedBike)?.name || (
                    <Input.Placeholder>Select Bike</Input.Placeholder>
                  )}
                </Text>
              </InputBase>
            </Combobox.Target>
            <Combobox.Dropdown>
              <Combobox.Options>
                {(bikes ?? []).map((bike) => (
                  <Combobox.Option key={bike.id} value={bike.id}>
                    {bike.name}
                  </Combobox.Option>
                ))}
                <Combobox.Option key={-1} value={-1}>
                  + Manage Bikes
                </Combobox.Option>
              </Combobox.Options>
            </Combobox.Dropdown>
          </Combobox>
        </Skeleton>
      </Flex>
    </Paper>
  );
}

function buttonVariant(isActive) {
  return isActive ? "filled" : "default";
}
