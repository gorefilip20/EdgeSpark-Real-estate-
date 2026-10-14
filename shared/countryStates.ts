export const COUNTRY_STATES: Record<string, string[]> = {
  ES: ["Andalusia", "Aragon", "Asturias", "Balearic Islands", "Basque Country", "Canary Islands", "Cantabria", "Castile and León", "Castilla-La Mancha", "Catalonia", "Extremadura", "Galicia", "La Rioja", "Community of Madrid", "Region of Murcia", "Navarre", "Valencian Community", "Ceuta", "Melilla"],
  PT: ["Aveiro", "Beja", "Braga", "Bragança", "Castelo Branco", "Coimbra", "Évora", "Faro", "Guarda", "Leiria", "Lisbon", "Portalegre", "Porto", "Santarém", "Setúbal", "Viana do Castelo", "Vila Real", "Viseu", "Madeira", "Azores"],
  AE: ["Abu Dhabi", "Ajman", "Dubai", "Fujairah", "Ras Al Khaimah", "Sharjah", "Umm Al Quwain"],
  NG: ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "Federal Capital Territory"],
  US: ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Florida", "Georgia", "Illinois", "Massachusetts", "Maryland", "Michigan", "New Jersey", "New York", "North Carolina", "Ohio", "Pennsylvania", "Texas", "Virginia", "Washington", "Washington, D.C."],
  CA: ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Nova Scotia", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan"],
  GB: ["East Midlands", "East of England", "London", "North East England", "North West England", "South East England", "South West England", "West Midlands", "Yorkshire and the Humber", "Scotland", "Wales", "Northern Ireland"],
  FR: ["Auvergne-Rhône-Alpes", "Bourgogne-Franche-Comté", "Brittany", "Corsica", "Grand Est", "Hauts-de-France", "Île-de-France", "Normandy", "Nouvelle-Aquitaine", "Occitanie", "Pays de la Loire", "Provence-Alpes-Côte d'Azur"],
  DE: ["Bavaria", "Berlin", "Brandenburg", "Hesse", "Lower Saxony", "North Rhine-Westphalia", "Rhineland-Palatinate", "Saxony", "Saxony-Anhalt", "Schleswig-Holstein", "Thuringia"],
  IT: ["Abruzzo", "Apulia", "Basilicata", "Calabria", "Campania", "Emilia-Romagna", "Lazio", "Liguria", "Lombardy", "Piedmont", "Sardinia", "Sicily", "Tuscany", "Umbria", "Veneto"],
  ZA: ["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"],
  IN: ["Delhi", "Goa", "Gujarat", "Karnataka", "Kerala", "Maharashtra", "New Delhi", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal"],
  AU: ["Australian Capital Territory", "New South Wales", "Northern Territory", "Queensland", "South Australia", "Tasmania", "Victoria", "Western Australia"],
};

export function getCountryStates(countryCode: string) {
  return COUNTRY_STATES[countryCode.toUpperCase()] || [];
}
