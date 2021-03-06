import { get } from "lodash";
import * as React from "react";
import { RouterProps } from "react-router";
import { bindActionCreators, Dispatch } from "redux";
import { reduxConnect, withProps, lifecycle, withRouter, withState } from "../../compose";
import { GlobalState } from "../../redux";
import { finishLoading, startLoading } from "../../redux/loader/loaderActions";
import { ClaimOnyxView, Props } from "./claimView";
import { getContractAddress } from "../../api/contractsApi";
import { createSecret } from "../../utils";
import { getUnclaimedBalance } from "../../api/claimApi";
import { isCurrentUserMnemonics } from "../../api/authApi";
import { FormApi, FORM_ERROR } from "final-form";

interface State {
  balance: string | null;
  contract: string | null;
  secret: string;
  firstName: string;
  sureName: string;
  balanceError: string | null;
}

const mapStateToProps = (state: GlobalState) => ({
  loading: state.loader.loading,
  wallet: state.wallet.wallet,
  net: state.settings.net
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators({ startLoading, finishLoading }, dispatch);

const enhancer = (Component: React.ComponentType<Props>) => (props: RouterProps) =>
  withRouter(routerProps =>
    withState<State>(
      { balance: "0", contract: "", secret: "", firstName: "", sureName: "", balanceError: null },
      (state, setState) =>
        lifecycle(
          {
            componentDidMount: async () => {
              const userData: any = get(routerProps.location, "state.userData", "");
              const passwordHash = userData.pass_for_claim;
              const firstName =
                userData.field_afl_first_name && userData.field_afl_first_name.und
                  ? userData.field_afl_first_name.und[0].value
                  : null;
              const sureName =
                userData.field_afl_surname && userData.field_afl_surname.und
                  ? userData.field_afl_surname.und[0].value
                  : null;
              let contract;
              let balance;
              const [secret, secretHash] = createSecret(passwordHash);

              try {
                contract = await getContractAddress("Investments");
              } catch (error) {
                routerProps.history.push("/trx-error", { e: error });
              }

              if (contract) {
                balance = await getUnclaimedBalance(contract, secretHash);

                if (balance === "0") {
                  setState({
                    balance,
                    contract,
                    secret,
                    firstName,
                    sureName,
                    balanceError: "Nothing to claim!"
                  });
                } else if (Number(balance)) {
                  setState({ balance, contract, secret, firstName, sureName, balanceError: null });
                } else {
                  routerProps.history.push("/trx-error", {
                    e:
                      "User is not found in onyxChain! You cannot Claim your investments during one week after creating an account on onyxcoin.io. Try again later..."
                  });
                }
              }
            }
          },
          () => {
            return reduxConnect(mapStateToProps, mapDispatchToProps, (reduxProps, actions) => {
              const currentAddress = get(reduxProps.wallet, "defaultAccountAddress", "");

              return withProps(
                {
                  handleCancel: () => {
                    props.history.push("/");
                  },
                  handleСonfirm: async (values: object, formApi: FormApi) => {
                    const mnemonics = get(values, "mnemonics", "");
                    if (isCurrentUserMnemonics(mnemonics, reduxProps.wallet)) {
                      const { contract, secret } = state;

                      routerProps.history.push("/claim-onyx-confirm", {
                        contract,
                        secret,
                        balance: state.balance
                      });
                      return {};
                    } else {
                      formApi.change("mnemonics", "");
                      return { [FORM_ERROR]: "Mnemonics don't match current account!" };
                    }
                  }
                },
                injectedProps => (
                  <Component
                    {...injectedProps}
                    loading={reduxProps.loading}
                    currentAddress={currentAddress}
                    balance={state.balance}
                    firstName={state.firstName}
                    sureName={state.sureName}
                    balanceError={state.balanceError}
                  />
                )
              );
            });
          }
        )
    )
  );

export const ClaimOnyx = enhancer(ClaimOnyxView);
