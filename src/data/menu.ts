import type { ImageSourcePropType } from 'react-native';

/*
 * Menu data. Images live in assets/food and are named to match the asset list,
 * so swapping in final artwork is just replacing a file with the same name.
 */

export type Category = 'pizza' | 'burger' | 'chinese';
export type Diet = 'vegan' | 'vegetarian' | 'gluten-free' | 'spicy' | 'halal';

export type Dish = {
  id: string;
  name: string;
  category: Category;
  price: number; // base price (regular / 12")
  image: ImageSourcePropType;
  blurb: string;
  description: string;
  allergens: string;
  diets: Diet[];
  minutes: number;
  rating: number;
  reviews: number;
  popular?: boolean;
};

export type Extra = { id: string; name: string; price: number; image: ImageSourcePropType };

export const categories: { id: Category; label: string; icon: string }[] = [
  { id: 'pizza', label: 'Pizza', icon: 'pizza' },
  { id: 'burger', label: 'Burgers', icon: 'hamburger' },
  { id: 'chinese', label: 'Chinese', icon: 'noodles' },
];

export const dietLabels: Record<Diet, string> = {
  vegan: 'Vegan',
  vegetarian: 'Vegetarian',
  'gluten-free': 'Gluten-free',
  spicy: 'Spicy',
  halal: 'Halal',
};

