"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ComboboxProps {
    value: string | undefined;
    onValueChange: (value: string) => void;
    placeholder: string;
    options: { id: string; name: string }[];
}

export function Combobox({ value, onValueChange, placeholder, options }: ComboboxProps) {
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="w-full text-left" aria-hidden="true">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map(option => (
                    <SelectItem key={option.id} value={option.id}>
                        {option.name}
                    </SelectItem>
                ))
                }
            </SelectContent>
        </Select>
    )
}
