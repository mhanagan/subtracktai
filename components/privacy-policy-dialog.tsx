"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function PrivacyPolicyDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="text-sm text-muted-foreground hover:text-primary">
          Data Privacy Policy
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
          <DialogDescription>
            Last updated: {new Date().toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4 text-sm">
          <section>
            <h3 className="font-semibold mb-2">Data Collection and Usage</h3>
            <p>
              At Subtrackt, we take your privacy seriously. We only collect and store information that is
              necessary to provide our subscription tracking service:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Email address for account identification and communications</li>
              <li>Subscription details that you explicitly provide</li>
              <li>Usage data to improve our service</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-2">Data Protection</h3>
            <p>
              Your data is securely stored and encrypted. We never share your personal information
              with third parties without your explicit consent. Your subscription data is used solely
              to provide you with renewal reminders and tracking services.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">Email Communications</h3>
            <p>
              We send emails only for:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Subscription renewal reminders (when enabled)</li>
              <li>Account-related notifications</li>
              <li>Critical service updates</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-2">Your Rights</h3>
            <p>
              You have the right to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of communications</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-2">Contact Us</h3>
            <p>
              If you have any questions about our privacy policy or how we handle your data,
              please contact us at privacy@subtrackt.ai
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
} 