export const dishes: Dish[] = [
  // ---------------- Pizza
  {
    id: 'pizza-margherita',
    name: 'Margherita',
    category: 'pizza',
    price: 8.5,
    image: require('../../assets/food/pizza-margherita.png'),
    blurb: 'Tomato, mozzarella, basil',
    description: 'Slow-proved dough, San Marzano tomato sauce, fior di latte mozzarella and fresh basil.',
    allergens: 'Gluten, milk.',
    diets: ['vegetarian'],
    minutes: 15,
    rating: 4.7,
    reviews: 820,
    popular: true,
  },
  {
    id: 'pizza-pepperoni',
    name: 'Pepperoni',
    category: 'pizza',
    price: 10.5,
    image: require('../../assets/food/pizza-pepperoni.png'),
    blurb: 'Double pepperoni, mozzarella',
    description: 'A generous layer of crispy-edged pepperoni over mozzarella and our house tomato sauce.',
    allergens: 'Gluten, milk. May contain mustard.',
    diets: [],
    minutes: 15,
    rating: 4.9,
    reviews: 1400,
    popular: true,
  },
  {
    id: 'pizza-bbq-chicken',
    name: 'BBQ Chicken',
    category: 'pizza',
    price: 11.5,
    image: require('../../assets/food/pizza-bbq-chicken.png'),
    blurb: 'Smoky BBQ, chicken, red onion',
    description: 'Smoky BBQ base topped with chargrilled chicken, red onion and mozzarella.',
    allergens: 'Gluten, milk, celery.',
    diets: ['halal'],
    minutes: 18,
    rating: 4.6,
    reviews: 640,
  },
  {
    id: 'pizza-veggie-supreme',
    name: 'Veggie Supreme',
    category: 'pizza',
    price: 10,
    image: require('../../assets/food/pizza-veggie-supreme.png'),
    blurb: 'Peppers, mushroom, olives',
    description: 'Vegan cheese, roasted peppers, mushrooms and black olives on a tomato base.',
    allergens: 'Gluten. Made with vegan cheese.',
    diets: ['vegan', 'vegetarian'],
    minutes: 16,
    rating: 4.5,
    reviews: 410,
    popular: true,
  },
  {
    id: 'pizza-hot-and-spicy',
    name: 'Hot & Spicy',
    category: 'pizza',
    price: 11,
    image: require('../../assets/food/pizza-hot-and-spicy.png'),
    blurb: 'Chilli, pepperoni, jalapeños',
    description: 'Fiery chilli sauce, spicy pepperoni, red chillies and jalapeños. Not for the faint-hearted.',
    allergens: 'Gluten, milk.',
    diets: ['spicy'],
    minutes: 15,
    rating: 4.6,
    reviews: 530,
  },
  {
    id: 'pizza-meat-feast',
    name: 'Meat Feast',
    category: 'pizza',
    price: 12.5,
    image: require('../../assets/food/pizza-meat-feast.png'),
    blurb: 'Pepperoni, chicken, beef',
    description: 'Pepperoni, roast chicken and seasoned beef for the hungriest of nights.',
    allergens: 'Gluten, milk, mustard.',
    diets: [],
    minutes: 18,
    rating: 4.8,
    reviews: 960,
  },
  // ---------------- Burgers
  {
    id: 'burger-classic',
    name: 'Classic Beef',
    category: 'burger',
    price: 8,
    image: require('../../assets/food/burger-classic.png'),
    blurb: 'Beef, lettuce, tomato, onion',
    description: '6oz British beef patty, crisp lettuce, tomato, red onion and house sauce in a toasted brioche bun.',
    allergens: 'Gluten, egg, sesame, mustard.',
    diets: [],
    minutes: 12,
    rating: 4.6,
    reviews: 720,
    popular: true,
  },
  {
    id: 'burger-cheeseburger',
    name: 'Cheeseburger',
    category: 'burger',
    price: 8.5,
    image: require('../../assets/food/burger-cheeseburger.png'),
    blurb: 'Beef, double cheese, pickles',
    description: 'Beef patty with two slices of melted American cheese, pickles and burger sauce.',
    allergens: 'Gluten, milk, egg, sesame.',
    diets: [],
    minutes: 12,
    rating: 4.8,
    reviews: 1100,
    popular: true,
  },
  {
    id: 'burger-chicken',
    name: 'Crispy Chicken',
    category: 'burger',
    price: 8,
    image: require('../../assets/food/burger-chicken.png'),
    blurb: 'Buttermilk chicken, slaw',
    description: 'Buttermilk fried chicken thigh, crunchy slaw and garlic mayo.',
    allergens: 'Gluten, milk, egg.',
    diets: ['halal'],
    minutes: 14,
    rating: 4.7,
    reviews: 880,
  },
  {
    id: 'burger-double-smash',
    name: 'Double Smash',
    category: 'burger',
    price: 11,
    image: require('../../assets/food/burger-double-smash.png'),
    blurb: 'Two smashed patties, cheese',
    description: 'Two crispy smashed patties, double cheese, caramelised onions and smash sauce.',
    allergens: 'Gluten, milk, egg, sesame, mustard.',
    diets: [],
    minutes: 14,
    rating: 4.9,
    reviews: 1300,
    popular: true,
  },
  {
    id: 'burger-veggie',
    name: 'Plant Burger',
    category: 'burger',
    price: 9,
    image: require('../../assets/food/burger-veggie.png'),
    blurb: 'Plant patty, vegan cheese',
    description: 'Plant-based patty, vegan cheese, lettuce, tomato and vegan mayo in a seeded bun.',
    allergens: 'Gluten, soy, sesame.',
    diets: ['vegan', 'vegetarian'],
    minutes: 12,
    rating: 4.5,
    reviews: 390,
  },
  {
    id: 'burger-spicy-jalapeno',
    name: 'Jalapeño Fire',
    category: 'burger',
    price: 9.5,
    image: require('../../assets/food/burger-spicy-jalapeno.png'),
    blurb: 'Beef, jalapeños, chipotle',
    description: 'Beef patty, pepper jack cheese, pickled jalapeños and smoky chipotle mayo.',
    allergens: 'Gluten, milk, egg.',
    diets: ['spicy'],
    minutes: 12,
    rating: 4.7,
    reviews: 610,
  },
  // ---------------- Chinese
  {
    id: 'chinese-sweet-and-sour-chicken',
    name: 'Sweet & Sour Chicken',
    category: 'chinese',
    price: 9.5,
    image: require('../../assets/food/chinese-sweet-and-sour-chicken.png'),
    blurb: 'Crispy chicken, pineapple, peppers',
    description: 'Crispy chicken in a glossy sweet and sour sauce with pineapple and peppers, served on rice.',
    allergens: 'Gluten, soy, egg.',
    diets: ['halal'],
    minutes: 15,
    rating: 4.7,
    reviews: 750,
    popular: true,
  },
  {
    id: 'chinese-chow-mein',
    name: 'Vegetable Chow Mein',
    category: 'chinese',
    price: 8,
    image: require('../../assets/food/chinese-chow-mein.png'),
    blurb: 'Wok noodles, beansprouts, veg',
    description: 'Wok-fried egg-free noodles with beansprouts, peppers, carrots and spring onion.',
    allergens: 'Gluten, soy, sesame.',
    diets: ['vegan', 'vegetarian'],
    minutes: 12,
    rating: 4.5,
    reviews: 480,
  },
  {
    id: 'chinese-egg-fried-rice',
    name: 'Egg Fried Rice',
    category: 'chinese',
    price: 6,
    image: require('../../assets/food/chinese-egg-fried-rice.png'),
    blurb: 'Jasmine rice, egg, peas',
    description: 'Jasmine rice wok-fried with egg, peas and sweetcorn. A perfect side or a light meal.',
    allergens: 'Egg, soy.',
    diets: ['vegetarian', 'gluten-free'],
    minutes: 10,
    rating: 4.4,
    reviews: 300,
  },
  {
    id: 'chinese-salt-and-pepper-chicken',
    name: 'Salt & Pepper Chicken',
    category: 'chinese',
    price: 9,
    image: require('../../assets/food/chinese-salt-and-pepper-chicken.png'),
    blurb: 'Crispy chicken, chilli, peppers',
    description: 'Crispy chicken tossed with salt and pepper seasoning, fresh chilli, onion and peppers.',
    allergens: 'Gluten, soy.',
    diets: ['halal', 'spicy'],
    minutes: 14,
    rating: 4.8,
    reviews: 1020,
    popular: true,
  },
  {
    id: 'chinese-crispy-chilli-beef',
    name: 'Crispy Chilli Beef',
    category: 'chinese',
    price: 10.5,
    image: require('../../assets/food/chinese-crispy-chilli-beef.png'),
    blurb: 'Crispy beef, sweet chilli glaze',
    description: 'Thin strips of crispy beef in a sticky sweet chilli glaze with carrot and spring onion.',
    allergens: 'Gluten, soy, sesame.',
    diets: ['spicy'],
    minutes: 15,
    rating: 4.8,
    reviews: 890,
  },
  {
    id: 'chinese-kung-pao-chicken',
    name: 'Kung Pao Chicken',
    category: 'chinese',
    price: 9.5,
    image: require('../../assets/food/chinese-kung-pao-chicken.png'),
    blurb: 'Chicken, peanuts, dried chilli',
    description: 'Sichuan-style chicken with roasted peanuts, dried chillies and spring onion.',
    allergens: 'Peanuts, soy, gluten.',
    diets: ['spicy', 'halal'],
    minutes: 14,
    rating: 4.6,
    reviews: 560,
  },
];

