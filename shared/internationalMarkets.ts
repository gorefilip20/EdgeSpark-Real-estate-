export type InternationalRegion = "Europe" | "Asia" | "Americas";

export type InternationalMarket = {
  code: string;
  name: string;
  region: InternationalRegion;
};

export const INTERNATIONAL_MARKETS: InternationalMarket[] = [
  ...[
    ["AL", "Albania"], ["AD", "Andorra"], ["AT", "Austria"], ["BY", "Belarus"], ["BE", "Belgium"], ["BA", "Bosnia and Herzegovina"], ["BG", "Bulgaria"], ["HR", "Croatia"], ["CY", "Cyprus"], ["CZ", "Czechia"], ["DK", "Denmark"], ["EE", "Estonia"], ["FI", "Finland"], ["FR", "France"], ["DE", "Germany"], ["GR", "Greece"], ["HU", "Hungary"], ["IS", "Iceland"], ["IE", "Ireland"], ["IT", "Italy"], ["XK", "Kosovo"], ["LV", "Latvia"], ["LI", "Liechtenstein"], ["LT", "Lithuania"], ["LU", "Luxembourg"], ["MT", "Malta"], ["MD", "Moldova"], ["MC", "Monaco"], ["ME", "Montenegro"], ["NL", "Netherlands"], ["MK", "North Macedonia"], ["NO", "Norway"], ["PL", "Poland"], ["PT", "Portugal"], ["RO", "Romania"], ["RU", "Russia"], ["SM", "San Marino"], ["RS", "Serbia"], ["SK", "Slovakia"], ["SI", "Slovenia"], ["ES", "Spain"], ["SE", "Sweden"], ["CH", "Switzerland"], ["TR", "Türkiye"], ["UA", "Ukraine"], ["GB", "United Kingdom"], ["VA", "Vatican City"],
  ].map(([code, name]) => ({ code, name, region: "Europe" as const })),
  ...[
    ["AF", "Afghanistan"], ["AM", "Armenia"], ["AZ", "Azerbaijan"], ["BH", "Bahrain"], ["BD", "Bangladesh"], ["BT", "Bhutan"], ["BN", "Brunei"], ["KH", "Cambodia"], ["CN", "China"], ["GE", "Georgia"], ["HK", "Hong Kong"], ["IN", "India"], ["ID", "Indonesia"], ["IR", "Iran"], ["IQ", "Iraq"], ["IL", "Israel"], ["JP", "Japan"], ["JO", "Jordan"], ["KZ", "Kazakhstan"], ["KW", "Kuwait"], ["KG", "Kyrgyzstan"], ["LA", "Laos"], ["LB", "Lebanon"], ["MO", "Macao"], ["MY", "Malaysia"], ["MV", "Maldives"], ["MN", "Mongolia"], ["MM", "Myanmar"], ["NP", "Nepal"], ["OM", "Oman"], ["PK", "Pakistan"], ["PS", "Palestine"], ["PH", "Philippines"], ["QA", "Qatar"], ["SA", "Saudi Arabia"], ["SG", "Singapore"], ["KR", "South Korea"], ["LK", "Sri Lanka"], ["SY", "Syria"], ["TW", "Taiwan"], ["TJ", "Tajikistan"], ["TH", "Thailand"], ["TL", "Timor-Leste"], ["TM", "Turkmenistan"], ["AE", "United Arab Emirates"], ["UZ", "Uzbekistan"], ["VN", "Vietnam"], ["YE", "Yemen"],
  ].map(([code, name]) => ({ code, name, region: "Asia" as const })),
  ...[
    ["AG", "Antigua and Barbuda"], ["AR", "Argentina"], ["BS", "Bahamas"], ["BB", "Barbados"], ["BZ", "Belize"], ["BO", "Bolivia"], ["BR", "Brazil"], ["CA", "Canada"], ["CL", "Chile"], ["CO", "Colombia"], ["CR", "Costa Rica"], ["CU", "Cuba"], ["DM", "Dominica"], ["DO", "Dominican Republic"], ["EC", "Ecuador"], ["SV", "El Salvador"], ["GD", "Grenada"], ["GT", "Guatemala"], ["GY", "Guyana"], ["HT", "Haiti"], ["HN", "Honduras"], ["JM", "Jamaica"], ["MX", "Mexico"], ["NI", "Nicaragua"], ["PA", "Panama"], ["PY", "Paraguay"], ["PE", "Peru"], ["KN", "Saint Kitts and Nevis"], ["LC", "Saint Lucia"], ["VC", "Saint Vincent and the Grenadines"], ["SR", "Suriname"], ["TT", "Trinidad and Tobago"], ["US", "United States"], ["UY", "Uruguay"], ["VE", "Venezuela"],
  ].map(([code, name]) => ({ code, name, region: "Americas" as const })),
];

export const INTERNATIONAL_MARKET_CODES = new Set(INTERNATIONAL_MARKETS.map(market => market.code));
export const getInternationalMarket = (code: string) => INTERNATIONAL_MARKETS.find(market => market.code === code);
