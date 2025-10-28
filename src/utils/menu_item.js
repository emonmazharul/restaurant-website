export const startar = [
  { name: 'Lamb chop startar', price: 6.95, category: 'Startar' },
  { name: 'Onion Bhaji', price: 4.95, category: 'Startar' },
  { name: 'Lamb Somosa', price: 4.95, category: 'Startar' },
  { name: 'Veg Somosa', price: 4.95, category: 'Startar' },
  { name: 'King Prawn Puri startar', price: 7.95, category: 'Startar' },
  { name: 'Prawn Puri startar', price: 6.95, category: 'Startar' },
  { name: 'Chilli Panner Startar', price: 5.95, category: 'Startar' },
];

export const biryani = [
  { name: 'Chicken Biryani', price: 10.95, category: 'Biryani' },
  { name: 'Chicken Tikka Biryani', price: 11.95, category: 'Biryani' },
  { name: 'Lamb Biryani', price: 10.95, category: 'Biryani' },
  { name: 'Lamb Tikka Biryani', price: 11.95, category: 'Biryani' },
  { name: 'Prawn Biryani', price: 12.95, category: 'Biryani' },
  { name: 'King Prawn Biryani', price: 13.95, category: 'Biryani' },
  {
    name: 'Mix Biryani',
    price: 12.95,
    variant: JSON.stringify({ info: 'Includes chicken, lamb and prawn' }),
    category: 'Biryani',
  },
  {
    name: 'Anwar Special Biryani',
    price: 13.95,
    variant: JSON.stringify({
      info: 'Includes Chicken tikka, lamb tikka, sheek kebab and an omelette on top',
    }),
    category: 'Biryani',
  },
];

export const tandoori = [
  { name: 'Chicken Tikka Main', price: 10.95, category: 'Tandoori Grilled' },
  { name: 'Lamb Tikka Main', price: 10.95, category: 'Tandoori Grilled' },
  { name: 'Chicken Tikka Hariyal', price: 11.95, category: 'Tandoori Grilled' },
  { name: 'Lamb Tikka Hariyal', price: 11.95, category: 'Tandoori Grilled' },
  { name: 'Lamb Chop Main', price: 12.95, category: 'Tandoori Grilled' },
  { name: 'Tandoori King Prawn', price: 14.95, category: 'Tandoori Grilled' },
  { name: 'Tandoori Chicken', price: 10.95, category: 'Tandoori Grilled' },
  { name: 'Chicken Sashlik', price: 10.95, category: 'Tandoori Grilled' },
  { name: 'Lamb Shashlik', price: 12.95, category: 'Tandoori Grilled' },
  { name: 'Mix Sashlik', price: 13.95, category: 'Tandoori Grilled' },
  { name: 'King Prawn Sashlik', price: 14.95, category: 'Tandoori Grilled' },
];

export const rice = [
  { name: 'Rice', price: 3.15, category: 'Rice' },
  { name: 'Pilaw Rice', price: 3.45, category: 'Rice' },
  { name: 'Mushroom Rice', price: 3.95, category: 'Rice' },
  { name: 'Garlic Rice', price: 3.95, category: 'Rice' },
  { name: 'Garlic & Chicken Rice', price: 4.15, category: 'Rice' },
  { name: 'Lemon Rice', price: 3.95, category: 'Rice' },
  { name: 'Coconut Rice', price: 3.95, category: 'Rice' },
  { name: 'Raitha', price: 2.75, category: 'Rice' },
];

export const bread = [
  { name: 'Nan', price: 3.15, category: 'Nan' },
  { name: 'Garlic Nan', price: 3.95, category: 'Nan' },
  { name: 'Peshwari Nan', price: 3.95, category: 'Nan' },
  { name: 'Kima Nan', price: 3.95, category: 'Nan' },
  { name: 'Chapati', price: 2.75, category: 'Nan' },
  { name: 'Paratha', price: 3.45, category: 'Nan' },
  { name: 'Alo Paratha', price: 3.95, category: 'Nan' },
  { name: 'Vegetable Paratha', price: 3.95, category: 'Nan' },
];

// masala, korma, boohna, madras, jalfrizi, duopiaza
function variantMaker(variant_name) {
  const traditional_variants = JSON.stringify([
    { variant: 'Chicken ' + variant_name, price: 10.95 },
    { variant: 'Chicken Tikka ' + variant_name, price: 11.95 },
    { variant: 'Lamb ' + variant_name, price: 10.95 },
    { variant: 'Lamb Tikka ' + variant_name, price: 11.95 },
    { variant: 'King Prawn ' + variant_name, price: 13.95 },
    { variant: 'Prawn' + variant_name, price: 11.95 },
  ]);

  return traditional_variants;
}


export const traditional = [
  { name: 'Masala', price: 10.95, variant: variantMaker('masala'), category: 'Traditional' },
  { name: 'Korma', price: 10.95, variant: variantMaker('korma'), category: 'Traditional' },
  { name: 'Madras', price: 10.95, variant: variantMaker('madras'), category: 'Traditional' },
  { name: 'Boohna', price: 10.95, variant: variantMaker('boohna'), category: 'Traditional' },
  { name: 'Duopiaza', price: 10.95, variant: variantMaker('duopiaza'), category: 'Traditional' },
  { name: 'Jalfrizi', price: 10.95, variant: variantMaker('jalfrizi'), category: 'Traditional' },
];