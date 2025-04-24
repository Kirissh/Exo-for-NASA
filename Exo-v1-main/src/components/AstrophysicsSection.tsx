
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/contexts/AuthContext';
import { getCosmicObjects, getAstronomicalEvents, getMetaphysicalConcepts, saveUserNote } from '@/services/exoplanetService';
import { CosmicObject, AstronomicalEvent, MetaphysicalConcept } from '@/types/astrophysics';
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const AstrophysicsSection = () => {
  const [cosmicObjects, setCosmicObjects] = useState<CosmicObject[]>([]);
  const [events, setEvents] = useState<AstronomicalEvent[]>([]);
  const [concepts, setConcepts] = useState<MetaphysicalConcept[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState("");
  const [selectedObject, setSelectedObject] = useState<CosmicObject | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // For demonstration, we'll use placeholder data until backend is populated
        const demoCosmicObjects: CosmicObject[] = [
          {
            id: "1",
            name: "Sagittarius A*",
            type: "black_hole",
            description: "Supermassive black hole at the center of the Milky Way galaxy.",
            distance_ly: 26673,
            size_ly: 0.0000000475,
            discovery_year: 1974,
            constellation: "Sagittarius",
            coordinates: { ra: 266.41684, dec: -29.00781 },
            created_at: new Date().toISOString()
          },
          {
            id: "2",
            name: "Andromeda Galaxy",
            type: "galaxy",
            description: "Spiral galaxy approximately 2.5 million light-years from Earth.",
            distance_ly: 2537000,
            size_ly: 220000,
            discovery_year: 964,
            constellation: "Andromeda",
            coordinates: { ra: 10.68458, dec: 41.26875 },
            created_at: new Date().toISOString()
          },
          {
            id: "3",
            name: "Eagle Nebula",
            type: "nebula",
            description: "Star-forming region located in the constellation Serpens.",
            distance_ly: 7000,
            size_ly: 70,
            discovery_year: 1745,
            constellation: "Serpens",
            coordinates: { ra: 274.675, dec: -13.8367 },
            created_at: new Date().toISOString()
          }
        ];

        const demoEvents: AstronomicalEvent[] = [
          {
            id: "1",
            name: "SN 1987A",
            event_type: "supernova",
            description: "Supernova observed in the Large Magellanic Cloud in February 1987.",
            event_date: "1987-02-23T00:00:00Z",
            discovery_date: "1987-02-24T00:00:00Z",
            created_at: new Date().toISOString()
          },
          {
            id: "2",
            name: "GW150914",
            event_type: "gravitational_wave",
            description: "First direct detection of gravitational waves from merging black holes.",
            event_date: "2015-09-14T09:50:45Z",
            discovery_date: "2015-09-14T09:50:45Z",
            created_at: new Date().toISOString()
          }
        ];

        const demoConcepts: MetaphysicalConcept[] = [
          {
            id: "1",
            name: "Quantum Entanglement",
            concept_type: "principle",
            description: "Quantum phenomenon where entangled particles remain connected so that actions performed on one affect the other, regardless of distance.",
            proposed_by: "Albert Einstein, Boris Podolsky, Nathan Rosen",
            proposed_year: 1935,
            created_at: new Date().toISOString()
          },
          {
            id: "2",
            name: "Dark Energy",
            concept_type: "theory",
            description: "Hypothetical form of energy that permeates all of space and tends to accelerate the expansion of the universe.",
            proposed_year: 1998,
            created_at: new Date().toISOString()
          },
          {
            id: "3",
            name: "String Theory",
            concept_type: "theory",
            description: "Theoretical framework in which the point-like particles of particle physics are replaced by one-dimensional objects called strings.",
            proposed_by: "Various physicists",
            proposed_year: 1970,
            created_at: new Date().toISOString()
          }
        ];

        // Use these demo objects initially
        setCosmicObjects(demoCosmicObjects);
        setEvents(demoEvents);
        setConcepts(demoConcepts);

        // Also try to fetch from API if available
        try {
          const apiCosmicObjects = await getCosmicObjects();
          const apiEvents = await getAstronomicalEvents();
          const apiConcepts = await getMetaphysicalConcepts();
          
          // Use API data if available
          if (apiCosmicObjects && apiCosmicObjects.length > 0) setCosmicObjects(apiCosmicObjects);
          if (apiEvents && apiEvents.length > 0) setEvents(apiEvents);
          if (apiConcepts && apiConcepts.length > 0) setConcepts(apiConcepts);
        } catch (err) {
          console.log('Using demo data since API data is not available yet');
        }
      } catch (error) {
        console.error("Error loading astrophysics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveNote = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save notes.",
        variant: "destructive"
      });
      return;
    }

    if (!noteText.trim()) {
      toast({
        title: "Empty Note",
        description: "Please enter some text for your note.",
        variant: "destructive"
      });
      return;
    }

    try {
      await saveUserNote(
        user.id,
        noteText,
        selectedObject?.id
      );
      
      toast({
        title: "Note Saved",
        description: "Your note has been saved successfully.",
      });
      
      setNoteText("");
      setSelectedObject(null);
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: "Error",
        description: "Failed to save your note. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6 mt-8">
      <h2 className="text-3xl font-bold tracking-tight">Astrophysics & Metaphysics</h2>
      <p className="text-muted-foreground">
        Explore cosmic objects, astronomical events, and metaphysical concepts.
      </p>

      <Tabs defaultValue="cosmic" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="cosmic">Cosmic Objects</TabsTrigger>
          <TabsTrigger value="events">Astronomical Events</TabsTrigger>
          <TabsTrigger value="concepts">Metaphysical Concepts</TabsTrigger>
        </TabsList>
        
        {/* Cosmic Objects Tab */}
        <TabsContent value="cosmic" className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="bg-background/70 backdrop-blur-sm border border-primary/20">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cosmicObjects.map(obj => (
                <Card 
                  key={obj.id} 
                  className={`bg-background/70 backdrop-blur-sm border ${selectedObject?.id === obj.id ? 'border-primary' : 'border-primary/20'} hover:border-primary/50 transition-all duration-300`}
                  onClick={() => setSelectedObject(obj)}
                >
                  <CardHeader>
                    <CardTitle>{obj.name}</CardTitle>
                    <CardDescription className="flex gap-2">
                      <Badge variant="outline">{obj.type}</Badge>
                      {obj.constellation && (
                        <Badge variant="secondary">{obj.constellation}</Badge>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{obj.description}</p>
                    {obj.distance_ly && (
                      <p className="text-xs">Distance: {obj.distance_ly.toLocaleString()} light-years</p>
                    )}
                    {obj.discovery_year && (
                      <p className="text-xs">Discovered: {obj.discovery_year}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Astronomical Events Tab */}
        <TabsContent value="events" className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <Card key={i} className="bg-background/70 backdrop-blur-sm border border-primary/20">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {events.map(event => (
                <Card key={event.id} className="bg-background/70 backdrop-blur-sm border border-primary/20">
                  <CardHeader>
                    <CardTitle>{event.name}</CardTitle>
                    <CardDescription>
                      <Badge>{event.event_type}</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <div>
                        <p className="font-semibold">Event Date:</p>
                        <p>{new Date(event.event_date).toLocaleDateString()}</p>
                      </div>
                      {event.discovery_date && (
                        <div>
                          <p className="font-semibold">Discovery Date:</p>
                          <p>{new Date(event.discovery_date).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Metaphysical Concepts Tab */}
        <TabsContent value="concepts" className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="bg-background/70 backdrop-blur-sm border border-primary/20">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {concepts.map(concept => (
                <Card key={concept.id} className="bg-background/70 backdrop-blur-sm border border-primary/20">
                  <CardHeader>
                    <CardTitle>{concept.name}</CardTitle>
                    <CardDescription>
                      <Badge variant="outline">{concept.concept_type}</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{concept.description}</p>
                    {concept.proposed_by && (
                      <p className="text-xs">Proposed by: {concept.proposed_by}</p>
                    )}
                    {concept.proposed_year && (
                      <p className="text-xs">Year: {concept.proposed_year}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* User Notes Section */}
      <Card className="bg-background/70 backdrop-blur-sm border border-primary/20 mt-6">
        <CardHeader>
          <CardTitle>Personal Notes</CardTitle>
          <CardDescription>
            {selectedObject ? (
              <>Add your thoughts about <span className="font-semibold">{selectedObject.name}</span></>
            ) : (
              <>Select a cosmic object above or add a general note</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add your notes, theories, or observations here..."
            className="bg-background/50"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            disabled={!user} 
            onClick={handleSaveNote}
          >
            Save Note
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AstrophysicsSection;
