import ShareDemo from "@/components/share-demo";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-4">@gracefullight/react-share</h1>
      <p className="text-gray-600 text-center mb-12">
        Headless social sharing library for React - Example App
      </p>
      <ShareDemo />
    </main>
  );
}
