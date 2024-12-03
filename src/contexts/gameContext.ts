import React from "react";
import { NULL } from "sass";


export interface User {
  _id: string;
  qortAddress: string;
}


export interface UserNameAvatar {
  name: string;
  avatar: string;
}

export interface IContextProps {
  coinBalances: { [key: string]: number | null };
  qortBalance: number | null;
  userInfo: any;
  setUserInfo: (val: any) => void;
  userNameAvatar: Record<string, UserNameAvatar>;
  setUserNameAvatar: (userNameAvatar: Record<string, UserNameAvatar>) => void;
  onGoingTrades: any[];
  fetchOngoingTransactions: ()=> void
  isAuthenticated: boolean;
  setIsAuthenticated: (val: any)=> void;
  OAuthLoading: boolean;
  setOAuthLoading: (val: boolean)=> void;
  updateTransactionInDB:(val: any)=> void;
  sellOrders: any[];
  deleteTemporarySellOrder: (val: any)=> void;
   updateTemporaryFailedTradeBots: (val: any)=> void;
   fetchTemporarySellOrders: ()=> void;
   isUsingGateway: boolean;
   selectedCoin: string;
   setSelectedCoin: (val: string) => void;
   selectedCoinSymbol: string;
   setSelectedCoinSymbol: (val: string) => void;
}

const defaultState: IContextProps = {
  qortBalance: null,
  coinBalances: {},
  userInfo: null,
  setUserInfo: () => {},
  userNameAvatar: {},
  setUserNameAvatar: () => {},
  onGoingTrades: [],
  fetchOngoingTransactions: ()=> {},
  isAuthenticated: false,
  setIsAuthenticated: ()=> {},
  OAuthLoading: false,
  setOAuthLoading: ()=> {},
  updateTransactionInDB:()=> {},
  sellOrders: [],
  deleteTemporarySellOrder: ()=> {},
   updateTemporaryFailedTradeBots: ()=> {},
   fetchTemporarySellOrders: ()=> {},
   isUsingGateway: true,
   selectedCoin: "LITECOIN",
   setSelectedCoin: () => {},
   selectedCoinSymbol: "LTC",
   setSelectedCoinSymbol: () => {},
};

export default React.createContext(defaultState);
