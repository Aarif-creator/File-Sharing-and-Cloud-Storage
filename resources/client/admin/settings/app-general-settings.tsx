import {SettingsPanel} from '@common/admin/settings/layout/settings-panel';
import {Component as CommonGeneralSettings} from '@common/admin/settings/pages/general-settings';
import {useAdminSettings} from '@common/admin/settings/use-admin-settings';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Select} from '@shadcn/forms/select/select';
import {Trans} from '@ui/i18n/trans';

export function Component() {
  const {data} = useAdminSettings();
  return (
    <CommonGeneralSettings
      defaultValues={{client: {homepage: {type: data.client.homepage.type}}}}
    >
      <HomepageSection />
    </CommonGeneralSettings>
  );
}

function HomepageSection() {
  return (
    <SettingsPanel
      title={<Trans message="Homepage" />}
      description={
        <Trans message="Configure which page should be displayed as your site's homepage." />
      }
    >
      <HookForm.Field name="client.homepage.type">
        <Field.Label className="sr-only">
          <Trans message="Site home page" />
        </Field.Label>
        <Select>
          <Select.Trigger className="w-full">
            <Select.Value
              placeholder={<Trans message="Select an option..." />}
            />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="landingPage">
              <Trans message="Landing page" />
            </Select.Item>
            <Select.Item value="loginPage">
              <Trans message="Login page" />
            </Select.Item>
          </Select.Content>
        </Select>
        <Field.Error />
      </HookForm.Field>
    </SettingsPanel>
  );
}
