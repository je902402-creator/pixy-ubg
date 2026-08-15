import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import SiteIcon from './SiteIcon';
import { Sparkles, Rocket } from 'lucide-react';

const ComingSoonModal = ({ site, open, onOpenChange }) => {
  if (!site) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#0b0b12] text-white sm:max-w-md">
        <div className="flex items-center gap-4">
          <div
            className="h-20 w-20 shrink-0 overflow-hidden rounded-[22px] border border-white/10"
            style={{
              boxShadow: `0 8px 24px -8px ${site.glow}66`,
            }}
          >
            <SiteIcon site={site} />
          </div>
          <div>
            <DialogHeader className="space-y-1 text-left">
              <DialogTitle className="text-xl font-bold text-white">
                {site.name}
              </DialogTitle>
              <DialogDescription className="text-sm text-white/70">
                {site.description}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/80">
          <Sparkles className="h-4 w-4 text-yellow-300" />
          <span>Coming soon—this site is still traveling through space.</span>
        </div>

        <DialogFooter className="mt-2">
          <Button
            onClick={() => onOpenChange(false)}
            className="gap-2 bg-white text-black hover:bg-white/90"
          >
            <Rocket className="h-4 w-4" />
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ComingSoonModal;
