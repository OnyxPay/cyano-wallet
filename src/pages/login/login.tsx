
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
import { FormApi } from 'final-form';
import { get } from 'lodash';
import * as React from 'react';
import { RouterProps } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';
import { signIn } from '../../api/authApi';
import { reduxConnect, withProps } from '../../compose';
import { GlobalState } from '../../redux';
import { setWallet } from '../../redux/auth/authActions';
import { finishLoading, startLoading } from '../../redux/loader/loaderActions';
import { LoginView, Props } from './loginView';

const mapStateToProps = (state: GlobalState) => ({
  loading: state.loader.loading
});

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({ setWallet, startLoading, finishLoading }, dispatch);

const enhancer = (Component: React.ComponentType<Props>) => (props: RouterProps) => (
  reduxConnect(mapStateToProps, mapDispatchToProps, (reduxProps, actions) => (
    withProps({
      handleClear: () => {
        props.history.push('/clear');
      },
      handleSubmit: async (values: object, formApi: FormApi) => {
        const password = get(values, 'password', '');
  
        actions.startLoading();

        try {
          const wallet = await signIn(password);
          actions.setWallet(wallet);
    
          props.history.push('/dashboard');
          return {};

        } catch (e) {
          formApi.change('password', '');
          return {
            password: ''
          };
        } finally {
          actions.finishLoading();
        }
      }
    }, (injectedProps) => (
      <Component {...injectedProps} loading={reduxProps.loading} />
    ))
  ))
)

export const Login = enhancer(LoginView);
