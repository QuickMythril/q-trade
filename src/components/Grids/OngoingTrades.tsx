import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, SizeColumnsToContentStrategy } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import gameContext from '../../contexts/gameContext';

const autoSizeStrategy: SizeColumnsToContentStrategy = {
    type: 'fitCellContents'
};

export const OngoingTrades = () => {
    const { onGoingTrades, selectedCoinSymbol } = useContext(gameContext);


    const defaultColDef = {
        resizable: true, // Make columns resizable by default
        sortable: true, // Make columns sortable by default
        suppressMovable: true, // Prevent columns from being movable
      };

    const columnDefs: ColDef[] = [
        {
            headerName: "Status", valueGetter: (params) => {
                if (params.data.tradeInfo.mode !== 'OFFERING') {
                    if (params.data.tradeInfo.mode === 'TRADING') return 'Trading'
                    if (params.data.tradeInfo.mode === 'REDEEMED') return 'Completed'
                    return params.data.tradeInfo.mode.toLowerCase()
                }
                if (params.data.status === 'message-sent') return 'Requested'
                if (params.data.status === 'trade-ongoing') return 'Submitted'
                if (params.data.status === 'trade-failed') return 'Failed'
                return params.data.status
            },
            resizable: true ,
            flex: 1, minWidth: 100
        },
        { headerName: "Amount (QORT)", valueGetter: (params) => +params.data.tradeInfo.qortAmount, resizable: true, flex: 1, minWidth: 100  },
        { headerName: `${selectedCoinSymbol}/QORT`, valueGetter: (params) => +params.data.tradeInfo.expectedForeignAmount / +params.data.tradeInfo.qortAmount , resizable: true , flex: 1, minWidth: 100},
        { headerName: `Total ${selectedCoinSymbol} Value`, valueGetter: (params) => +params.data.tradeInfo.expectedForeignAmount, resizable: true , flex: 1, minWidth: 100 },
        {
            headerName: "Notes",  valueGetter: (params) => {
                if (params.data.tradeInfo.mode === 'TRADING') {
                    return 'The order is in the process of exchanging hands. This does not necessary mean it was purchased by your account. Wait until the process is completed.'
                }
                if (params.data.tradeInfo.mode === 'REDEEMED') {
                    return "You have successfully purchased this order. Please wait for the QORT balance to be updated"
                }
                if (params.data.status === 'message-sent') {
                    return 'Buy request was sent, waiting for trade confirmation.'
                }
                if (params?.data?.message?.toLowerCase() === 'invalid search criteria') {
                    return 'Order(s) already taken';
                  }
                  
                if (params.data.message) return params.data.message
            }, resizable: true, flex: 1, minWidth: 100
        }
    ];

    // const getRowStyle = (params: any) => {
    //     if (params.data.qortalAtAddress === selectedOffer?.qortalAtAddress) {
    //       return { background: 'lightblue' };
    //     }
    //     return null;
    //   };
    const getRowId = useCallback(function (params: any) {
        return String(params.data._id);
    }, []);

    return (
        <div className="ag-theme-alpine-dark" style={{ height: 225, width: '100%' }}>
            <AgGridReact
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                rowData={onGoingTrades}
                // onRowClicked={onRowClicked}
                rowSelection="single"
                getRowId={getRowId}
                autoSizeStrategy={autoSizeStrategy}
                suppressHorizontalScroll={false} // Allow horizontal scroll on mobile if needed
                suppressCellFocus={true} // Prevents cells from stealing focus in mobile
                // pagination={true}
        // paginationPageSize={10}
        // domLayout='autoHeight'

            // getRowStyle={getRowStyle}

            />
        </div>
    );
}
