/*
 * Copyright (C) 2018 Matus Zamborsky
 * This file is part of The Ontology Wallet&ID.
 *
 * The The Ontology Wallet&ID is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The Ontology Wallet&ID is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with The Ontology Wallet&ID.  If not, see <http://www.gnu.org/licenses/>.
 */
import * as React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { getAddress } from '../api/authApi';
import { getTransferList } from '../api/explorerApi';
import { getBalance } from '../api/walletApi';
import { lifecycle, reduxConnect, withState } from '../compose';
import { GlobalState } from '../redux';
import { setBalance, setTransfers } from '../redux/wallet/walletActions';

interface State {
  timer: number;
}

const mapStateToProps = (state: GlobalState) => ({
  wallet: state.auth.wallet
});

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({ setBalance, setTransfers }, dispatch);

const enhancer = (Component: React.ComponentType<{}>) => () => (
  reduxConnect(mapStateToProps, mapDispatchToProps, (reduxProps, actions, getReduxProps) => (
    withState<State>({ timer: -1 }, (state, setState, getState) => (
      lifecycle({
        componentDidMount: () => {
          const timer = window.setInterval(async () => {
            
            const walletEncoded = getReduxProps().wallet;
            if (walletEncoded !== null) {
              const balance = await getBalance(walletEncoded);
              actions.setBalance(balance.ong / 1000000000, balance.ont);

              const address = getAddress(walletEncoded);
              const transfers = await getTransferList(address);
              actions.setTransfers(transfers);
            }
          }, 5000);

          setState({ ...state, timer });
        },

        componentWillUnmount: () => {
          window.clearInterval(getState().timer);
        }
      }, () => (
        <Component />
      ))
    ))
  ))
);

export const WalletChecker = enhancer(() => null);
