import React from 'react'
import { DateRange, DayPicker } from 'react-day-picker'
import { addYears } from 'date-fns'
import 'react-day-picker/dist/style.css'

interface DatePickerWithRangeProps {
  id: string;
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

export function DatePickerWithRange({ id, date, setDate }: DatePickerWithRangeProps) {
  const defaultMonth = new Date();
  const maxDate = addYears(new Date(), 5);

  return (
    <div className="grid gap-2">
      <DayPicker
        id={id}
        mode="range"
        defaultMonth={defaultMonth}
        selected={date}
        onSelect={setDate}
        numberOfMonths={2}
        fromYear={new Date().getFullYear()}
        toYear={maxDate.getFullYear()}
      />
    </div>
  )
}