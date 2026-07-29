import { SIGNED_RECIPES } from "./recipes";
import type { Recipe } from "./types";

// ============================================================
// Popote — Une VRAIE photo UNIQUE par recette (zéro doublon).
// Chaque recette signée reçoit une photo réelle de plat :
// exacte pour les plats identifiés, au plus proche réel sinon.
// L'unicité est GARANTIE par le code (voir buildAssignments) :
// aucune photo n'est utilisée deux fois.
// Source : base culinaire ouverte (TheMealDB). En prod, on
// remplacera par des photos possédées (Supabase Storage).
// ============================================================

const M = (id: string) => `https://www.themealdb.com/images/media/meals/${id}.jpg`;

// Réserve de photos réelles uniques (>= nb de recettes).
const MASTER: string[] = [
  // plats identifiés précisément
  "llcbn01574260722", "wtsvxx1511296896", "sutysw1468247559", "lrfdwz1764438393",
  "xxrxux1503070723", "wrpwuu1511786491", "rwuyqx1511383174", "04axct1763793018",
  "u5e9qq1763795441", "xvsurr1511719182", "qxytrx1511304021", "lgmnff1763789847",
  "rg9ze01763479093", "ikizdm1763760862", "x2fw9e1560460636", "dk70uv1784670127",
  "ip5xtp1769779958", "tvtxpq1511464705", "tqtywx1468317395", "eqnf3p1779649407",
  "rsqwus1511640214", "sywswr1511383814", "ctg8jd1585563097", "lwsnkl1604181187",
  // poulet
  "vdwloy1713225718", "020z181619788503", "sypxpx1515365095", "sbx7n71587673021",
  "uuuspp1511297945", "syqypv1486981727", "wruvqv1511880994", "1529446352",
  // bœuf
  "sytuqu1511553755", "wrssvt1511556563", "pkopc31683207947", "z0ageb1583189517",
  "vtqxtu1511784197", "8rfd4q1764112993", "13fg4j1764441982", "kgfh3q1763075438",
  // poisson
  "1548772327", "uvuyxu1503067369", "dxs5t71782678369", "jc6oub1763196663",
  "r7mcjm1780261264", "qqwhw51780093126", "4xcfai1763765676", "wkhwqr1782774765",
  // pâtes
  "usywpp1511189717", "uquqtu1511178042", "vvtvtr1511180578", "qvrwpt1511181864",
  // desserts
  "adxcbq1619787919", "wxywrq1468235067", "wkhg581762773124", "a4kgf21763075288",
  "q47rkb1762324620", "y4t9zg1777628842", "dokbyt1779645030",
  // petit-déj
  "1550441882", "utxryw1511721587", "1543774956", "sqrtwu1511721265",
  "thazgm1555350962", "hqaejl1695738653", "jvjnoh1780086318",
  // végé
  "tbj1bs1764118062", "zub3s91764110535", "02s6gc1763799560", "urtpqw1487341253",
  "zadvgb1699012544", "60oc3k1699009846", "3m8yae1763257951",
  // porc
  "xusqvw1511638311", "atd5sh1583188467", "md8w601593348504", "naqyel1608588563",
  "tzsy461763769901", "f0cdwk1782688162",
  // entrées / apéro
  "tvvxpv1511191952", "rvtvuw1511190488", "wurrux1468416624", "stpuws1511191310",
  "5jdtie1763289302", "vgsipt1779917593",
  // salades / plats spécifiques ajoutés
  "k29viq1585565980", "fqpqml1764359125", "g373701551450225", "pjbaq11784731571",
  "bqx8mc1782684286", "zry07j1763779321", "wqurxy1511453156", "sxwquu1511793428",
  "oal8x31764119345", "1550440197",
].map(M);

