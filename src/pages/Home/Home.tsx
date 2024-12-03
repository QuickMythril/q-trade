import { FC, useContext, useEffect, useState } from "react";
import { AppContainer } from "../../App-styles";

import axios from "axios";
import { Header } from "../../components/header/Header";
import { useLocation, useNavigate } from "react-router-dom";
import gameContext from "../../contexts/gameContext";
import { Link } from "react-router-dom";
import { NotificationContext } from "../../contexts/notificationContext";

import { TradeOffers } from "../../components/Grids/TradeOffers";
import { OngoingTrades } from "../../components/Grids/OngoingTrades";
import { Box, Button, CircularProgress } from "@mui/material";
import { TextTableTitle } from "../../components/Grids/Table-styles";
import { Spacer } from "../../components/common/Spacer";
import { ReusableModal } from "../../components/common/reusable-modal/ReusableModal";
import { OAuthButton, OAuthButtonRow } from "./Home-Styles";
import { CreateSell } from "../../components/sell/CreateSell";

interface IsInstalledProps {}

export const HomePage: FC<IsInstalledProps> = ({}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    qortBalance,
    coinBalances,
    userInfo,
    isAuthenticated,
    setIsAuthenticated,
    OAuthLoading,
    setOAuthLoading,
    selectedCoin,
    selectedCoinSymbol,
  } = useContext(gameContext);
  const { setNotification } = useContext(NotificationContext);
  const [mode, setMode] = useState("buy");

  const checkIfAuthenticated = async () => {
    try {
      setOAuthLoading(true);

      setIsAuthenticated(true);
    } catch (error) {
    } finally {
      setOAuthLoading(false);
    }
  };
  useEffect(() => {
    if (!userInfo?.address) return;
    checkIfAuthenticated();
  }, [userInfo?.address]);

  return (
    <AppContainer>
      <Header
        qortBalance={qortBalance}
        coinBalance={coinBalances[selectedCoinSymbol]}
        mode={mode}
        setMode={setMode}
      />

      <div
        style={{
          width: "100%",
          display: mode === "buy" ? "block" : "none",
        }}
      >
        <Spacer height="10px" />
        <Box
          sx={{
            padding: "0 10px",
            width: "100%",
          }}
        >
          <TextTableTitle
            sx={{
              fontSize: "16px",
            }}
          >
            My Pending Orders
          </TextTableTitle>
        </Box>
        <Spacer height="10px" />
        <OngoingTrades />
        <Spacer height="10px" />
        <Box
          sx={{
            padding: "0 10px",
            width: "100%",
          }}
        >
          <TextTableTitle
            sx={{
              fontSize: "16px",
            }}
          >
            Open Market Sell Orders
          </TextTableTitle>
        </Box>
        <Spacer height="10px" />
        <TradeOffers coinBalance={coinBalances[selectedCoinSymbol]} />
      </div>

      <CreateSell show={mode === "sell"} qortAddress={userInfo?.address} />
    </AppContainer>
  );
};
