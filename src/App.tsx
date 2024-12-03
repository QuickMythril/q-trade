import React, { useEffect, useState, useContext } from "react";
import gameContext from "./contexts/gameContext";
import ReactGA from "react-ga4";
import "./App.css";
import socketService from "./services/socketService";
import GameContext, {
  IContextProps,
  UserNameAvatar,
} from "./contexts/gameContext";
import { Route, Routes } from "react-router-dom";

import { ThemeProvider } from "@mui/material";
import { darkTheme } from "./styles/theme";
import { HomePage } from "./pages/Home/Home";
import { UserContext, UserContextProps } from "./contexts/userContext";
import {
  NotificationProps,
  NotificationContext,
} from "./contexts/notificationContext";
import { Notification } from "./components/common/notification/Notification";
import { LoadingContext } from "./contexts/loadingContext";
import axios from "axios";
import { executeEvent } from "./utils/events";
import { useIndexedDBContext } from "./contexts/indexedDBContext";
import { useGetOngoingTransactions } from "./components/DbComponents/OngoingTransactions";




export async function sendRequestToExtension(
  requestType: string,
  payload?: any,
  timeout: number = 20000
): Promise<any> {
  return new Promise((resolve, reject) => {
    const requestId = Math.random().toString(36).substring(2, 15); // Generate a unique ID for the request
    const detail = {
      type: requestType,
      payload,
      requestId,
      timeout: timeout / 1000,
    };

    // Store the timeout ID so it can be cleared later
    const timeoutId = setTimeout(() => {
      document.removeEventListener("qortalExtensionResponses", handleResponse);
      reject(new Error("Request timed out"));
    }, timeout); // Adjust timeout as necessary

    function handleResponse(event: any) {
      const { requestId: responseId, data } = event.detail;
      if (requestId === responseId) {
        // Match the response with the request
        document.removeEventListener(
          "qortalExtensionResponses",
          handleResponse
        );
        clearTimeout(timeoutId); // Clear the timeout upon successful response
        resolve(data);
      }
    }

    document.addEventListener("qortalExtensionResponses", handleResponse);
    document.dispatchEvent(
      new CustomEvent("qortalExtensionRequests", { detail })
    );
  });
}



