export type Service = { id: string; name: string; category: string; duration: number; price: number; description: string; image: string };
export const services: Service[] = [
  { id: "signature-cut", name: "Signature Cut", category: "Hair", duration: 45, price: 450, description: "Consultation, precision cut, wash and finish.", image: "/2g/service-station.jpeg" },
  { id: "fade-beard", name: "Fade + Beard", category: "Hair + Beard", duration: 60, price: 650, description: "Clean fade, sculpted beard and hot towel detail.", image: "/2g/cut-detail.jpeg" },
  { id: "executive", name: "Executive Grooming", category: "Grooming", duration: 75, price: 850, description: "Haircut, beard, facial cleanse and finishing products.", image: "/2g/service-chair.jpeg" },
  { id: "vip", name: "2G VIP Experience", category: "VIP", duration: 105, price: 1400, description: "Private grooming, premium products and unhurried care.", image: "/2g/salon-wide.jpeg" },
];
export const barbers = [
  { id: "samson", name: "Samson T.", role: "Master Barber", specialty: "Skin fades & precision detail", experience: "9 years", image: "/2g/barber-staff.jpeg" },
  { id: "miki", name: "Miki A.", role: "Style Director", specialty: "Texture & classic grooming", experience: "7 years", image: "/2g/gallery-action.jpeg" },
  { id: "dawit", name: "Dawit K.", role: "Senior Barber", specialty: "Beard design & hot towel", experience: "6 years", image: "/2g/gallery-mirror.jpeg" },
];
export const money = (value: number) => `ETB ${value.toLocaleString()}`;
