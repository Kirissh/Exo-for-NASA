
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { FileText, Save as SaveIcon, Trash2 as Trash2Icon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { v4 as uuidv4 } from 'uuid';

interface NoteTakingFeatureProps {
  exoplanetId?: string;
  exoplanetName?: string;
  objectId?: string;
  objectName?: string;
}

// Get a unique device ID for anonymous users
const getDeviceId = () => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

export function NoteTakingFeature({ exoplanetId, exoplanetName, objectId, objectName }: NoteTakingFeatureProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [noteText, setNoteText] = useState('');
  const [savedNote, setSavedNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const deviceId = getDeviceId();

  // Fetch existing note
  useEffect(() => {
    const fetchNote = async () => {
      setLoading(true);
      
      try {
        if (user) {
          // Fetch logged-in user's note
          const { data, error } = await supabase
            .from('user_cosmic_notes')
            .select('*')
            .eq(exoplanetId ? 'exoplanet_id' : 'object_id', exoplanetId || objectId)
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (error) throw error;
          
          if (data) {
            setSavedNote(data);
            setNoteText(data.note_text);
          }
        } else {
          // Fetch anonymous user's note using device ID
          const { data, error } = await supabase
            .from('anonymous_cosmic_notes')
            .select('*')
            .eq(exoplanetId ? 'exoplanet_id' : 'object_id', exoplanetId || objectId)
            .eq('device_id', deviceId)
            .maybeSingle();
          
          if (error) throw error;
          
          if (data) {
            setSavedNote(data);
            setNoteText(data.note_text);
          }
        }
      } catch (error) {
        console.error('Error fetching note:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (exoplanetId || objectId) {
      fetchNote();
    }
  }, [user, exoplanetId, objectId, deviceId]);
  
  // Save or update note
  const handleSaveNote = async () => {
    if (!noteText.trim()) return;
    
    setSaving(true);
    
    try {
      if (user) {
        // Handle logged-in user notes
        if (savedNote) {
          // Update existing note
          const { error } = await supabase
            .from('user_cosmic_notes')
            .update({ 
              note_text: noteText,
              updated_at: new Date().toISOString()
            })
            .eq('id', savedNote.id);
            
          if (error) throw error;
        } else {
          // Create new note
          const { error } = await supabase
            .from('user_cosmic_notes')
            .insert({ 
              user_id: user.id,
              exoplanet_id: exoplanetId || null,
              object_id: objectId || null,
              note_text: noteText
            });
            
          if (error) throw error;
        }
      } else {
        // Handle anonymous user notes
        if (savedNote) {
          // Update existing note
          const { error } = await supabase
            .from('anonymous_cosmic_notes')
            .update({ 
              note_text: noteText,
              updated_at: new Date().toISOString()
            })
            .eq('id', savedNote.id);
            
          if (error) throw error;
        } else {
          // Create new note
          const { error } = await supabase
            .from('anonymous_cosmic_notes')
            .insert({ 
              device_id: deviceId,
              exoplanet_id: exoplanetId || null,
              object_id: objectId || null,
              note_text: noteText
            });
            
          if (error) throw error;
        }
      }
      
      toast({
        title: "Note saved",
        description: `Your note for ${exoplanetName || objectName} has been saved.`,
      });
      
      if (!savedNote) {
        // Fetch the newly created note to get its ID
        const query = user 
          ? supabase
              .from('user_cosmic_notes')
              .select('*')
              .eq(exoplanetId ? 'exoplanet_id' : 'object_id', exoplanetId || objectId)
              .eq('user_id', user.id)
              .maybeSingle()
          : supabase
              .from('anonymous_cosmic_notes')
              .select('*')
              .eq(exoplanetId ? 'exoplanet_id' : 'object_id', exoplanetId || objectId)
              .eq('device_id', deviceId)
              .maybeSingle();
        
        const { data, error } = await query;
        
        if (!error && data) {
          setSavedNote(data);
        }
      }
      
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "Error saving note",
        description: "There was a problem saving your note. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Delete note
  const handleDeleteNote = async () => {
    if (!savedNote) return;
    
    setSaving(true);
    
    try {
      const table = user ? 'user_cosmic_notes' : 'anonymous_cosmic_notes';
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', savedNote.id);
        
      if (error) throw error;
      
      setSavedNote(null);
      setNoteText('');
      
      toast({
        title: "Note deleted",
        description: `Your note for ${exoplanetName || objectName} has been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error deleting note",
        description: "There was a problem deleting your note. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-background/70 backdrop-blur-sm border border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Personal Notes
        </CardTitle>
        <CardDescription>
          {exoplanetName || objectName ? (
            <>Record your thoughts about <span className="font-semibold">{exoplanetName || objectName}</span></>
          ) : (
            <>Add a general note</>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <div className="flex justify-end space-x-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        ) : (
          <Textarea
            placeholder="Add your notes, theories, or observations here..."
            className="bg-background/50 min-h-[100px]"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          Notes are saved automatically
        </div>
        <div className="flex space-x-2">
          {savedNote && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDeleteNote}
              disabled={saving || loading}
            >
              <Trash2Icon className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          <Button 
            variant="default" 
            size="sm"
            onClick={handleSaveNote}
            disabled={saving || loading || !noteText.trim()}
          >
            <SaveIcon className="h-4 w-4 mr-2" />
            {savedNote ? 'Update' : 'Save'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
