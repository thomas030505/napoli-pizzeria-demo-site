export type Review = {
  author: string;
  rating: 5;
  body: string;
  date: string;
  location?: string;
};

export const REVIEWS: Review[] = [
  {
    author: "Kristine H.",
    rating: 5,
    body: "Beste napolitansk pizza nord for Roma. Margheritaen er rett og slett perfekt — sprø, luftig kant, og den der røde tomatsmaken jeg savnet siden interrail-turen i 2008.",
    date: "for 2 uker siden",
    location: "Tønsberg",
  },
  {
    author: "Henrik M.",
    rating: 5,
    body: "Har spist her siden jeg var liten. Antonio kjente meg på fornavn. Nå kjenner Marco ungene mine. Det sier litt om hva slags sted det er.",
    date: "for 1 måned siden",
    location: "Nøtterøy",
  },
  {
    author: "Aisha B.",
    rating: 5,
    body: "Vegetarisk-pizzaen er ikke en ettertanke som andre steder. Skikkelig håndverk — du kjenner at deigen har fått tid.",
    date: "for 3 uker siden",
    location: "Sandefjord",
  },
];
