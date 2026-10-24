# Lofi's — working mobile prototype

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

## Swapping in the final food artwork

Every image in `assets/food` is a placeholder. Replace a file with your own artwork **using the same
filename** and it shows up everywhere. Use transparent PNGs: dishes 1000×1000 (top-down for pizzas
and bowls), extras and drinks about 600×600.

| Group | Files |
| --- | --- |
| Pizzas | `pizza-margherita`, `pizza-pepperoni`, `pizza-bbq-chicken`, `pizza-veggie-supreme`, `pizza-hot-and-spicy`, `pizza-meat-feast` |
| Burgers | `burger-classic`, `burger-cheeseburger`, `burger-chicken`, `burger-double-smash`, `burger-veggie`, `burger-spicy-jalapeno` |
| Chinese | `chinese-sweet-and-sour-chicken`, `chinese-chow-mein`, `chinese-egg-fried-rice`, `chinese-salt-and-pepper-chicken`, `chinese-crispy-chilli-beef`, `chinese-kung-pao-chicken` |
| Pizza toppings | `topping-mushroom`, `topping-pepperoni`, `topping-olives`, `topping-peppers`, `topping-onion`, `topping-extra-cheese` |
| Burger extras | `extra-cheese-slice`, `extra-bacon`, `extra-fried-egg`, `extra-jalapenos`, `extra-avocado`, `extra-onion-rings` |
| Chinese sides | `side-spring-rolls`, `side-prawn-crackers`, `side-dumplings`, `side-chilli-oil`, `side-egg-fried-rice`, `side-soy-sauce` |
| Drinks | `drink-cola`, `drink-lemonade`, `drink-orange-soda`, `drink-water`, `drink-bubble-tea` |
| Illustrations | `illustration-cooking`, `illustration-empty-basket`, `illustration-empty-wishlist` |

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
