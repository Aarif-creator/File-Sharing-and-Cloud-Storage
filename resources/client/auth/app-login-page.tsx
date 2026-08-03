import {DemoLoginPanel} from '@app/auth/demo-login-panel';
import {GuestRoute} from '@common/auth/guards/guest-route';
import {TwoFactorChallengePage} from '@common/auth/ui/account-settings/two-factor/two-factor-challenge-page';
import {LoginPage} from '@common/auth/ui/login-page';
import {useSettings} from '@ui/settings/use-settings';
import {useState} from 'react';

export function Component() {
  const {site} = useSettings();
  const [isTwoFactor, setIsTwoFactor] = useState(false);

  const component = isTwoFactor ? (
    <TwoFactorChallengePage />
  ) : (
    <LoginPage onTwoFactorChallenge={() => setIsTwoFactor(true)}>
      {site?.demo ? <DemoLoginPanel /> : null}
    </LoginPage>
  );

  return <GuestRoute>{component}</GuestRoute>;
}
