import { LegalDoc } from '../../components/LegalDoc';
import { PRIVACY_SECTIONS, PRIVACY_TITLE, PRIVACY_UPDATED } from '../../lib/legal';

/** Privacy Policy — rendered in-app from lib/legal.ts. */
export default function PrivacyScreen() {
  return (
    <LegalDoc title={PRIVACY_TITLE} updated={PRIVACY_UPDATED} sections={PRIVACY_SECTIONS} />
  );
}
