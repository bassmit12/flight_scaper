import { FlightCalendar } from "@/components/flight-calendar";

const outboundPrices = {
  "2024-12": [
    { date: 13, price: 211 },
    { date: 14, price: 153 },
    { date: 15, price: 141 },
    { date: 16, price: 211 },
    { date: 17, price: 211 },
    { date: 18, price: 179 },
    { date: 19, price: 211 },
    { date: 20, price: 263 },
    { date: 21, price: 338 },
    { date: 22, price: 283 },
    { date: 23, price: 283 },
    { date: 24, price: 246 },
    { date: 25, price: 196 },
    { date: 26, price: 246 },
    { date: 27, price: 246 },
    { date: 28, price: 212 },
    { date: 29, price: 149 },
    { date: 30, price: 149 },
    { date: 31, price: 129 },
  ],
  "2025-01": [
    { date: 1, price: 189 },
    { date: 2, price: 199 },
    { date: 3, price: 209 },
    // Add more dates for January 2025
  ],
};

const returnPrices = {
  "2024-12": [
    { date: 13, price: 125 },
    { date: 14, price: 99 },
    { date: 15, price: 99 },
    { date: 16, price: 99 },
    { date: 17, price: 88 },
    { date: 18, price: 77 },
    { date: 19, price: 68 },
    { date: 20, price: 54 },
    { date: 21, price: 68 },
    { date: 22, price: 60 },
    { date: 23, price: 60 },
    { date: 24, price: 49 },
    { date: 25, price: 49 },
    { date: 26, price: 99 },
    { date: 27, price: 89 },
    { date: 28, price: 89 },
    { date: 29, price: 155 },
    { date: 30, price: 189 },
    { date: 31, price: 172 },
  ],
  "2025-01": [
    { date: 1, price: 179 },
    { date: 2, price: 169 },
    { date: 3, price: 159 },
    // Add more dates for January 2025
  ],
};

export default function Page() {
  return (
    <div className="min-h-screen p-4 bg-white">
      <FlightCalendar
        initialMonth={11} // 0-indexed, so 11 is December
        initialYear={2024}
        outboundPrices={outboundPrices}
        returnPrices={returnPrices}
      />
    </div>
  );
}
