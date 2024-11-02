import PhoneInputForm from "@/components/vapi/outbound-dial";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground p-4">
      <PhoneInputForm />
    </main>
  );
}