/* ---------------- Customisation options ---------------- */

export const pizzaSizes = [
  { id: '12', label: '12"', name: 'Small', add: 0, scale: 0.78 },
  { id: '14', label: '14"', name: 'Medium', add: 2.5, scale: 0.9 },
  { id: '18', label: '18"', name: 'Large', add: 5, scale: 1 },
];

export const pizzaCrusts = [
  { id: 'classic', name: 'Classic', add: 0 },
  { id: 'thin', name: 'Thin & crispy', add: 0 },
  { id: 'stuffed', name: 'Cheese stuffed', add: 2 },
];

export const mealSizes = [
  { id: 'regular', label: 'R', name: 'Regular', add: 0, scale: 0.86 },
  { id: 'large', label: 'L', name: 'Large', add: 2.5, scale: 1 },
];

export const toppings: Extra[] = [
  { id: 'mushroom', name: 'Mushroom', price: 1, image: require('../../assets/food/topping-mushroom.png') },
  { id: 'pepperoni', name: 'Pepperoni', price: 1.5, image: require('../../assets/food/topping-pepperoni.png') },
  { id: 'olives', name: 'Olives', price: 1, image: require('../../assets/food/topping-olives.png') },
  { id: 'peppers', name: 'Peppers', price: 1, image: require('../../assets/food/topping-peppers.png') },
  { id: 'onion', name: 'Red onion', price: 0.5, image: require('../../assets/food/topping-onion.png') },
  { id: 'extra-cheese', name: 'Extra cheese', price: 1.5, image: require('../../assets/food/topping-extra-cheese.png') },
];

