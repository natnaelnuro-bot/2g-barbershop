export type Service = { id: string; name: string; category: string; duration: number; price: number; description: string; image: string };
export const services: Service[] = [
  { id: "signature-cut", name: "Signature Cut", category: "Hair", duration: 45, price: 450, description: "Consultation, precision cut, wash and finish.", image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80" },
  { id: "fade-beard", name: "Fade + Beard", category: "Hair + Beard", duration: 60, price: 650, description: "Clean fade, sculpted beard and hot towel detail.", image: "https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=900&q=80" },
  { id: "executive", name: "Executive Grooming", category: "Grooming", duration: 75, price: 850, description: "Haircut, beard, facial cleanse and finishing products.", image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=900&q=80" },
  { id: "vip", name: "2G VIP Experience", category: "VIP", duration: 105, price: 1400, description: "Private grooming, premium products and unhurried care.", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=80" },
];
export const barbers = [
  { id: "samson", name: "Samson T.", role: "Master Barber", specialty: "Skin fades & precision detail", experience: "9 years", image: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=700&q=80" },
  { id: "miki", name: "Miki A.", role: "Style Director", specialty: "Texture & classic grooming", experience: "7 years", image: "https://images.unsplash.com/photo-1562004760-aceed7bb0fe3?auto=format&fit=crop&w=700&q=80" },
  { id: "dawit", name: "Dawit K.", role: "Senior Barber", specialty: "Beard design & hot towel", experience: "6 years", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80" },
];
export const money = (value: number) => `ETB ${value.toLocaleString()}`;
