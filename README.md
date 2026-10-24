# Lofi's — working mobile prototype

**Live demo:** https://ebzefr.github.io/lofis-app/ (best on a phone)

A front-end-only React Native (Expo) prototype of **Lofi's**, a restaurant app for pizza, burgers and
Chinese food, built from my Lofi's UX/UI case study. There is no backend: menu data is local and
everything you do (account, basket, wishlist, orders, bookings) is saved on the device.

## What you can do

- **Onboarding:** splash, welcome, create account / log in (any details work), forgot-password flow
- **Home:** delivery address, offer carousel, category filters, popular dishes, "book a table"
- **Search:** live search plus filters for category, diet (vegan, vegetarian, gluten-free, spicy, halal), price and sort
- **Customise:** size (the plate grows), crust, extra toppings / sides, drinks, with a live price
- **Basket and checkout:** quantities, 3-step checkout (details → delivery or collect → payment)
- **Order tracking:** cooking countdown → rider moving along a map → delivered, with rating and re-order
- **Table booking:** guests, calendar, time slots, confirmation
- **Wishlist and profile:** saved dishes, order history, bookings, log out, reset demo data

The order timeline runs in under a minute so the whole journey can be shown in a demo
(see `DEMO` in `src/store/AppStore.tsx`).

## Run it

```bash
npm install
npm run web        # in the browser (shows a phone frame on desktop)
npm start          # then scan the QR code with Expo Go, or press i / a for a simulator
```

Checks: `npm run typecheck` and `npx eslint src`. Static web build: `npm run export:web` (outputs `dist/`).

Every push to `main` builds the web version and deploys it to GitHub Pages
(`.github/workflows/deploy.yml`). It's served under `/lofis-app`, set by `experiments.baseUrl` in `app.json`.

## Food artwork

Dishes and drinks in `assets/food` are the final photographic cut-outs, stored as **WebP**
(900×900, transparent) so the app stays light. The toppings, burger extras, Chinese sides and
illustrations are still flat **PNG placeholders**. To replace any image, drop in a file with the same
name (and extension), or update its path in `src/data/menu.ts`.

To convert a new transparent PNG to the same format:

```bash
cwebp -resize 900 900 -q 82 -alpha_q 90 "My new dish.png" -o assets/food/pizza-pepperoni.webp
```

| Group | Files | Status |
| --- | --- | --- |
| Pizzas | `pizza-margherita`, `pizza-pepperoni`, `pizza-bbq-chicken`, `pizza-veggie-supreme`, `pizza-hot-and-spicy`, `pizza-meat-feast` | Final (.webp) |
| Burgers | `burger-classic`, `burger-cheeseburger`, `burger-chicken`, `burger-double-smash`, `burger-veggie`, `burger-spicy-jalapeno` | Final (.webp) |
| Chinese | `chinese-sweet-and-sour-chicken`, `chinese-chow-mein`, `chinese-egg-fried-rice`, `chinese-salt-and-pepper-chicken`, `chinese-crispy-chilli-beef`, `chinese-kung-pao-chicken` | Final (.webp) |
| Drinks | `drink-cola`, `drink-lemonade`, `drink-orange-soda`, `drink-water`, `drink-chocolate-milkshake`, `drink-strawberry-milkshake` | Final (.webp) |
| Pizza toppings | `topping-mushroom`, `topping-pepperoni`, `topping-olives`, `topping-peppers`, `topping-onion`, `topping-extra-cheese` | Placeholder (.png) |
| Burger extras | `extra-cheese-slice`, `extra-bacon`, `extra-fried-egg`, `extra-jalapenos`, `extra-avocado`, `extra-onion-rings` | Placeholder (.png) |
| Chinese sides | `side-spring-rolls`, `side-prawn-crackers`, `side-dumplings`, `side-chilli-oil`, `side-egg-fried-rice`, `side-soy-sauce` | Placeholder (.png) |
| Illustrations | `illustration-cooking`, `illustration-empty-basket`, `illustration-empty-wishlist` | Placeholder (.png) |

Dish names, prices, descriptions, allergens and diet tags live in `src/data/menu.ts`.

## Project layout

```
src/app/          screens (Expo Router: every file is a route)
  (tabs)/         home, search, wishlist, profile
  dish/[id].tsx   customise screen
src/components/   shared UI (buttons, chips, sheet, dish cards, delivery map)
src/data/menu.ts  menu, options and prices
src/store/        app state (saved to device storage)
src/theme.ts      brand colours (#582D09 brown, #F9CF00 yellow), fonts, shadows
```