export const burgerExtras: Extra[] = [
  { id: 'cheese', name: 'Cheese', price: 1, image: require('../../assets/food/extra-cheese-slice.png') },
  { id: 'bacon', name: 'Bacon', price: 1.5, image: require('../../assets/food/extra-bacon.png') },
  { id: 'egg', name: 'Fried egg', price: 1, image: require('../../assets/food/extra-fried-egg.png') },
  { id: 'jalapenos', name: 'Jalapeños', price: 0.5, image: require('../../assets/food/extra-jalapenos.png') },
  { id: 'avocado', name: 'Avocado', price: 1.5, image: require('../../assets/food/extra-avocado.png') },
  { id: 'onion-rings', name: 'Onion rings', price: 2, image: require('../../assets/food/extra-onion-rings.png') },
];

export const chineseSides: Extra[] = [
  { id: 'spring-rolls', name: 'Spring rolls', price: 3, image: require('../../assets/food/side-spring-rolls.png') },
  { id: 'prawn-crackers', name: 'Prawn crackers', price: 2, image: require('../../assets/food/side-prawn-crackers.png') },
  { id: 'dumplings', name: 'Dumplings', price: 4, image: require('../../assets/food/side-dumplings.png') },
  { id: 'chilli-oil', name: 'Chilli oil', price: 0.5, image: require('../../assets/food/side-chilli-oil.png') },
  { id: 'fried-rice', name: 'Egg fried rice', price: 3, image: require('../../assets/food/side-egg-fried-rice.png') },
  { id: 'soy', name: 'Soy sauce', price: 0, image: require('../../assets/food/side-soy-sauce.png') },
];

export const drinks: Extra[] = [
  { id: 'cola', name: 'Cola', price: 1.5, image: require('../../assets/food/drink-cola.png') },
  { id: 'lemonade', name: 'Lemonade', price: 1.5, image: require('../../assets/food/drink-lemonade.png') },
  { id: 'orange', name: 'Orange soda', price: 1.5, image: require('../../assets/food/drink-orange-soda.png') },
  { id: 'water', name: 'Water', price: 1, image: require('../../assets/food/drink-water.png') },
  { id: 'bubble-tea', name: 'Bubble tea', price: 3.5, image: require('../../assets/food/drink-bubble-tea.png') },
];

export const art = {
  logo: require('../../assets/brand/logo.png'),
  welcome: require('../../assets/brand/welcome.png'),
  rider: require('../../assets/brand/rider.png'),
  cooking: require('../../assets/food/illustration-cooking.png'),
  emptyBasket: require('../../assets/food/illustration-empty-basket.png'),
  emptyWishlist: require('../../assets/food/illustration-empty-wishlist.png'),
};

export const getDish = (id: string) => dishes.find((d) => d.id === id);

/** Extras offered on the customise screen for each category. */
export const extrasFor = (c: Category) => (c === 'pizza' ? toppings : c === 'burger' ? burgerExtras : chineseSides);
export const extrasTitle = (c: Category) => (c === 'pizza' ? 'Add extra toppings' : c === 'burger' ? 'Add extras' : 'Add a side');
export const allExtras = [...toppings, ...burgerExtras, ...chineseSides, ...drinks];

export const DELIVERY_FEE = 1.99;
export const SERVICE_FEE = 0.5;
