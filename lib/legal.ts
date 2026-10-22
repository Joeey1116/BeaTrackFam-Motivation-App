/**
 * Legal documents, rendered IN-APP (Settings → Privacy Policy / Terms of
 * Service) so reading them never kicks the user out to a browser.
 *
 * Privacy Policy: the app's own published policy, reproduced from
 * https://beatrackfam.info/pages/hustle-heart-motivation-app-privacy-policy
 * (last updated October 11, 2026).
 *
 * Terms of Service: BeaTrackFam's actual Terms of Service, reproduced in
 * full from https://beatrackfam.info/policies/terms-of-service — the live
 * Shopify policy page. (The old /pages/terms-of-service URL the app once
 * linked to returns 404; the real policy lives under /policies/.)
 */

export interface LegalSection {
  heading?: string;
  body: string;
}

export const PRIVACY_TITLE = 'Privacy Policy';
export const PRIVACY_UPDATED = 'Last updated: October 11, 2026';

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    body: 'This Privacy Policy covers the Hustle & Heart Motivation mobile app (the "App").',
  },
  {
    heading: 'The short version',
    body: 'The App does not collect, transmit, or share your personal information. Everything you do in the App stays on your device.',
  },
  {
    heading: 'Information we collect',
    body: 'We do not collect any personal information. The App has no accounts, no sign-in, and no servers. The following is stored only on your device and is never sent to us or anyone else:\n\n• Your selected motivation topics and app preferences (including language)\n• Your favorite quotes and daily streak\n• Your gratitude journal entries\n• Your notification preferences',
  },
  {
    heading: 'Notifications',
    body: "If you allow notifications, the App schedules motivational reminders locally on your device. No notification data ever leaves your device. You can turn notifications off at any time in the App's settings or in your device settings.",
  },
  {
    heading: 'What we do not do',
    body: '• We do not collect advertising identifiers.\n• We do not use analytics or tracking tools.\n• We do not share or sell any data — there is nothing to share, because nothing leaves your device.\n• We do not collect your precise location, contacts, photos, or files.',
  },
  {
    heading: "Children's privacy",
    body: 'The App is not directed at children under 13, and we do not knowingly collect personal information from children under 13.',
  },
  {
    heading: 'Deleting your data',
    body: "Because all of your data lives only on your device, you can delete everything at any time by uninstalling the App or clearing the App's data in your device settings.",
  },
  {
    heading: 'Changes to this policy',
    body: 'If we change this policy, we will post the updated version on this page and revise the date above.',
  },
  {
    heading: 'Contact us',
    body: 'Questions or concerns? Email us at contact@beatrackfam.info.',
  },
];

export const TERMS_TITLE = 'Terms of Service';
export const TERMS_UPDATED = 'BeaTrackFam — beatrackfam.info/policies/terms-of-service';

