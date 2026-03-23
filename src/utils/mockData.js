export const CATEGORIES = [
  { id: 'all', name: 'Todos' },
  { id: 'tragos', name: 'Tragos' },
  { id: 'cervezas', name: 'Cervezas' },
  { id: 'comida', name: 'Comida' },
  { id: 'sin-alcohol', name: 'Sin Alcohol' },
];

export const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Fernet con Coca',
    price: 5500,
    category: 'tragos',
    image: 'https://images.cocktailwave.com/fernet-con-coca.png',
    description: 'El clásico argentino. Fernet Branca con Coca-Cola y mucho hielo.'
  },
  {
    id: '2',
    name: 'Gin Tonic Premium',
    price: 6500,
    category: 'tragos',
    image: 'https://images.unsplash.com/photo-1632665065125-52595b008e75?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'Gin nacional destilado, tónica premium y rodajas de pepino o pomelo.'
  },
  {
    id: '3',
    name: 'Cerveza IPA 500ml',
    price: 4500,
    category: 'cervezas',
    image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?q=80&w=800&auto=format&fit=crop',
    description: 'Cerveza artesanal con intenso aroma a lúpulo y amargor equilibrado.'
  },
  {
    id: '4',
    name: 'Burger Doble Queso',
    price: 11500,
    category: 'comida',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop',
    description: 'Doble medalla de carne, cheddar, cebolla crispy y salsa de la casa.'
  },
  {
    id: '5',
    name: 'Papas con Cheddar',
    price: 7500,
    category: 'comida',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=800&auto=format&fit=crop',
    description: 'Papas fritas triples cocción con salsa cheddar y verdeo.'
  },
  {
    id: '6',
    name: 'Agua Mineral',
    price: 2500,
    category: 'sin-alcohol',
    image: 'https://images.unsplash.com/photo-1638688569176-5b6db19f9d2a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'Con o sin gas.'
  }
];
