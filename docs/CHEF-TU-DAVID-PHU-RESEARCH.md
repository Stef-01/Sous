# Chef Tu David Phu — Research Dossier & Recipe Ingestion

> **Why this exists:** Chef Tu David Phu is a partner chef co-launching Sous.
> This documents the research, the full checklist of sources searched, the
> recipe inventory ingested into the catalog, and the copyright/image handling.
> **Date:** 2026-06 · **Status:** 33 recipes ingested (19 meals + 14 sides).

---

## 1. Who he is (factual summary, public sources)

Tu David Phu is a Vietnamese-American chef based in Oakland, California — a
first-generation son of refugees from **Phú Quốc** island (his family has made
Phú Quốc fish sauce since the late 1800s). He trained in Michelin kitchens
(Chez Panisse, Quince, Acquerello, and Daniel Boulud / Gramercy Tavern in NYC),
was Executive Chef at Gather (Berkeley), then ran the acclaimed **"Ăn"** pop-up.

- **SF Chronicle Rising Star Chef** (2017).
- **Bravo's Top Chef**, Season 15.
- Host of ABC's _Taste Buds: Chefsgiving_ (James Beard Award–nominated);
  co-producer of the Emmy-nominated PBS doc _Bloodline_; two-time TEDx speaker.
- Cookbook: **_The Memory of Taste: Vietnamese American Recipes from Phú Quốc,
  Oakland, and the Spaces Between_** (with Soleil Ho; Ten Speed/PRH, 2024) —
  85+ dishes.

His cuisine is **Vietnamese-American diaspora** — refugee frugality and
"gill-to-fin" cooking meeting Bay Area produce and fine-dining technique.

