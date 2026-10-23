import { LegalDoc } from '../../components/LegalDoc';
import { PRIVACY_SECTIONS } from '../../lib/legal';
import { useStrings } from '../../lib/i18n';

/**
 * Privacy Policy — rendered in-app from lib/legal.ts.
 * The document body stays in English (it is the governing legal text);
 * the title and chrome follow the app language.
 */
export default function PrivacyScreen() {
  const { t } = useStrings();
  return (
    <LegalDoc title={t('settings.privacyPolicy')} updated={t('legal.privacyUpdated')} sections={PRIVACY_SECTIONS} />
  );
}
