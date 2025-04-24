
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import FunButton from '@/components/FunButton';
import AuthForms from '@/components/AuthForms';
import ProfileSettings from '@/components/ProfileSettings';
import UnitConverter from '@/components/UnitConverter';
import { LogIn, LogOut, Menu, Calculator, Moon, Sun, Keyboard } from 'lucide-react';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  const { user, signOut } = useAuth();
  
  return (
    <header className="sticky top-0 z-10 border-b border-border backdrop-blur-lg bg-background/80">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
          >
            <Menu size={20} />
          </Button>
          <FunButton />
          <Badge variant="outline" className="hidden sm:inline-flex bg-muted">
            Space Explorer
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="flex items-center gap-1 bg-background/40 backdrop-blur-sm border-white/20 hover:bg-background/60">
                    <span className="text-sm hidden sm:inline-block">
                      {user.user_metadata?.display_name || user.email}
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogTitle>Profile Settings</DialogTitle>
                  <DialogDescription>
                    Update your profile information and preferences
                  </DialogDescription>
                  <ProfileSettings />
                </DialogContent>
              </Dialog>
              <Button
                size="sm"
                variant="ghost"
                onClick={signOut}
                className="flex items-center gap-1 hover:bg-background/60"
              >
                <LogOut size={16} />
                <span className="sr-only sm:not-sr-only">Sign Out</span>
              </Button>
            </div>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="flex items-center gap-1 bg-background/40 backdrop-blur-sm border-white/20 hover:bg-background/60">
                  <LogIn size={16} />
                  <span>Sign In</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogTitle>Account Access</DialogTitle>
                <DialogDescription>
                  Sign in to your account or create a new one
                </DialogDescription>
                <AuthForms />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