Sources: [cheftu.com/about](https://cheftu.com/about) ·
[Bravo](https://www.bravotv.com/people/tu-david-phu) ·
[Oaklandside](https://oaklandside.org/2024/09/10/tu-david-phu-memory-taste-cookbook/) ·
[Penguin Random House](https://www.penguinrandomhouse.com/books/716002/the-memory-of-taste-by-tu-david-phu-and-soleil-ho/)

---

## 2. Resource checklist — everywhere to find his recipes

| #   | Source                                                     | URL                                 | Yields                                                        | Used?                                                                             |
| --- | ---------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 1   | **Recipe Library (his free, public recipes)**              | cheftu.com/recipelibrary/\<slug\>   | Full recipes (ingredients + steps + photo)                    | ✅ **PRIMARY — all 33 ingested**                                                  |
| 2   | Recipe Library index                                       | cheftu.com/recipelibrary            | "Under construction" — individual pages discovered via search | ✅                                                                                |
| 3   | "Recipes old" archive                                      | cheftu.com/recipelibrary1           | Possible older recipes                                        | ⏳ re-check                                                                       |
| 4   | Recipe tags (npr, oakland, …)                              | cheftu.com/recipelibrary/tag/\*     | Groupings of the above                                        | ✅ via search                                                                     |
| 5   | YouTube — "Cooking with Chef Tu"                           | youtube.com/c/cookingwithcheftu     | Video method, technique clips                                 | ⏳ secondary (video → method, harder to extract)                                  |
| 6   | Instagram                                                  | instagram.com/cheftudavidphu        | Recipe posts (copyrighted captions)                           | ⏳ reference only                                                                 |
| 7   | Mr. Espresso "The Caffè" partnership                       | cheftu.com/thecaffe, mrespresso.com | Coffee recipes                                                | ✅ (bạc xỉu, boba)                                                                |
| 8   | Press features (KQED, SF Chronicle, AJC, Oaklandside, NPR) | various                             | Occasional shared recipes                                     | ⏳                                                                                |
| 9   | **Cookbook — _The Memory of Taste_**                       | PRH / Amazon / B&N                  | 85+ recipes                                                   | 🚫 **COPYRIGHTED — not reproduced** (see §4); dish names below as future wishlist |
| 10  | TV / TEDx / PBS _Bloodline_                                | Bravo, PBS                          | Bio + dish names, not full recipes                            | bio only                                                                          |

---

## 3. Recipe inventory ingested (33)

All ids are namespaced **`tu-`** (avoids collisions with the catalog's generic
`pho` / `banh-mi` / `bun-bo-hue` / `goi-ga` / `soondubu-jjigae` stubs and keeps
partnership content filterable). Each carries `source: { creator, url }`.

### Meals — 19 → `meals.json`

| Catalog id               | Dish                                                      | Source                  |
| ------------------------ | --------------------------------------------------------- | ----------------------- |
| tu-pho-dac-biet          | Phở Đặc Biệt (Special Beef Pho)                           | /phodacbiet             |
| tu-pho-ga                | Phở Gà (Chicken Pho)                                      | /phoga                  |
| tu-turkey-pho            | Phở Gà Tây (Turkey Pho)                                   | /turkeypho              |
| tu-soondubu-jjigae       | Soondubu Jjigae (Spicy Seafood Tofu Stew) _(Korean)_      | /soondubu               |
| tu-bun-rieu              | Bún Riêu (Crab & Tomato Noodle Soup)                      | /bunrieu                |
| tu-banh-canh-gio-heo-tom | Bánh Canh Giò Heo Tôm (Pork & Shrimp Tapioca Noodle Soup) | /banhcanhgioheotom      |
| tu-mi-hoanh-thanh        | Mì Hoành Thánh (Wonton Egg Noodle Soup)                   | /hoanhthanhsup          |
| tu-bun-bo-hue            | Bún Bò Huế (Spicy Beef & Pork Noodle Soup)                | /bunbohue               |
| tu-mi-xao-gion           | Mì Xào Giòn (Crispy Bird's Nest Noodles)                  | /crispybirdsnest        |
| tu-bun-ga-nuong          | Bún Gà Nướng (Grilled Lemongrass Chicken Vermicelli)      | /bunganuong             |
| tu-bun-nem-nuong         | Bún Nem Nướng (Grilled Pork Sausage Vermicelli)           | /bunnemnuong            |
| tu-com-ga-hai-nam        | Cơm Gà Hải Nam (Hainanese Chicken & Rice)                 | /comgahainam            |
| tu-com-suon              | Cơm Sườn (Grilled Pork Chop Rice Plate)                   | /comsuonchein           |
| tu-thit-kho-trung        | Thịt Kho Trứng (Braised Pork Belly & Eggs)                | /thitkhotrung           |
| tu-char-siu-banh-mi      | Char Siu Bánh Mì (Char Siu Pork Banh Mi)                  | /charsiubanhmi          |
| tu-banh-mi-trung-op-la   | Bánh Mì Trứng Ốp La (Fried Egg Banh Mi)                   | /banhmitrung            |
| tu-ga-kho-gung           | Gà Kho Gừng (Caramelized Ginger Chicken)                  | /gingerchicken          |
| tu-ga-chien              | Gà Chiên (Vietnamese Fried Chicken)                       | /vietnamesefriedchicken |
| tu-thit-heo-quay         | Thịt Heo Quay (Crispy Roast Pork Belly)                   | /thitheoquay            |

### Sides / condiments / sweets / drinks — 14 → `sides.json`

| Catalog id                    | Dish                                          | Source                    |
| ----------------------------- | --------------------------------------------- | ------------------------- |
| tu-nuoc-cham                  | Nước Chấm (Seasoned Fish Sauce)               | /nuoccham                 |
| tu-steamed-jasmine-rice       | Cơm (Steamed Rice)                            | /howtocookrice            |
| tu-garlic-noodles             | Mì Xào Tỏi (Garlic Noodles)                   | /garlicnoodles            |
| tu-rau-muong                  | Rau Muống Xào (Stir-Fried Water Spinach)      | /raumuong                 |
| tu-canh-cu-cai                | Canh Củ Cải (Daikon & Pork Rib Soup)          | /canhcucai                |
| tu-goi-ga                     | Gỏi Gà (Chicken & Cabbage Salad)              | /goiga                    |
| tu-ca-tai-chanh               | Cá Tái Chanh (Vietnamese Ceviche)             | /vietnameseceviche        |
| tu-banh-tom                   | Bánh Tôm (Shrimp & Sweet Potato Fritter)      | /banhtom                  |
| tu-cha-trung-hap              | Chả Trứng Hấp (Steamed Egg & Pork Terrine)    | /chatrunghap              |
| tu-cha-gio-khoai-mon          | Chả Giò Khoai Môn (Taro Egg Rolls)            | /taroeggroll              |
| tu-vietnamese-coffee-tiramisu | Bánh Kem Vị Cafe (Vietnamese Coffee Tiramisu) | /vietnamesecoffeetiramisu |
| tu-banh-chuoi-nuong           | Bánh Chuối Nướng (Banana Bread Pudding)       | /banhchouinuong           |
| tu-bac-xiu                    | Bạc Xỉu (Saigon-Style Milk Coffee)            | /saigonstylecoffee        |
| tu-brown-sugar-boba-coffee    | Brown Sugar Boba Coffee                       | /brownsugarbobacoffee     |

Ingest is reproducible: `node scripts/ingest-chef-tu.mjs` (idempotent — aborts on id collision).

---

## 4. Copyright & attribution (how this stays clean)

- **Only his free, public recipe library** was used. The **cookbook is NOT
  reproduced** — recipe _facts_ (ingredients, procedures) aren't copyrightable,
  but his book's selection, prose and photography are, so it's off-limits.
- **Descriptions are original** (our own neutral, factual wording for
  well-known dishes). His headnotes / stories / step prose are not copied.
- Every entry attributes him via `source: { creator: "Tu David Phu", url }`.

---

## 5. Images — separate placeholder / reshoot section

Per the brief, the dishes' real photos are **his copyrighted work** and the team
will reshoot aesthetic plate photography. Therefore:

- **No image is downloaded into the repo.** Every dish ships with
  `heroImageUrl/imageUrl = null` → the app's existing **gradient + emoji
  fallback** until the photoshoot drops in original `/food_images/*.png`.
- The **exact source-image URLs** (what each dish looks like) are recorded
  ONLY in **`src/data/chef-tu-image-references.json`** as reshoot reference for
  the photo team — linked, never copied, never shipped. 33 references, each
  flagged `status: "reshoot-needed"`, with the source page + the dish's
  prep/cook time + servings (captured for the next phase).

---

## 6. Next steps (not in this pass)

1. **Photoshoot** → replace the 33 `null` images with original `/food_images/*.png`; flip `heroImageUrl`/`imageUrl`.
2. **Guided-cook flows** (Mission→Grab→Cook→Win) for the iconic dishes — author from the factual steps on each source page (own wording), add to `guided-cook-steps.ts`.
3. **Nutrition** — run the ingredient registry/resolver over the new dishes once guided-cook ingredient lists exist.
4. **Cookbook wishlist** (do NOT ingest — needs his permission to reproduce): Cơm Tấm, Lá Sả lemongrass paste, Tuna Bloodline Tartare, Salmon-head sour soup, Truffled Garlic Noodles, Bánh Canh Carbonara, Dungeness Crab Donburi, Roasted Duck Phở, and others from _The Memory of Taste_.
5. Re-check `cheftu.com/recipelibrary1` + YouTube for any recipes not in the public library.