function App() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [qortBalance, setQortBalance] = useState<any>(null);
  const [coinBalances, setCoinBalances] = useState<{ [key: string]: number | null }>({});
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [OAuthLoading, setOAuthLoading] = useState<boolean>(false);
  const [selectedCoin, setSelectedCoin] = useState("LITECOIN");
  const [selectedCoinSymbol, setSelectedCoinSymbol] = useState("LTC");
  const db = useIndexedDBContext();
  const [isUsingGateway, setIsUsingGateway] = useState(true)

  const [isSocketUp, setIsSocketUp] = useState<boolean>(false);
  // const [onGoingTrades, setOngoingTrades] = useState([])
  const {onGoingTrades, fetchOngoingTransactions, updateTransactionInDB, deleteTemporarySellOrder, updateTemporaryFailedTradeBots, fetchTemporarySellOrders, sellOrders} = useGetOngoingTransactions({qortAddress: userInfo?.address})
  const [userNameAvatar, setUserNameAvatar] = useState<
    Record<string, UserNameAvatar>
  >({});
  const [avatar, setAvatar] = useState<string>("");
  const [notification, setNotification] = useState<NotificationProps>({
    alertType: "",
    msg: "",
  });
  const [loadingSlider, setLoadingSlider] = useState<boolean>(false);

  const loadingContextValue = {
    loadingSlider,
    setLoadingSlider,
  };

  const getIsUsingGateway = async ()=> {
    try {
      const res = await qortalRequest({
        action: "IS_USING_GATEWAY"
      })
      setIsUsingGateway(res.isGateway)
    } catch (error) {
      
    }
  }


  useEffect(()=> {
   getIsUsingGateway()
  }, [])

  const resetNotification = () => {
    setNotification({ alertType: "", msg: "" });
  };

  
  const userContextValue: UserContextProps = {
    avatar,
    setAvatar,
  };

  const notificationContextValue = {
    notification,
    setNotification,
    resetNotification,
  };

  async function getNameInfo(address: string) {
    const response = await qortalRequest({
      action: "GET_ACCOUNT_NAMES",
      address: address,
    });
    const nameData = response;

    if (nameData?.length > 0) {
      return nameData[0].name;
    } else {
      return "";
    }
  }

  const askForAccountInformation = React.useCallback(async () => {
    try {
      const account = await qortalRequest({
        action: "GET_USER_ACCOUNT",
      });

      const name = await getNameInfo(account.address);
      setUserInfo({ ...account, name });
    } catch (error) {
      console.error(error);
    }
  }, []);

  React.useEffect(() => {
    askForAccountInformation();
  }, [askForAccountInformation]);




  

 


  const getQortBalance = async ()=> {
    const balanceUrl: string = `/addresses/balance/${userInfo?.address}`;
    const balanceResponse = await axios(balanceUrl);
    setQortBalance(balanceResponse.data?.value)
  }

  const getCoinBalance = async (coin: string) => {
    try {
      const response = await qortalRequest({
        action: "GET_WALLET_BALANCE",
        coin: coin
      });
      if(!response?.error){
        setCoinBalances((prevBalances) => ({ ...prevBalances, [coin]: +response }))
      }
    } catch (error) {
   //
    }
  }

  useEffect(() => {
    if(!userInfo?.address) return
    const intervalGetTradeInfo = setInterval(() => {
      fetchOngoingTransactions()
      getCoinBalance(selectedCoinSymbol)
      getQortBalance()
    }, 150000)
    getCoinBalance(selectedCoinSymbol)
    getQortBalance()
    return () => {
      clearInterval(intervalGetTradeInfo)
    }
  }, [userInfo?.address, isAuthenticated, selectedCoinSymbol])


  const handleMessage = async (event: any) => {
    if (event.data.type === "LOGOUT") {
      console.log("Logged out from extension");
      setUserInfo(null);
      setAvatar("");
      setIsAuthenticated(false);
      setQortBalance(null)
      setCoinBalances(null)
      localStorage.setItem("token", "");
    } else if(event.data.type === "RESPONSE_FOR_TRADES"){
    

      const response = event.data.payload
      if (response?.extra?.atAddresses
        ) {
        try {
          const status = response.callResponse === true ? 'trade-ongoing' : 'trade-failed'
          const token = localStorage.getItem("token");
           // Prepare transaction data
    const transactionData = {
      qortalAtAddresses: response.extra.atAddresses,
      qortAddress: userInfo.address,
      status: status,
      message: response.extra.message,
    };

    // Update transactions in IndexedDB
    const result = await updateTransactionInDB(transactionData);
          fetchOngoingTransactions()
          executeEvent("execute-get-new-block-trades", {})
        } catch (error) {
          console.log({error})
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [userInfo?.address]);

  const gameContextValue: IContextProps = {
    userInfo,
    setUserInfo,
    userNameAvatar,
    setUserNameAvatar,
    onGoingTrades,
    fetchOngoingTransactions,
    coinBalances,
    qortBalance,
    selectedCoin,
    setSelectedCoin,
    selectedCoinSymbol,
    setSelectedCoinSymbol,
    isAuthenticated, 
    setIsAuthenticated,
    OAuthLoading, 
    setOAuthLoading,
    updateTransactionInDB,
    sellOrders,
    deleteTemporarySellOrder, updateTemporaryFailedTradeBots, fetchTemporarySellOrders, isUsingGateway
  };

  
  return (
    <NotificationContext.Provider value={notificationContextValue}>
      <LoadingContext.Provider value={loadingContextValue}>
        <UserContext.Provider value={userContextValue}>
          <GameContext.Provider value={gameContextValue}>
            <Notification />
            <ThemeProvider theme={darkTheme}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <HomePage
                    />
                  }
                />
              </Routes>
            </ThemeProvider>
          </GameContext.Provider>
        </UserContext.Provider>
      </LoadingContext.Provider>
    </NotificationContext.Provider>
  );
}

export default App;
