import * as React from 'react';
import { LogoHeader, View, Spacer } from '../../components';
import { Button } from 'semantic-ui-react';

export interface Props {
  handlePrivateKeyRestore: () => void;
  handleMnemonicsPhraseRestore: () => void;
  handleBack: () => void;
}

export const AccountsRestoreView: React.SFC<Props> = (props) => (
  <View orientation="column" fluid={true}>
    <View orientation="column" className="part gradient">
      <LogoHeader showLogout={false} showAccounts={false} title="Accounts" />
      <View content={true} className="spread-around">
        <View>Restore an existing account.</View>
      </View>
    </View>
    <div style={{ height: "100%", display: "flex", alignItems: "center" }}>
      <View orientation="column" className="buttons-container">
        <Button size="small" onClick={props.handlePrivateKeyRestore}>Use private key</Button>
        <Spacer />
        <Button size="small" onClick={props.handleMnemonicsPhraseRestore}>Use mnemonics phrase</Button>
        <Spacer />
        <Button size="small" onClick={props.handleBack}>Back</Button>
      </View>
    </div>
  </View>
);
