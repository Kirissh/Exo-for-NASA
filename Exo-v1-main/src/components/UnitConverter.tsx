
import React, { useState } from 'react';
import { convertAstronomicalUnits } from '@/utils/mathOperations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

type UnitType = 'distance' | 'mass' | 'radius' | 'temperature';

type UnitOption = {
  value: string;
  label: string;
  type: UnitType;
};

const unitOptions: UnitOption[] = [
  // Distance units
  { value: 'au', label: 'Astronomical Units (AU)', type: 'distance' },
  { value: 'km', label: 'Kilometers (km)', type: 'distance' },
  { value: 'ly', label: 'Light Years (ly)', type: 'distance' },
  { value: 'pc', label: 'Parsecs (pc)', type: 'distance' },
  
  // Mass units
  { value: 'earth_mass', label: 'Earth Mass (M⊕)', type: 'mass' },
  { value: 'jupiter_mass', label: 'Jupiter Mass (MJ)', type: 'mass' },
  
  // Radius units
  { value: 'earth_radius', label: 'Earth Radius (R⊕)', type: 'radius' },
  { value: 'jupiter_radius', label: 'Jupiter Radius (RJ)', type: 'radius' },
  
  // Temperature units
  { value: 'kelvin', label: 'Kelvin (K)', type: 'temperature' },
  { value: 'celsius', label: 'Celsius (°C)', type: 'temperature' },
  { value: 'fahrenheit', label: 'Fahrenheit (°F)', type: 'temperature' },
];

const UnitConverter = () => {
  const [value, setValue] = useState<number>(1);
  const [fromUnit, setFromUnit] = useState<string>('earth_mass');
  const [toUnit, setToUnit] = useState<string>('jupiter_mass');
  const [unitType, setUnitType] = useState<UnitType>('mass');
  const [result, setResult] = useState<number | null>(null);
  
  // Filter options based on current unit type
  const filteredOptions = unitOptions.filter(option => option.type === unitType);
  
  const handleUnitTypeChange = (type: UnitType) => {
    setUnitType(type);
    // Set default from/to units for the new type
    const options = unitOptions.filter(option => option.type === type);
    if (options.length >= 2) {
      setFromUnit(options[0].value);
      setToUnit(options[1].value);
    }
    setResult(null);
  };
  
  const handleConvert = () => {
    try {
      const convertedValue = convertAstronomicalUnits(
        value, 
        fromUnit as any, 
        toUnit as any
      );
      setResult(convertedValue);
    } catch (error) {
      toast({
        title: "Conversion error",
        description: "Unable to convert between these units",
        variant: "destructive"
      });
    }
  };
  
  const handleReset = () => {
    setValue(1);
    setResult(null);
  };
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle>Astronomy Unit Converter</CardTitle>
        <CardDescription>
          Convert between different astronomical units
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-1.5">
              <Label htmlFor="unit-type">Unit Type</Label>
              <Select
                value={unitType}
                onValueChange={(value) => handleUnitTypeChange(value as UnitType)}
              >
                <SelectTrigger id="unit-type">
                  <SelectValue placeholder="Select unit type" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="mass">Mass</SelectItem>
                  <SelectItem value="radius">Radius</SelectItem>
                  <SelectItem value="temperature">Temperature</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="from-unit">From</Label>
              <Select
                value={fromUnit}
                onValueChange={setFromUnit}
              >
                <SelectTrigger id="from-unit">
                  <SelectValue placeholder="From unit" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {filteredOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="to-unit">To</Label>
              <Select
                value={toUnit}
                onValueChange={setToUnit}
              >
                <SelectTrigger id="to-unit">
                  <SelectValue placeholder="To unit" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {filteredOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="value">Value</Label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  id="value"
                  value={value}
                  onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                />
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={handleReset}
                  title="Reset value"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <Button onClick={handleConvert} className="w-full">
            Convert
          </Button>
          
          {result !== null && (
            <div className="mt-4 p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Result:</p>
              <p className="text-2xl font-bold">
                {result.toLocaleString(undefined, { 
                  maximumFractionDigits: 6,
                  minimumFractionDigits: 2
                })}
              </p>
              <p className="text-sm">
                {value} {unitOptions.find(u => u.value === fromUnit)?.label} = {" "}
                {result.toLocaleString(undefined, { maximumFractionDigits: 6 })} {unitOptions.find(u => u.value === toUnit)?.label}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UnitConverter;