export const TERMS_SECTIONS: LegalSection[] = [
  {
    heading: 'OVERVIEW',
    body: `Welcome to BeaTrackFam! The terms "we", "us" and "our" refer to BeaTrackFam. BeaTrackFam operates this store and website, including all related information, content, features, tools, products and services in order to provide you, the customer, with a curated shopping experience (the "Services"). BeaTrackFam is powered by Shopify, which enables us to provide the Services to you.

The below terms and conditions, together with any policies referenced herein (these "Terms of Service" or "Terms") describe your rights and responsibilities when you use the Services.

Please read these Terms of Service carefully, as they include important information about your legal rights and cover areas such as warranty disclaimers and limitations of liability.

By visiting, interacting with or using our Services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these Terms of Service or Privacy Policy, you should not use or access our Services.`,
  },
  {
    heading: 'SECTION 1 - ACCESS AND ACCOUNT',
    body: `By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, and you have given us your consent to allow any of your minor dependents to use the Services on devices you own, purchase or manage.

To use the Services, including accessing or browsing our online stores or purchasing any of the products or services we offer, you may be asked to provide certain information, such as your email address, billing, payment, and shipping information. You represent and warrant that all the information you provide in our stores is correct, current and complete and that you have all rights necessary to provide this information.

You are solely responsible for maintaining the security of your account credentials and for all of your account activity. You may not transfer, sell, assign, or license your account to any other person.`,
  },
  {
    heading: 'SECTION 2 - OUR PRODUCTS',
    body: `We have made every effort to provide an accurate representation of our products and services in our online stores. However, please note that colors or product appearance may differ from how they may appear on your screen due to the type of device you use to access the store and your device settings and configuration.

We do not warrant that the appearance or quality of any products or services purchased by you will meet your expectations or be the same as depicted or rendered in our online stores.

All descriptions of products are subject to change at any time without notice at our sole discretion. We reserve the right to discontinue any product at any time and may limit the quantities of any products that we offer to any person, geographic region or jurisdiction, on a case-by-case basis.`,
  },
  {
    heading: 'SECTION 3 - ORDERS',
    body: `When you place an order, you are making an offer to purchase. My Store reserves the right to accept or decline your order for any reason at its discretion. Your order is not accepted until My Store confirms acceptance. We must receive and process your payment before your order is accepted. Please review your order carefully before submitting, as BeaTrackFam may be unable to accommodate cancellation requests after an order is accepted. In the event that we do not accept, make a change to, or cancel an order, we will attempt to notify you by contacting the e-mail, billing address, and/or phone number provided at the time the order was made.

Your purchases are subject to return or exchange solely in accordance with our Refund Policy.

You represent and warrant that your purchases are for your own personal or household use and not for commercial resale or export.`,
  },
  {
    heading: 'SECTION 4 - PRICES AND BILLING',
    body: `Prices, discounts and promotions are subject to change without notice. The price charged for a product or service will be the price in effect at the time the order is placed and will be set out in your order confirmation email. Unless otherwise expressly stated, posted prices do not include taxes, shipping, handling, customs or import charges.

Prices posted in our online stores may be different from prices offered in physical stores or in online or other stores operated by third parties. We may offer, from time to time, promotions on the Services that may affect pricing and that are governed by terms and conditions separate from these Terms. If there is a conflict between the terms for a promotion and these Terms, the promotion terms will govern.

You agree to provide current, complete and accurate purchase, payment and account information for all purchases made at our stores. You agree to promptly update your account and other information, including your email address, credit card numbers and expiration dates, so that we can complete your transactions and contact you as needed.

You represent and warrant that (i) the credit card information you provide is true, correct, and complete, (ii) you are duly authorized to use such credit card for the purchase, (iii) charges incurred by you will be honored by your credit card company, and (iv) you will pay charges incurred by you at the posted prices, including shipping and handling charges and all applicable taxes, if any.`,
  },
  {
    heading: 'SECTION 5 - SHIPPING AND DELIVERY',
    body: `We are not liable for shipping and delivery delays. All delivery times are estimates only and are not guaranteed. We are not responsible for delays caused by shipping carriers, customs processing, or events outside our control. Once we transfer products to the carrier, title and risk of loss passes to you.`,
  },
  {
    heading: 'SECTION 6 - INTELLECTUAL PROPERTY',
    body: `Our Services, including but not limited to all trademarks, brands, text, displays, images, graphics, product reviews, video, and audio, and the design, selection, and arrangement thereof, are owned by BeaTrackFam, its affiliates or licensors and are protected by U.S. and foreign patent, copyright and other intellectual property laws.

These Terms permit you to use the Services for your personal, non-commercial use only. You must not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on the Services without our prior written consent. Except as expressly provided herein, nothing in these Terms grants or shall be construed as granting a license or other rights to you under any patent, trademark, copyright, or other intellectual property of BeaTrackFam, Shopify or any third party. Unauthorized use of the Services may be a violation of federal and state intellectual property laws. All rights not expressly granted herein are reserved by My Store.

BeaTrackFam's names, logos, product and service names, designs, and slogans are trademarks of BeaTrackFam or its affiliates or licensors. You must not use such trademarks without the prior written permission of BeaTrackFam. Shopify's name, logo, product and service names, designs and slogans are trademarks of Shopify. All other names, logos, product and service names, designs, and slogans on the Services are the trademarks of their respective owners.`,
  },
  {
    heading: 'SECTION 7 - OPTIONAL TOOLS',
    body: `You may be provided with access to customer tools offered by third parties as part of the Services, which we neither monitor nor have any control nor input.

You acknowledge and agree that we provide access to such tools "as is" and "as available" without any warranties, representations or conditions of any kind and without any endorsement. We shall have no liability whatsoever arising from or relating to your use of optional third-party tools.

Any use by you of the optional tools offered through the site is entirely at your own risk and discretion and you should ensure that you are familiar with and approve of the terms on which tools are provided by the relevant third-party provider(s).

We may also, in the future, offer new features through the Services (including the release of new tools and resources). Such new features shall also be deemed part of the Services and are subject to these Terms of Service.`,
  },
  {
    heading: 'SECTION 8 - THIRD-PARTY LINKS',
    body: `The Services may contain materials and hyperlinks to websites provided or operated by third parties (including any embedded third party functionality). We are not responsible for examining or evaluating the content or accuracy of any third-party materials or websites you choose to access. If you decide to leave the Services to access these materials or third party sites, you do so at your own risk.

We are not liable for any harm or damages related to your access of any third-party websites, or your purchase or use of any products, services, resources, or content on any third-party websites. Please review carefully the third-party's policies and practices and make sure you understand them before you engage in any transaction. Complaints, claims, concerns, or questions regarding third-party products and services should be directed to the third-party.`,
  },
  {
    heading: 'SECTION 9 - RELATIONSHIP WITH SHOPIFY',
    body: `BeaTrackFam is powered by Shopify, which enables us to provide the Services to you. However, any sales and purchases you make in our Store are made directly with BeaTrackFam. By using the Services, you acknowledge and agree that Shopify is not responsible for any aspect of any sales between you and BeaTrackFam, including any injury, damage, or loss resulting from purchased products and services. You hereby expressly release Shopify and its affiliates from all claims, damages, and liabilities arising from or related to your purchases and transactions with BeaTrackFam.`,
  },
  {
    heading: 'SECTION 10 - PRIVACY POLICY',
    body: `All personal information we collect through the Services is subject to our Privacy Policy, which can be viewed here, and certain personal information may be subject to Shopify's Privacy Policy, which can be viewed here. By using the Services, you acknowledge that you have read these privacy policies.

Because the Services are hosted by Shopify, Shopify collects and processes personal information about your access to and use of the Services in order to provide and improve the Services for you. Information you submit to the Services will be transmitted to and shared with Shopify as well as third parties that may be located in other countries than where you reside, in order to provide services to you. Review our privacy policy for more details on how we, Shopify, and our partners use your personal information.`,
  },
  {
    heading: 'SECTION 11 - FEEDBACK',
    body: `If you submit, upload, post, email, or otherwise transmit any ideas, suggestions, feedback, reviews, proposals, plans, or other content (collectively, "Feedback"), you grant us a perpetual, worldwide, sublicensable, royalty-free license to use, reproduce, modify, publish, distribute and display such Feedback in any medium for any purpose, including for commercial use. We may, for example, use our rights under this license to operate, provide, evaluate, enhance, improve and promote the Services and to perform our obligations and exercise our rights under the Terms of Service.

You also represent and warrant that: (i) you own or have all necessary rights to all Feedback; (ii) you have disclosed any compensation or incentives received in connection with your submission of Feedback; and (iii) your Feedback will comply with these Terms. We are and shall be under no obligation (1) to maintain your Feedback in confidence; (2) to pay compensation for your Feedback; or (3) to respond to your Feedback.

We may, but have no obligation to, monitor, edit or remove Feedback that we determine in our sole discretion to be unlawful, offensive, threatening, libelous, defamatory, pornographic, obscene or otherwise objectionable or violates any party's intellectual property or these Terms of Service.

You agree that your Feedback will not violate any right of any third-party, including copyright, trademark, privacy, personality or other personal or proprietary right. You further agree that your Feedback will not contain libelous or otherwise unlawful, abusive or obscene Feedback, or contain any computer virus or other malware that could in any way affect the operation of the Services or any related website. You may not use a false email address, pretend to be someone other than yourself, or otherwise mislead us or third-parties as to the origin of any Feedback. You are solely responsible for any Feedback you make and its accuracy. We take no responsibility and assume no liability for any Feedback posted by you or any third-party.`,
  },
  {
    heading: 'SECTION 12 - ERRORS, INACCURACIES AND OMISSIONS',
    body: `Occasionally there may be information on or in the Services that contain typographical errors, inaccuracies or omissions that may relate to product descriptions, pricing, promotions, offers, product shipping charges, transit times and availability. We reserve the right to correct any errors, inaccuracies or omissions, and to change or update information or cancel orders if any information is inaccurate at any time without prior notice (including after you have submitted your order).`,
  },
  {
    heading: 'SECTION 13 - PROHIBITED USES',
    body: `You may access and use the Services for lawful purposes only. You may not access or use the Services, directly or indirectly: (a) for any unlawful or malicious purpose; (b) to violate any international, federal, provincial or state regulations, rules, laws, or local ordinances; (c) to infringe upon or violate our intellectual property rights or the intellectual property rights of others; (d) to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or harm any of our employees or any other person; (e) to transmit false or misleading information; (f) to send, knowingly receive, upload, download, use, or re-use any material that does not comply with the these Terms; (g) to transmit, or procure the sending of, any advertising or promotional material, including any "junk mail," "chain letter," "spam," or any other similar solicitation; (h) to impersonate or attempt to impersonate any other person or entity; or (i) to engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Services, or which, as determined by us, may harm BeaTrackFam, Shopify or users of the Services, or expose them to liability.

In addition, you agree not to: (a) upload or transmit viruses or any other type of malicious code that will or may be used in any way that will affect the functionality or operation of the Services; (b) reproduce, duplicate, copy, extract, sell, resell or exploit any portion of the Services; (c) collect or track the personal information of others; (d) spam, phish, pharm, or pretext the services; (e) use any robot, spider, scraping, data gathering and extraction tools, automatic devices or processes, AI tools (such as agentic AI) or automated or manual means to access the Services; or (f) interfere with, bypass, or circumvent the security or authorization features, robot exclusion headers, or other measures we employ to restrict access to the Services.

We reserve the right to suspend, disable, or terminate your account at any time, without notice, if we determine that you have violated any part of these Terms.`,
  },
  {
    heading: 'SECTION 14 - AGENTS',
    body: `14.1 This section ("Agent Terms") applies if you use, allow, enable, or cause the deployment of an Agent to access, use, or interact with any Services. "Agent" means any software or service that takes autonomous or semi-autonomous action on behalf of, or at the instruction of, any person or entity and that can be executed on behalf of or using persons device, without direct supervision.

14.2 No Agent may access, use, or interact with Services unless, at all times, it identifies itself and operates in strict accordance with the requirements in section 14.4 below. In addition, no Agent may access, use, or interact with Services if we have requested that the Agent refrain from accessing, using, or interacting with any service.

14.3 We may limit, including by technical measures, whether and how any Agent accesses, uses, and interacts with Services.

14.4 Agents must: (i) in all HTTP/HTTPS requests, identify that the request is from an Agent and disclose the name of the Agent by including the following in the request's user agent string: "Agent/[agent name]"; (ii) not conceal or obfuscate that any access, use, or interactions are from an Agent, such as by (a) mimicking human behavior and interaction patterns, or (b) completing or circumventing CAPTCHAs or measures intended to distinguish computer use from humans, (iii) respond truthfully to any question or prompt seeking to determine if interactions are coming from a human or a computer, (iv) not circumvent or otherwise avoid any measure intended to block, limit, modify, or control whether and how Agents access, use, or interact with the Services.`,
  },
  {
    heading: 'SECTION 15 - TERMINATION',
    body: `We may terminate this agreement or your access to the Services (or any part thereof) in our sole discretion at any time without notice, and you will remain liable for all amounts due up to and including the date of termination.

The following sections will continue to apply following any termination: Intellectual Property, Feedback, Termination, Disclaimer of Warranties, Limitation of Liability, Indemnification, Severability, Waiver; Entire Agreement, Assignment, Governing Law, Privacy Policy, and any other provisions that by their nature should survive termination.`,
  },
  {
    heading: 'SECTION 16 - DISCLAIMER OF WARRANTIES',
    body: `The information presented on or through the Services is made available solely for general information purposes. We do not warrant the accuracy, completeness, or usefulness of this information. Any reliance you place on such information is strictly at your own risk. We disclaim all liability and responsibility arising from any reliance placed on such materials by you or any other visitor to the Services, or by anyone who may be informed of any of its contents.

EXCEPT AS EXPRESSLY STATED BY BeaTrackFam, THE SERVICES AND ALL PRODUCTS OFFERED THROUGH THE SERVICES ARE PROVIDED 'AS IS' AND 'AS AVAILABLE' FOR YOUR USE, WITHOUT ANY REPRESENTATION, WARRANTIES OR CONDITION OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ALL IMPLIED WARRANTIES OR CONDITIONS OF MERCHANTABILITY, MERCHANTABLE QUALITY, FITNESS FOR A PARTICULAR PURPOSE, DURABILITY, TITLE, AND NON-INFRINGEMENT. WE DO NOT GUARANTEE, REPRESENT OR WARRANT THAT YOUR USE OF THE SERVICES WILL BE UNINTERRUPTED, TIMELY, SECURE OR ERROR-FREE. SOME JURISDICTIONS LIMIT OR DO NOT ALLOW THE DISCLAIMER OF IMPLIED OR OTHER WARRANTIES SO THE ABOVE DISCLAIMER MAY NOT APPLY TO YOU.`,
  },
  {
    heading: 'SECTION 17 - LIMITATION OF LIABILITY',
    body: `TO THE FULLEST EXTENT PROVIDED BY LAW, IN NO CASE SHALL BeaTrackFam, OUR PARTNERS, DIRECTORS, OFFICERS, EMPLOYEES, AFFILIATES, AGENTS, CONTRACTORS, SERVICE PROVIDERS OR LICENSORS, OR THOSE OF SHOPIFY AND ITS AFFILIATES, BE LIABLE FOR ANY INJURY, LOSS, CLAIM, OR ANY DIRECT, INDIRECT, INCIDENTAL, PUNITIVE, SPECIAL, OR CONSEQUENTIAL DAMAGES OF ANY KIND, INCLUDING, WITHOUT LIMITATION, LOST PROFITS, LOST REVENUE, LOST SAVINGS, LOSS OF DATA, REPLACEMENT COSTS, OR ANY SIMILAR DAMAGES, WHETHER BASED IN CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY OR OTHERWISE, ARISING FROM YOUR USE OF ANY OF THE SERVICES OR ANY PRODUCTS PROCURED USING THE SERVICES, OR FOR ANY OTHER CLAIM RELATED IN ANY WAY TO YOUR USE OF THE SERVICES OR ANY PRODUCT, INCLUDING, BUT NOT LIMITED TO, ANY ERRORS OR OMISSIONS IN ANY CONTENT, OR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF THE SERVICES OR ANY CONTENT (OR PRODUCT) POSTED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE SERVICES, EVEN IF ADVISED OF THEIR POSSIBILITY.`,
  },
  {
    heading: 'SECTION 18 - INDEMNIFICATION',
    body: `You agree to indemnify, defend and hold harmless BeaTrackFam, Shopify, and our affiliates, partners, officers, directors, employees, agents, contractors, licensors, and service providers from any losses, damages, liabilities or claims, including reasonable attorneys' fees, payable to any third party due to or arising out of (1) your breach of these Terms of Service or the documents they incorporate by reference, (2) your violation of any law or the rights of a third party, or (3) your access to and use of the Services.

We will notify you of any indemnifiable claim, provided that a failure to promptly notify will not relieve you of your obligations unless you are materially prejudiced. We may control the defense and settlement of such claim at your expense, including choice of counsel, but will not settle any claim requiring non-monetary obligations from you without your consent (not to be unreasonably withheld). You will cooperate in the defense of indemnified claims, including by providing relevant documents.`,
  },
  {
    heading: 'SECTION 19 - SEVERABILITY',
    body: `In the event that any provision of these Terms of Service is determined to be unlawful, void or unenforceable, such provision shall nonetheless be enforceable to the fullest extent permitted by applicable law, and the unenforceable portion shall be deemed to be severed from these Terms of Service, such determination shall not affect the validity and enforceability of any other remaining provisions.`,
  },
  {
    heading: 'SECTION 20 - WAIVER; ENTIRE AGREEMENT',
    body: `The failure of us to exercise or enforce any right or provision of these Terms of Service shall not constitute a waiver of such right or provision.

These Terms of Service and any policies or operating rules posted by us on this site or in respect to the Service constitutes the entire agreement and understanding between you and us and governs your use of the Service, superseding any prior or contemporaneous agreements, communications and proposals, whether oral or written, between you and us (including, but not limited to, any prior versions of the Terms of Service).

Any ambiguities in the interpretation of these Terms of Service shall not be construed against the drafting party.`,
  },
  {
    heading: 'SECTION 21 - ASSIGNMENT',
    body: `You may not delegate, transfer or assign this Agreement or any of your rights or obligations under these Terms without our prior written consent, and any such attempt will be null and void. We may transfer, assign, or delegate these Terms and our rights and obligations without consent or notice to you.`,
  },
  {
    heading: 'SECTION 22 - GOVERNING LAW',
    body: `These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the federal and state or territorial courts in the jurisdiction where BeaTrackFam is headquartered. You and BeaTrackFam consent to venue and personal jurisdiction in such courts.`,
  },
  {
    heading: 'SECTION 23 - HEADINGS',
    body: `The headings used in this agreement are included for convenience only and will not limit or otherwise affect these Terms.`,
  },
  {
    heading: 'SECTION 24 - CHANGES TO TERMS OF SERVICE',
    body: `You can review the most current version of the Terms of Service at any time on this page.

We reserve the right, in our sole discretion, to update, change, or replace any part of these Terms of Service by posting updates and changes to our website. It is your responsibility to check our website periodically for changes. We will notify you of any material changes to these Terms in accordance with applicable law, and such changes will be effective on the date specified in the notice. Your continued use of or access to the Services following the posting of any changes to these Terms of Service constitutes acceptance of those changes.`,
  },
  {
    heading: 'SECTION 25 - CONTACT INFORMATION',
    body: `Questions about the Terms of Service should be sent to us at contact@beatrackfam.info.

Our contact information is posted below:
BeaTrackFam
contact@beatrackfam.info`,
  },
];
