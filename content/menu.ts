// Generated from the live ChoiceQR menu (kozatskiy-stan-vn.choiceqr.com), 2026-09-26.
// Prices in UAH. English names are translations; keep uk names as on the printed menu.
import type { L10n } from "./types";

export type MenuItem = { name: L10n; weight: string; price: number; description?: L10n };
export type MenuCategory = { id: string; name: L10n; items: MenuItem[] };

export const menuUpdatedAt = "2026-09-26";

export const menu: MenuCategory[] = [
  {
    id: "holodni-zakuski",
    name: { uk: "Холодні закуски", en: "Cold starters" },
    items: [
      { name: { uk: "Асорті м’ясних делікатесів власного виробництва", en: "House-made cured meat platter" }, weight: "400/50 г", price: 580, description: { uk: "м’ясний рулет, м’ясо запечене, м’ясо копчене, ковбаса копчена", en: "meat roll, roast meat, smoked meat, smoked sausage" } },
      { name: { uk: "Козацька закуска", en: "Cossack starter (fresh salo, garlic, mustard)" }, weight: "100/50/25 г", price: 160, description: { uk: "підчеревина свіжа, часник, гірчиця", en: "fresh pork belly salo, garlic, mustard" } },
      { name: { uk: "Асорті три сала", en: "Three kinds of salo platter" }, weight: "300/50/25 г", price: 420, description: { uk: "підчеревина свіжа, копчена, запечена, маринована цибуля, часник, гірчиця", en: "fresh, smoked and baked salo, pickled onion, garlic, mustard" } },
      { name: { uk: "Філе оселедця з цибулею", en: "Herring fillet with onion" }, weight: "140/25 г", price: 195 },
      { name: { uk: "Скумбрія пряного посолу", en: "Spiced salted mackerel" }, weight: "200/35 г", price: 240 },
      { name: { uk: "Овочі до столу", en: "Fresh vegetable platter" }, weight: "450 г", price: 300, description: { uk: "огірки св., помідори св., перець болг., зелень", en: "fresh cucumbers, tomatoes, bell peppers, herbs" } },
      { name: { uk: "Селянські різносоли", en: "Village pickles platter" }, weight: "600 г", price: 320, description: { uk: "помідори маринов., огірки квашені, капуста квашена", en: "marinated tomatoes, fermented cucumbers, sauerkraut" } },
      { name: { uk: "Закуска «Грибна поляна»", en: "“Mushroom glade” starter" }, weight: "300 г", price: 350 },
      { name: { uk: "Сирне плато", en: "Cheese platter" }, weight: "270/40/20 г", price: 550, description: { uk: "камамбер, дорблю, пармезан, горіховий, горіх грецький, мед", en: "camembert, Dorblu, parmesan, walnuts, honey" } },
      { name: { uk: "Язик в ароматному соусі", en: "Beef tongue in aromatic sauce" }, weight: "200 г", price: 350, description: { uk: "огірки св., язик яловичий, соєвий соус, часник, кунжут", en: "fresh cucumber, beef tongue, soy sauce, garlic, sesame" } },
      { name: { uk: "Брускети з копченим ескаларом та в’яленими помідорами", en: "Bruschetta with smoked escolar and sun-dried tomatoes" }, weight: "300 г", price: 305 },
      { name: { uk: "Томати з сиром моцарела та соусом песто", en: "Tomatoes with mozzarella and pesto" }, weight: "300 г", price: 300 },
      { name: { uk: "Закуска з болгарським перцем та руколою", en: "Bell pepper and rocket starter" }, weight: "300 г", price: 300 },
    ],
  },
  {
    id: "salati",
    name: { uk: "Салати", en: "Salads" },
    items: [
      { name: { uk: "С-т Грецький з сиром фета", en: "Greek salad with feta" }, weight: "280 г", price: 250 },
      { name: { uk: "С-т Цезар із філе слабосоленого лосося та помідорами чері", en: "Caesar salad with lightly salted salmon and cherry tomatoes" }, weight: "300 г", price: 400 },
      { name: { uk: "С-т грузинський зі свининою гриль", en: "Georgian salad with grilled pork" }, weight: "500 г", price: 380 },
      { name: { uk: "С-т грузинський з червоною фасолею", en: "Georgian salad with red beans" }, weight: "400 г", price: 350 },
      { name: { uk: "С-т Цезар з беконом та куркою під фірменим соусом", en: "Caesar salad with bacon and chicken, house dressing" }, weight: "300 г", price: 300 },
      { name: { uk: "С-т із еко овочів та хрумкої капусти з домашньою олією", en: "Farm vegetable and crisp cabbage salad with home-pressed oil" }, weight: "230 г", price: 180 },
      { name: { uk: "С-т з копченим вугрем та болгарським перцем у східно-кунжутовому соусі", en: "Smoked eel and bell pepper salad, sesame dressing" }, weight: "230 г", price: 420 },
      { name: { uk: "С-т із курячим філе та фірмовим соусом", en: "Chicken fillet salad with house dressing" }, weight: "300 г", price: 320 },
      { name: { uk: "С-т з курячою грудкою під горіховим соусом", en: "Chicken breast salad with walnut sauce" }, weight: "400 г", price: 360 },
      { name: { uk: "С-т з печених овочів з м’ясом гриль та картоплі пай під домашнім майонезом та", en: "Roasted vegetable salad with grilled meat, potato straws and homemade mayonnaise" }, weight: "600 г", price: 420 },
      { name: { uk: "С-т зі свининою та овочами гриль під горіховим соусом", en: "Pork and grilled vegetable salad with walnut sauce" }, weight: "500 г", price: 420 },
      { name: { uk: "С-т із запеченого буряка та апельсинами з листям руколи та сиром фета під цитрусовим соусом", en: "Roasted beetroot, orange, rocket and feta salad, citrus dressing" }, weight: "400/50 г", price: 280 },
      { name: { uk: "С-т з креветками та мідіями", en: "Shrimp and mussel salad" }, weight: "350 г", price: 430 },
    ],
  },
  {
    id: "snidanki",
    name: { uk: "Сніданки", en: "Breakfasts" },
    items: [
      { name: { uk: "Оката яєчня з трьох яєць з овочами та баликом", en: "Three fried eggs with vegetables and cured pork loin" }, weight: "250/50/50 г", price: 320 },
      { name: { uk: "Шакшука", en: "Shakshuka" }, weight: "300/200 г", price: 320 },
      { name: { uk: "Англійський сніданок", en: "Full English breakfast" }, weight: "500 г", price: 320 },
      { name: { uk: "Сирники з Ягідним соусом та сметаною", en: "Syrnyky (cottage cheese pancakes) with berry sauce and sour cream" }, weight: "200/50/50 г", price: 300 },
      { name: { uk: "Вівсяні пластівці з фруктами та медом", en: "Oatmeal with fruit and honey" }, weight: "250/150/50 г", price: 250 },
      { name: { uk: "Холодний сніданок", en: "Cold breakfast platter" }, weight: "450 г", price: 300 },
    ],
  },
  {
    id: "pershi-stravi",
    name: { uk: "Перші страви", en: "Soups" },
    items: [
      { name: { uk: "Козацький борщ в казані по-Вінницьки", en: "Cossack cauldron borscht, Vinnytsia style" }, weight: "500/30/20 г", price: 200 },
      { name: { uk: "Козацький борщ в казані (півпорції)", en: "Cossack cauldron borscht (half portion)" }, weight: "300/30/20 г", price: 150 },
      { name: { uk: "Бограч із пастою «Eros pista» та гречаним хлібом", en: "Bograch goulash soup with Eros Pista paste and buckwheat bread" }, weight: "300/100/25 г", price: 200 },
      { name: { uk: "Бульйон з куркою та рисовою локшиною", en: "Chicken broth with rice noodles" }, weight: "500 г", price: 150 },
      { name: { uk: "Юшка з лісових грибів", en: "Wild mushroom soup" }, weight: "350 г", price: 200 },
      { name: { uk: "Солянка", en: "Solyanka" }, weight: "300 г", price: 200 },
    ],
  },
  {
    id: "garniri",
    name: { uk: "Гарніри", en: "Sides" },
    items: [
      { name: { uk: "Картопля смажена по–уланівськи", en: "Fried potatoes, Ulaniv style" }, weight: "200/50 г", price: 145 },
      { name: { uk: "Картопля фрі", en: "French fries" }, weight: "200/50 г", price: 145 },
      { name: { uk: "Картопля смажена по-домашньому", en: "Home-style fried potatoes" }, weight: "200/30 г", price: 145 },
      { name: { uk: "Картопля смажена по-селянськи", en: "Village-style fried potatoes" }, weight: "200 г", price: 145 },
      { name: { uk: "Картопля на вугуллі з підчеревиною та часничним соусом", en: "Ember-roasted potatoes with pork belly and garlic sauce" }, weight: "200/30 г", price: 160 },
      { name: { uk: "Вареники в асортименті", en: "Varenyky, assorted fillings" }, weight: "220/20 г", price: 180, description: { uk: "Картопля, капуста, лівер та творог солений.", en: "potato, cabbage, liver or salted cottage cheese" } },
      { name: { uk: "Банош з бринзою та шкварками", en: "Banosh with bryndza and cracklings" }, weight: "300/70 г", price: 300 },
      { name: { uk: "Картопля фірмова з зеленью та шкварками", en: "House potatoes with herbs and cracklings" }, weight: "250 г", price: 145 },
    ],
  },
  {
    id: "garyachi-zakuski",
    name: { uk: "Гарячі закуски", en: "Hot starters" },
    items: [
      { name: { uk: "Лаваш з бринзою і зеленню", en: "Lavash with bryndza and herbs" }, weight: "250 г", price: 135 },
      { name: { uk: "Лаваш з бринзою і овочами", en: "Lavash with bryndza and vegetables" }, weight: "300 г", price: 140 },
      { name: { uk: "Кісаділія грибна в лаваші", en: "Mushroom quesadilla in lavash" }, weight: "350 г", price: 140 },
      { name: { uk: "Філе з телячого язика із соусом гранд венор та сиром дор блю", en: "Veal tongue fillet with grand veneur sauce and Dorblu cheese" }, weight: "300/50 г", price: 450 },
      { name: { uk: "Сирні крокети з ягідним соусом та міксом салата", en: "Cheese croquettes with berry sauce and mixed leaves" }, weight: "275/50 г", price: 300 },
      { name: { uk: "Середземноморські мідії з овочами у вершково-лимоному соусі", en: "Mediterranean mussels with vegetables in lemon cream sauce" }, weight: "400 г", price: 495 },
      { name: { uk: "Курячі нагетси", en: "Chicken nuggets" }, weight: "250/50 г", price: 290 },
    ],
  },
  {
    id: "garyachi-stravi",
    name: { uk: "Гарячі страви", en: "Main courses" },
    items: [
      { name: { uk: "Козацька гулянка", en: "“Cossack feast” skillet" }, weight: "350/200 г", price: 420, description: { uk: "м’ясо:яловичина, свинина, куряче філе, шампіньйони смаж., картопля смаж., цибуля, зелень, вершки", en: "beef, pork, chicken fillet, fried mushrooms, fried potatoes, onion, herbs, cream" } },
      { name: { uk: "Дует карасів з лимонно-м’ятним соусом", en: "Duo of crucian carp with lemon-mint sauce" }, weight: "500/50 г", price: 450 },
    ],
  },
  {
    id: "stravi-z-mangala",
    name: { uk: "Страви з мангала", en: "From the charcoal grill" },
    items: [
      { name: { uk: "Шашлик із свинини ошийок з цибулею", en: "Pork neck shashlik with onion" }, weight: "250 г", price: 300 },
      { name: { uk: "Шашлик із свинини корейка з цибулею", en: "Pork loin shashlik with onion" }, weight: "250 г", price: 300 },
      { name: { uk: "Шашлик із телятини", en: "Veal shashlik" }, weight: "250 г", price: 350 },
      { name: { uk: "Шашлик курячий з кабачком та перцем", en: "Chicken shashlik with courgette and pepper" }, weight: "300 г", price: 285 },
      { name: { uk: "Чалагач зі свинини та болгарським перцем", en: "Pork chalagach with bell pepper" }, weight: "400 г", price: 480 },
      { name: { uk: "Свині ребра під медовою глазур’ю", en: "Honey-glazed pork ribs" }, weight: "250 г", price: 250 },
      { name: { uk: "Крила курячі під соусом барбекю", en: "BBQ chicken wings" }, weight: "300 г", price: 255 },
      { name: { uk: "Ковбаса по-домашньому на грилі", en: "Grilled homemade sausage" }, weight: "250 г", price: 250 },
      { name: { uk: "Печінка смажена", en: "Fried beef liver" }, weight: "300 г", price: 285, description: { uk: "яловичина", en: "beef" } },
      { name: { uk: "Вушка фірмові", en: "House grilled pork ears" }, weight: "300 г", price: 305, description: { uk: "свинина", en: "pork" } },
      { name: { uk: "Овочі гриль", en: "Grilled vegetables" }, weight: "600 г", price: 420, description: { uk: "гриби, баклажани, кабачки, перець, помідори, цибуля", en: "mushrooms, aubergine, courgette, peppers, tomatoes, onion" } },
      { name: { uk: "Курячі стегенця під медовим соусом", en: "Chicken thighs in honey sauce" }, weight: "300/75 г", price: 300 },
    ],
  },
  {
    id: "riba",
    name: { uk: "Риба", en: "Fish" },
    items: [
      { name: { uk: "Шашлик з філе коропа", en: "Carp fillet shashlik" }, weight: "300 г", price: 360 },
      { name: { uk: "Скумбрія на мангалі", en: "Charcoal-grilled mackerel" }, weight: "400 г", price: 480 },
      { name: { uk: "Філе коропа смажене в кукурудзяному борошні", en: "Carp fillet fried in cornmeal" }, weight: "300 г", price: 360 },
      { name: { uk: "Стейк лосося на мангалі", en: "Charcoal-grilled salmon steak" }, weight: "300 г", price: 780 },
    ],
  },
  {
    id: "deserti",
    name: { uk: "Десерти", en: "Desserts" },
    items: [
      { name: { uk: "Млинці з карамелізованим бананом та вершковим соусом", en: "Crêpes with caramelised banana and cream sauce" }, weight: "350/50 г", price: 220 },
      { name: { uk: "Морозиво з фруктами та ягідним соусом", en: "Ice cream with fruit and berry sauce" }, weight: "350/40/5 г", price: 290 },
      { name: { uk: "Фруктова тарілка", en: "Fruit platter" }, weight: "1000 г", price: 430 },
    ],
  },
  {
    id: "napoyi-domashnogo-prigotuvannya",
    name: { uk: "Напої домашнього приготування", en: "Homemade drinks" },
    items: [
      { name: { uk: "Узвар", en: "Uzvar (dried fruit compote)" }, weight: "250 мл", price: 40 },
      { name: { uk: "Узвар", en: "Uzvar (dried fruit compote)" }, weight: "1000 мл", price: 150 },
      { name: { uk: "Лимонад з апельсину та м’яти", en: "Orange and mint lemonade" }, weight: "250 мл", price: 40 },
      { name: { uk: "Лимонад з апельсину та м’яти", en: "Orange and mint lemonade" }, weight: "1000 мл", price: 150 },
      { name: { uk: "Морс", en: "Berry mors" }, weight: "1000 мл", price: 150 },
    ],
  },
  {
    id: "hlib",
    name: { uk: "Хліб", en: "Bread" },
    items: [
      { name: { uk: "Хліб домашній", en: "Homemade bread from the oven" }, weight: "", price: 50, description: { uk: "з печі", en: "from the oven" } },
      { name: { uk: "Хліб гречаний", en: "Buckwheat bread" }, weight: "", price: 50 },
    ],
  },
  {
    id: "sousi",
    name: { uk: "Соуси", en: "Sauces" },
    items: [
      { name: { uk: "Соус майонез з часником (фірмовий)", en: "House garlic mayonnaise" }, weight: "100 г", price: 80 },
      { name: { uk: "Соус томатний гострий з часником", en: "Spicy tomato garlic sauce" }, weight: "100 г", price: 80 },
      { name: { uk: "Соус гриль", en: "Grill sauce" }, weight: "100 г", price: 80 },
      { name: { uk: "Аджика домашня", en: "Homemade adjika" }, weight: "100 г", price: 70 },
      { name: { uk: "Аджика по грузинськи", en: "Georgian adjika" }, weight: "50 г", price: 55 },
      { name: { uk: "Сметана", en: "Sour cream" }, weight: "100 г", price: 55 },
      { name: { uk: "Соус гранатовий", en: "Pomegranate sauce" }, weight: "100 г", price: 80 },
      { name: { uk: "Соус часниковий", en: "Garlic sauce" }, weight: "50 г", price: 50 },
      { name: { uk: "Кетчуп", en: "Ketchup" }, weight: "50 г", price: 55 },
      { name: { uk: "Гірчиця", en: "Mustard" }, weight: "50 г", price: 55 },
      { name: { uk: "Оцет", en: "Vinegar" }, weight: "50 мл", price: 20 },
    ],
  },
];
