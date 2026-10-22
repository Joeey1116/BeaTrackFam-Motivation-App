import { LegalDoc } from '../../components/LegalDoc';
import { TERMS_SECTIONS, TERMS_TITLE, TERMS_UPDATED } from '../../lib/legal';

/** Terms of Service — rendered in-app from lib/legal.ts (BeaTrackFam's own terms, from beatrackfam.info/policies/terms-of-service). */
export default function TermsScreen() {
  return (
    <LegalDoc title={TERMS_TITLE} updated={TERMS_UPDATED} sections={TERMS_SECTIONS} />
  );
}
