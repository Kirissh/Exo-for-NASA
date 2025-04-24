
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const spaceFactsList = [
  "The first confirmed exoplanet around a Sun-like star was discovered in 1995.",
  "The most common type of exoplanets discovered so far are 'super-Earths'.",
  "Some exoplanets orbit their stars in less than a day!",
  "The nearest known exoplanet is Proxima Centauri b, just 4.2 light years from Earth.",
  "Astronomers have discovered exoplanets that may be covered entirely in water.",
  "Some exoplanets orbit two stars at once - just like Tatooine in Star Wars!",
  "The hottest exoplanet discovered is KELT-9b with a temperature of about 4,300°C.",
  "It 'rains' molten glass sideways on exoplanet HD 189733b due to its extreme winds.",
  "Some exoplanets are so close to their stars that they may have surfaces of lava oceans.",
  "The Kepler Space Telescope discovered over 2,600 confirmed exoplanets.",
  "The TRAPPIST-1 system has seven Earth-sized planets, with three potentially in the habitable zone.",
  "Exoplanet J1407b has a ring system 200 times larger than Saturn's rings.",
  "55 Cancri e is thought to be covered in graphite and diamond, potentially making it a 'diamond planet'.",
  "Some exoplanets orbit their stars in the opposite direction to the star's rotation.",
  "HD 106906 b orbits its star at a distance 650 times farther than Earth is from the Sun.",
  "Gas giant exoplanets that orbit very close to their stars are called 'Hot Jupiters'.",
  "NASA's TESS mission is designed to find thousands more exoplanets closer to Earth.",
  "Some 'rogue planets' don't orbit any star at all but float freely through space.",
  "The atmosphere of GJ 1214b is so hot and dense that it may contain 'hot ice' - water in a solid state due to pressure, despite high temperatures.",
  "The term 'exoplanet' was first used in the 1990s to refer to planets outside our solar system."
];

export function RandomFacts() {
  const [currentFact, setCurrentFact] = useState(spaceFactsList[Math.floor(Math.random() * spaceFactsList.length)]);
  const [animate, setAnimate] = useState(false);
  
  const getRandomFact = () => {
    setAnimate(true);
    
    // Get a new random fact (ensuring it's different from the current one)
    let newFact;
    do {
      newFact = spaceFactsList[Math.floor(Math.random() * spaceFactsList.length)];
    } while (newFact === currentFact && spaceFactsList.length > 1);
    
    setTimeout(() => {
      setCurrentFact(newFact);
      setAnimate(false);
    }, 300);
  };
  
  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardContent className="pt-6 pb-4 relative">
        <Button 
          variant="outline"
          size="sm"
          onClick={getRandomFact}
          className="absolute right-4 top-4 flex gap-2"
        >
          <Sparkles size={16} />
          Random Fact
        </Button>
        
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <Sparkles size={18} className="text-primary" />
          Did You Know?
        </h3>
        
        <p className={cn(
          "text-sm transition-opacity duration-300",
          animate ? "opacity-0" : "opacity-100"
        )}>
          {currentFact}
        </p>
      </CardContent>
    </Card>
  );
}

export default RandomFacts;
