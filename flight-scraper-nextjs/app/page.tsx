"use client";

import { useState, useEffect } from "react";
import { FlightCalendar } from "@/components/flight-calendar";

interface FlightData {
  departure_date: string;
  price: number;
  carrier: string;
}

export default function Page() {
  const [outboundFlights, setOutboundFlights] = useState<FlightData[]>([]);
  const [returnFlights, setReturnFlights] = useState<FlightData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Round up to nearest euro
  const roundUpPrice = (price: number): number => {
    return Math.ceil(price);
  };

  const transformFlightsToCalendarFormat = (flights: FlightData[]) => {
    const pricesByMonth: Record<
      string,
      { date: number; price: number; type: "standard" | "lowest" | "special" }[]
    > = {};

    // First, group flights by month
    flights.forEach((flight) => {
      const date = new Date(flight.departure_date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;

      if (!pricesByMonth[monthKey]) {
        pricesByMonth[monthKey] = [];
      }

      pricesByMonth[monthKey].push({
        date: date.getDate(),
        price: roundUpPrice(flight.price), // Round up the price
        type: "standard",
      });
    });

    // Then determine lowest prices for each month
    Object.keys(pricesByMonth).forEach((monthKey) => {
      const monthFlights = pricesByMonth[monthKey];
      const lowestPrice = Math.min(...monthFlights.map((f) => f.price));

      // Mark the lowest price(s) in the month
      monthFlights.forEach((flight) => {
        if (flight.price === lowestPrice) {
          flight.type = "lowest";
        }
      });
    });

    return pricesByMonth;
  };

  const fetchFlightData = async () => {
    try {
      // Fetch outbound flights
      const outboundResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/flights/cheapest-outbound`,
      );
      if (!outboundResponse.ok) {
        throw new Error("Failed to fetch outbound flights");
      }
      const outboundData = await outboundResponse.json();

      // Fetch return flights
      const returnResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/flights/cheapest-return`,
      );
      if (!returnResponse.ok) {
        throw new Error("Failed to fetch return flights");
      }
      const returnData = await returnResponse.json();

      setOutboundFlights(outboundData.data);
      setReturnFlights(returnData.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching flight data:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlightData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  const outboundPrices = transformFlightsToCalendarFormat(outboundFlights);
  const returnPrices = transformFlightsToCalendarFormat(returnFlights);

  return (
    <div className="p-4">
      <FlightCalendar
        initialMonth={new Date().getMonth()}
        initialYear={new Date().getFullYear()}
        outboundPrices={outboundPrices}
        returnPrices={returnPrices}
        onClose={() => console.log("Close clicked")}
        onSearch={() => console.log("Search clicked")}
      />
    </div>
  );
}
