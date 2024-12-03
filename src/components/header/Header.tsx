import { useState, useEffect, useRef, useContext, ChangeEvent } from "react";
import ReactGA from "react-ga4";
import {
  AvatarCircle,
  CaretDownIcon,
  DropdownContainer,
  GameSelectDropdown,
  GameSelectDropdownMenu,
  GameSelectDropdownMenuItem,
  HeaderNav,
  HeaderText,
  HomeIcon,
  LogoColumn,
  NameRow,
  QortalLogoIcon,
  RightColumn,
  Username,
} from "./Header-styles";
import gameContext from "../../contexts/gameContext";
import { UserContext } from "../../contexts/userContext";
import { cropAddress } from "../../utils/cropAddress";
import { BubbleCardColored1 } from "../../pages/Home/Home-Styles";
import logoSVG from "../../assets/SVG/LOGO.svg";
import {
  Alert,
  Avatar,
  Box,
  Button,
  FormControlLabel,
  MenuItem,
  Select,
  Snackbar,
  SnackbarCloseReason,
  Switch,
  styled,
} from "@mui/material";
import { sendRequestToExtension } from "../../App";
import { Terms } from "../Terms";

const checkIfLocal = async () => {
  try {
    const response = await sendRequestToExtension("CHECK_IF_LOCAL");

    if (!response.error) {
      return response;
    }
  } catch (error) {
    return false;
  }
};

export const Label = styled("label")(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14px;
  display: block;
  margin-bottom: 4px;
  font-weight: 400;
  `
);

export const Header = ({ qortBalance, coinBalance, mode, setMode }: any) => {
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState<any>(null);
  const { isUsingGateway, selectedCoin, setSelectedCoin, selectedCoinSymbol, setSelectedCoinSymbol } = useContext(gameContext);
  const supportedCoins = [
    { name: "Litecoin", symbol: "LTC", blockchain: "LITECOIN" },
    { name: "Bitcoin", symbol: "BTC", blockchain: "BITCOIN" },
    { name: "Dogecoin", symbol: "DOGE", blockchain: "DOGECOIN" },
    { name: "Digibyte", symbol: "DGB", blockchain: "DIGIBYTE" },
    { name: "Ravencoin", symbol: "RVN", blockchain: "RAVENCOIN" },
    // Add more coins here
  ];

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChecked(false);
    setOpen(true);
    setInfo({
      type: "error",
      message: "Change the node you are using at the authentication page",
    });
  };
  const { userInfo } = useContext(gameContext);
  const { avatar, setAvatar } = useContext(UserContext);

  const LocalNodeSwitch = styled(Switch)(({ theme }) => ({
    padding: 8,
    "& .MuiSwitch-track": {
      borderRadius: 22 / 2,
      "&::before, &::after": {
        content: '""',
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        width: 16,
        height: 16,
      },
      "&::before": {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
          theme.palette.getContrastText(theme.palette.primary.main)
        )}" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>')`,
        left: 12,
      },
      "&::after": {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
          theme.palette.getContrastText(theme.palette.primary.main)
        )}" d="M19,13H5V11H19V13Z" /></svg>')`,
        right: 12,
      },
    },
    "& .MuiSwitch-thumb": {
      boxShadow: "none",
      width: 16,
      height: 16,
      margin: 2,
    },
  }));

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
    setInfo(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // // Fetch avatar on userInfo change
  // useEffect(() => {
  //   if (userInfo?.name) {
  //     getAvatar();
  //   }
  // }, [userInfo]);

  return (
    <HeaderNav
      sx={{
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: "20px",
          alignItems: "center",
        }}
      >
        <LogoColumn>
          <img
            src={logoSVG}
            style={{
              height: "24px",
            }}
          />
        </LogoColumn>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "5px",
          }}
        >
          <Select
          size="small"
            value={selectedCoin}
            onChange={(e) => {
              const selectedBlockchain = e.target.value;
              setSelectedCoin(selectedBlockchain);
              const coin = supportedCoins.find((c) => c.blockchain === selectedBlockchain);
              setSelectedCoinSymbol(coin?.symbol || "");
            }}
          >
            {supportedCoins.map((coin) => (
              <MenuItem key={coin.blockchain} value={coin.blockchain}>
                {coin.symbol}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      <RightColumn>
        <HeaderText>
          Balance: {qortBalance} QORT | {coinBalance === null ? "N/A" : coinBalance} {selectedCoinSymbol}
        </HeaderText>
        <NameRow>
          {userInfo?.name ? (
            <Username>{userInfo?.name}</Username>
          ) : userInfo?.address ? (
            <Username>{cropAddress(userInfo?.address)}</Username>
          ) : null}

          {userInfo?.name ? (
            <Avatar
              sx={{
                height: "24px",
                width: "24px",
                fontSize: "15px",
              }}
              src={`/arbitrary/THUMBNAIL/${userInfo?.name}/qortal_avatar?encoding=base64&rebuild=false`}
              alt={`${userInfo?.name}`}
            >
              {userInfo?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
          ) : userInfo?.address ? (
            <BubbleCardColored1 style={{ height: "35px", width: "35px" }} />
          ) : (
            <QortalLogoIcon
              height="35"
              width="35"
              color="none"
              onClickFunc={() => {
                window.open("https://www.qortal.dev", "_blank")?.focus();
              }}
            />
          )}
        </NameRow>
      </RightColumn>
      <FormControlLabel
        sx={{
          color: "white",
        }}
        control={
          <LocalNodeSwitch checked={isUsingGateway} onChange={handleChange} />
        }
        label="Is using Gateway"
      />
      <Terms />
      <Box
        sx={{
          display: "flex",
          gap: "20px",
          alignItems: "center",
        }}
      >
        <Button onClick={() => setMode("buy")}>Buy QORT</Button>
        <Button onClick={() => setMode("sell")}>SELL QORT</Button>
      </Box>

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity={info?.type}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {info?.message}
        </Alert>
      </Snackbar>
    </HeaderNav>
  );
};
