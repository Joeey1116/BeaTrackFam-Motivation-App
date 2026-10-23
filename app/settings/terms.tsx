import { LegalDoc } from '../../components/LegalDoc';
import { TERMS_SECTIONS, TERMS_UPDATED } from '../../lib/legal';
import { useStrings } from '../../lib/i18n';

/** Terms of Service — rendered in-app from lib/legal.ts (BeaTrackFam's own terms, from beatrackfam.info/policies/terms-of-service). The document body stays in English (governing legal text); the title follows the app language. */
export default function TermsScreen() {
  const { t } = useStrings();
  return (
    <LegalDoc title={t('settings.termsOfService')} updated={TERMS_UPDATED} sections={TERMS_SECTIONS} />
  );
}
