"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Home() {
  const [image, setImage] = useState(null);
  const [plateNumber, setPlateNumber] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [refImage, setRefImage] = useState(null);
  const [crowdImage, setCrowdImage] = useState(null);
  const [matchResultUrl, setMatchResultUrl] = useState("");
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchErrorMsg, setMatchErrorMsg] = useState("");

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
      } else {
        setIsAuthenticated(true);
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

  const handleFaceMatch = async () => {
    if (!refImage || !crowdImage) {
      setMatchErrorMsg("Please upload both reference and crowd images.");
      return;
    }

    setMatchLoading(true);
    setMatchErrorMsg("");
    setMatchResultUrl("");

    const formData = new FormData();
    formData.append("reference", refImage);
    formData.append("crowd", crowdImage);

    try {
      const res = await fetch("http://localhost:8000/match-face/", {
        method: "POST",
        body: formData,
      });
    
      if (!res.ok) throw new Error("Face match failed");
    
      const data = await res.json();
    
      if (data.match_found) {
        const imageUrl = "http://localhost:8000/get-matched/";
        setMatchResultUrl(imageUrl);
      } else {
        setMatchErrorMsg("No match found in the image.");
      }
    } catch (err) {
      setMatchErrorMsg(err.message);
    } finally {
      setMatchLoading(false);
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    router.replace("/login");
  };

  return (
    <main className="relative scroll-smooth overflow-y-scroll h-screen w-full bg-gradient-to-b from-zinc-900 via-zinc-950 to-black text-white">
      {/* Scroll-interactive background */}
      <div className="absolute top-0 left-0 w-full h-[300%] bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:40px_40px] opacity-20 blur-2xl z-0 pointer-events-none"></div>

      {isAuthenticated && (
        <Button
          onClick={handleSignOut}
          className="absolute top-6 right-6 z-50"
          variant="outline"
        >
          Sign Out
        </Button>
      )}

      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center flex-col text-center px-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Image
            src="/logo.png"
            alt="Project Logo"
            width={100}
            height={100}
            className="mx-auto mb-4"
          />
          <h1 className="text-4xl font-bold">GOD'S EYE</h1>
          <p className="mt-2 text-zinc-400">Automated Number Plate & Face Recognition</p>
        </motion.div>
      </section>

      {/* Description Section */}
      <section className="h-screen flex items-center justify-center px-4 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-2xl"
        >
          <p>
            This system allows intelligent analysis of video feeds to detect number plates from DVR footage and identify individuals in crowds using AI-based facial recognition.
          </p>
        </motion.div>
      </section>

      {/* Dual Function Section */}
      <section className="h-screen flex items-center justify-center px-6 z-10">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* License Plate Section */}
          <Card className="w-full max-w-lg p-6 bg-zinc-800">
            <CardContent className="flex flex-col space-y-4">
              <h2 className="text-xl font-semibold mb-4">License Plate Detector</h2>
              <Input type="file" onChange={(e) => setImage(e.target.files[0])} />
              <Button onClick={handleUpload} disabled={loading}>
                {loading ? "Detecting..." : "Upload & Detect"}
              </Button>
              {errorMsg && <p className="text-red-500">{errorMsg}</p>}
              {plateNumber && <p>Detected Plate: <strong>{plateNumber}</strong></p>}
              {previewUrl && (
                <img src={previewUrl} alt="Enhanced Plate" className="mt-4 rounded-lg border" />
              )}
            </CardContent>
          </Card>

          {/* Face Matcher Section */}
          <Card className="w-full max-w-lg p-6 bg-zinc-800">
            <CardContent className="flex flex-col space-y-4">
              <h2 className="text-xl font-semibold mb-4">Face Match from Crowd</h2>
              <Input type="file" accept="image/*" onChange={(e) => setRefImage(e.target.files[0])} />
              <label className="text-sm text-zinc-400">Reference Image</label>
              <Input type="file" accept="image/*" onChange={(e) => setCrowdImage(e.target.files[0])} />
              <label className="text-sm text-zinc-400">Crowd Image</label>
              <Button onClick={handleFaceMatch} disabled={matchLoading}>
                {matchLoading ? "Matching..." : "Upload & Match"}
              </Button>
              {matchErrorMsg && <p className="text-red-500">{matchErrorMsg}</p>}
              {matchResultUrl && (
                <img src={matchResultUrl} alt="Matched Face" className="mt-4 rounded-lg border" />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </main>
  );
}