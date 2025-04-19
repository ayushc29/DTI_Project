"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Home() {
  const [image, setImage] = useState(null);
  const [plateNumber, setPlateNumber] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // If the user is not logged in, redirect to the login page
        router.replace("/login");
      } else {
        setIsAuthenticated(true); // User is authenticated
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleUpload = async () => {
    if (!image) return;

    setLoading(true);
    setPlateNumber("");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", image);

    try {
      const res = await fetch("http://localhost:8000/detect-plate/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setPlateNumber(data.plate_number);
      setPreviewUrl("http://localhost:8000/get-enhanced/");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    router.replace("/login"); // Redirect to login page after sign out
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6 flex items-center justify-center flex-col relative">
      {isAuthenticated && (
        <Button
          onClick={handleSignOut}
          className="absolute top-6 right-6"
          variant="outline"
        >
          Sign Out
        </Button>
      )}

      <Card className="w-full max-w-lg p-6">
        <CardContent className="flex flex-col space-y-4">
          <h1 className="text-2xl font-semibold mb-4">License Plate Detector</h1>

          <Input type="file" onChange={(e) => setImage(e.target.files[0])} />
          <Button onClick={handleUpload} disabled={loading}>
            {loading ? "Detecting..." : "Upload & Detect"}
          </Button>

          {errorMsg && <p className="text-red-500">{errorMsg}</p>}
          {plateNumber && <p>Detected Plate: <strong>{plateNumber}</strong></p>}
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Enhanced Plate"
              className="mt-4 rounded-lg border"
            />
          )}
        </CardContent>
      </Card>
    </main>
  );
}