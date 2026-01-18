import { useMutation } from "@tanstack/react-query";
import { api, type InsertInquiry } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useSubmitInquiry() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertInquiry) => {
      // Validate input against schema before sending
      const validated = api.contact.submit.input.parse(data);

      // Frontend-only mode: persist inquiries to localStorage and return a simulated created record.
      const STORAGE_KEY = "mock_inquiries";
      const raw = localStorage.getItem(STORAGE_KEY);
      const current = raw ? JSON.parse(raw) as Array<any> : [];
      const lastId = current.length ? Math.max(...current.map((i) => i.id || 0)) : 0;
      const newInquiry = { id: lastId + 1, ...validated, createdAt: new Date().toISOString() };
      current.push(newInquiry);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));

      return api.contact.submit.responses[201].parse(newInquiry);
    },
    onSuccess: () => {
      toast({
        title: "Inquiry Sent Successfully",
        description: "Thank you for contacting Green Petals Engineering. We will get back to you shortly.",
        className: "bg-primary text-primary-foreground border-none",
      });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please check your connection and try again.",
        variant: "destructive",
      });
    },
  });
}
