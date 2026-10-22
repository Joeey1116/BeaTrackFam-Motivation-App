import { LegalDoc } from '../../components/LegalDoc';
import { TERMS_SECTIONS, TERMS_TITLE, TERMS_UPDATED } from '../../lib/legal';

/** Terms of Service — rendered in-app from lib/legal.ts (Apple Standard EULA). */
export default function TermsScreen() {
  return (
    <LegalDoc title={TERMS_TITLE} updated={TERMS_UPDATED} sections={TERMS_SECTIONS} />
  );
}