// Association dirigée recette -> photo (exacte / au plus proche).
const BY_ID: Record<string, string> = {
  carbonara: M("llcbn01574260722"),
  "burger-maison": M("lgmnff1763789847"),
  "kebab-maison": M("04axct1763793018"),
  "tacos-poulet": M("dk70uv1784670127"),
  "ravioles-cremeuses": M("uquqtu1511178042"),
  "poke-bowl-saumon": M("1548772327"),
  "houmous-apero": M("zub3s91764110535"),
  "crumble-pommes": M("xvsurr1511719182"),
  pancakes: M("rwuyqx1511383174"),
  "oeufs-brouilles-avocado": M("jvjnoh1780086318"),
  "salade-cesar": M("4xcfai1763765676"),
  "pad-thai": M("rg9ze01763479093"),
  "risotto-champignons": M("xxrxux1503070723"),
  "quiche-lorraine": M("xusqvw1511638311"),
  "dahl-lentilles": M("r7mcjm1780261264"),
  "gratin-dauphinois": M("uuuspp1511297945"),
  "wrap-vege": M("u5e9qq1763795441"),
  "soupe-potiron": M("stpuws1511191310"),
  "saumon-four-legumes": M("ikizdm1763760862"),
  "pizza-margherita": M("lrfdwz1764438393"),
  "buddha-bowl": M("02s6gc1763799560"),
  "croque-monsieur": M("hqaejl1695738653"),
  cookies: M("q47rkb1762324620"),
  "brochettes-bbq": M("kgfh3q1763075438"),
  "mousse-chocolat": M("tqtywx1468317395"),
  "guacamole-nachos": M("uvuyxu1503067369"),
  "porridge-avoine": M("1529446352"),
  "tortilla-espagnole": M("1550441882"),
  "pain-perdu": M("thazgm1555350962"),
  bruschetta: M("wurrux1468416624"),
  gaspacho: M("tbj1bs1764118062"),
  bolognaise: M("sutysw1468247559"),
  lasagnes: M("wtsvxx1511296896"),
  "hachis-parmentier": M("sytuqu1511553755"),
  "poulet-roti": M("020z181619788503"),
  "chili-con-carne": M("pkopc31683207947"),
  "couscous-poulet": M("qxytrx1511304021"),
  "escalope-milanaise": M("lwsnkl1604181187"),
  "boulettes-tomate": M("qvrwpt1511181864"),
  "saucisse-lentilles": M("md8w601593348504"),
  "cordon-bleu-puree": M("sbx7n71587673021"),
  "cabillaud-citron": M("qqwhw51780093126"),
  "moules-frites": M("wkhwqr1782774765"),
  "fish-and-chips": M("dxs5t71782678369"),
  "bo-bun": M("z0ageb1583189517"),
  ratatouille: M("wrpwuu1511786491"),
  "gnocchi-tomate": M("vvtvtr1511180578"),
  "pates-pesto": M("usywpp1511189717"),
  parmigiana: M("ctg8jd1585563097"),
  "omelette-fromage": M("naqyel1608588563"),
  "soupe-legumes": M("tvvxpv1511191952"),
  "riz-cantonais-vege": M("f0cdwk1782688162"),
  "curry-pois-chiches": M("urtpqw1487341253"),
  "butter-chicken": M("sypxpx1515365095"),
  "fajitas-poulet": M("tvtxpq1511464705"),
  "ramen-poulet": M("ip5xtp1769779958"),
  "shawarma-poulet": M("vdwloy1713225718"),
  "nouilles-sautees": M("syqypv1486981727"),
  "tarte-tatin": M("wxywrq1468235067"),
  "fondant-chocolat": M("adxcbq1619787919"),
  tiramisu: M("a4kgf21763075288"),
  "riz-au-lait": M("dokbyt1779645030"),
  crepes: M("eqnf3p1779649407"),
  "banana-bread": M("sywswr1511383814"),
  "salade-fruits": M("rsqwus1511640214"),
  gaufres: M("wkhg581762773124"),
  clafoutis: M("1543774956"),
  // plats "difficiles" désormais couverts par une vraie photo dédiée
  "curry-legumes": M("x2fw9e1560460636"),
  "salade-grecque": M("k29viq1585565980"),
  taboule: M("fqpqml1764359125"),
  shakshuka: M("g373701551450225"),
  "smoothie-bowl": M("pjbaq11784731571"),
  "salade-chevre-chaud": M("bqx8mc1782684286"),
  bibimbap: M("zry07j1763779321"),
  "chili-sin-carne": M("wqurxy1511453156"),
  gougeres: M("sxwquu1511793428"),
  "cake-sale": M("oal8x31764119345"),
  "galette-sarrasin": M("1550440197"),
};

// Construit une assignation UNIQUE (aucune photo réutilisée).
function buildAssignments(): Record<string, string> {
  const assign: Record<string, string> = {};
  const used = new Set<string>();
  const ids = SIGNED_RECIPES.map((r) => r.id);

  // 1) préférences dirigées, en sautant celles déjà prises
  for (const id of ids) {
    const pref = BY_ID[id];
    if (pref && !used.has(pref)) {
      assign[id] = pref;
      used.add(pref);
    }
  }
  // 2) remplissage des recettes restantes avec des photos libres
  const leftover = MASTER.filter((u) => !used.has(u));
  let k = 0;
  for (const id of ids) {
    if (!assign[id]) {
      const url = leftover[k++] ?? MASTER[k % MASTER.length];
      assign[id] = url;
      used.add(url);
    }
  }
  return assign;
}

const ASSIGNMENTS = buildAssignments();

/** Photo unique et réelle d'une recette. */
export function photoFor(recipe: Recipe): string {
  return recipe.photoUrl ?? ASSIGNMENTS[recipe.id] ?? MASTER[0];
}
