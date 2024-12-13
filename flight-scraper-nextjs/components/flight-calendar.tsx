"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FlightPrice {
  date: number;
  price: number;
  type?: "standard" | "lowest" | "special";
}

interface FlightCalendarProps {
  initialMonth: number;
  initialYear: number;
  outboundPrices: Record<string, FlightPrice[]>;
  returnPrices: Record<string, FlightPrice[]>;
  onClose?: () => void;
  onSearch?: () => void;
}

export function FlightCalendar({
  initialMonth = 11,
  initialYear = 2024,
  outboundPrices,
  returnPrices,
  onClose,
  onSearch,
}: FlightCalendarProps) {
  const [outboundDate, setOutboundDate] = React.useState({
    month: initialMonth,
    year: initialYear,
  });
  const [returnDate, setReturnDate] = React.useState({
    month: initialMonth,
    year: initialYear,
  });

  const weekDays = ["ma", "di", "wo", "do", "vr", "za", "zo"];
  const months = [
    "januari",
    "februari",
    "maart",
    "april",
    "mei",
    "juni",
    "juli",
    "augustus",
    "september",
    "oktober",
    "november",
    "december",
  ];

  const goToPreviousMonth = (isReturn: boolean) => {
    if (isReturn) {
      setReturnDate((prev) => {
        if (prev.month === 0) {
          return { month: 11, year: prev.year - 1 };
        }
        return { ...prev, month: prev.month - 1 };
      });
    } else {
      setOutboundDate((prev) => {
        if (prev.month === 0) {
          return { month: 11, year: prev.year - 1 };
        }
        return { ...prev, month: prev.month - 1 };
      });
    }
  };

  const goToNextMonth = (isReturn: boolean) => {
    if (isReturn) {
      setReturnDate((prev) => {
        if (prev.month === 11) {
          return { month: 0, year: prev.year + 1 };
        }
        return { ...prev, month: prev.month + 1 };
      });
    } else {
      setOutboundDate((prev) => {
        if (prev.month === 11) {
          return { month: 0, year: prev.year + 1 };
        }
        return { ...prev, month: prev.month + 1 };
      });
    }
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const renderCalendar = (
    prices: Record<string, FlightPrice[]>,
    isReturn: boolean,
  ) => {
    const currentDate = isReturn ? returnDate : outboundDate;
    const currentMonthKey = `${currentDate.year}-${(currentDate.month + 1)
      .toString()
      .padStart(2, "0")}`;
    const currentPrices = prices[currentMonthKey] || [];
    const daysInMonth = getDaysInMonth(currentDate.month, currentDate.year);
    const firstDayOfMonth = getFirstDayOfMonth(
      currentDate.month,
      currentDate.year,
    );

    return (
      <div className="flex-1">
        <div className="mb-4 flex items-center gap-2 p-4">
          <Plane className={cn("h-5 w-5", isReturn && "rotate-180")} />
          <h2 className="text-lg font-medium">
            {isReturn
              ? "Alicante – Amsterdam (Schiphol)"
              : "Amsterdam (Schiphol) – Alicante"}
          </h2>
        </div>

        <div className="relative">
          <div className="bg-emerald-500 text-white">
            <div className="relative p-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-emerald-100"
                onClick={() => goToPreviousMonth(isReturn)}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <h3 className="text-2xl font-medium capitalize">
                {months[currentDate.month]} {currentDate.year}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-emerald-100"
                onClick={() => goToNextMonth(isReturn)}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-1 px-4 pb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-sm p-2 font-medium">
                  {day}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 p-4">
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square p-1" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const date = i + 1;
              const price = currentPrices.find((p) => p.date === date);
              const isAvailable = !!price;

              return (
                <div
                  key={i}
                  className={cn(
                    "aspect-square p-1 relative rounded-lg",
                    isAvailable && "cursor-pointer hover:bg-accent",
                  )}
                >
                  <div className="text-center text-sm p-1">{date}</div>
                  {price && (
                    <div
                      className={cn(
                        "text-center text-xs font-medium",
                        price.type === "lowest" && "text-indigo-600",
                        price.type === "special" && "text-rose-500",
                      )}
                    >
                      € {price.price}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold text-purple-700 flex justify-center">
          Wanneer wil je vliegen?
        </h1>
      </div>

      <div className="flex divide-x">
        {renderCalendar(outboundPrices, false)}
        {renderCalendar(returnPrices, true)}
      </div>

      <div className="p-4 bg-emerald-500 text-white flex justify-between items-center">
        <div className="text-lg">
          Totaal per persoon
          <span className="ml-4 text-2xl font-bold">€ 0</span>
        </div>
      </div>

      <div className="p-4 flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Sluiten
        </Button>
        <Button onClick={onSearch}>Zoeken</Button>
      </div>
    </Card>
  );
}
