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
      setPreviewUrl(`http://localhost:8000/get-enhanced/?t=${Date.now()}`);
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
    <main className="relative overflow-y-scroll h-screen w-full bg-gradient-to-b from-zinc-900 via-zinc-950 to-black text-white scroll-smooth snap-y snap-mandatory snap-always">
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
      <section className="w-full h-screen flex flex-col items-center justify-center gap-10 text-center snap-start px-4">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1 }}
          className="text-6xl font-extrabold tracking-wider bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
        >
          GOD'S EYE
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-2xl max-w-3xl leading-relaxed"
        >
          Real-time surveillance redefined. GOD'S EYE harnesses advanced AI for
          automatic license plate detection and precise face recognition,
          transforming raw CCTV footage into actionable intelligence.
        </motion.h2>
      </section>

      {/* Features Section */}
<section
  className="h-full w-full min-h-screen bg-gradient-to-r from-black via-zinc-900 to-black text-white flex flex-col items-center justify-center snap-start px-4 py-20"
  id="features"
>
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    transition={{ duration: 1, delay: 0.1 }}
    className="max-w-6xl text-center"
  >
    <h2 className="text-4xl font-bold mb-12">Key Features</h2>
    <div className="flex flex-wrap justify-center gap-8">
      {/* Feature 1 */}
      <div className="bg-zinc-800 hover:bg-zinc-700 rounded-2xl p-6 w-80 text-center border border-gray-700 hover:border-gray-400 transition-all shadow-xl hover:shadow-2xl">
        <div className="text-gray-500 text-4xl font-bold mb-4">1</div>
        <h3 className="text-xl font-semibold mb-2">License Plate Detection & Enhancement</h3>
        <p className="text-sm text-gray-300">
          Automatically detects vehicle license plates from images and low-resolution DVR footage,
          enhances the plate area using image processing, and extracts text using OCR for real-time analysis.
        </p>
      </div>

      {/* Feature 2 */}
      <div className="bg-zinc-800 hover:bg-zinc-700 rounded-2xl p-6 w-80 text-center border border-gray-700 hover:border-gray-400 transition-all shadow-xl hover:shadow-2xl">
        <div className="text-gray-500 text-4xl font-bold mb-4">2</div>
        <h3 className="text-xl font-semibold mb-2">Face Recognition in Crowded Scenes</h3>
        <p className="text-sm text-gray-300">
          Match a target person against a crowd using AI-based facial recognition. Supports image-to-image comparison using facial embeddings with high precision.
        </p>
      </div>

      {/* Feature 3 */}
      <div className="bg-zinc-800 hover:bg-zinc-700 rounded-2xl p-6 w-80 text-center border border-gray-700 hover:border-gray-400 transition-all shadow-xl hover:shadow-2xl">
        <div className="text-gray-500 text-4xl font-bold mb-4">3</div>
        <h3 className="text-xl font-semibold mb-2">Real-Time Processing</h3>
        <p className="text-sm text-gray-300">
          Lightning-fast detection and recognition from uploaded images or live footage with near-zero latency. Designed for security, law enforcement, and surveillance use cases.
        </p>
      </div>

      {/* Feature 5 */}
      <div className="bg-zinc-800 hover:bg-zinc-700 rounded-2xl p-6 w-80 text-center border border-gray-700 hover:border-gray-400 transition-all shadow-xl hover:shadow-2xl">
        <div className="text-gray-500 text-4xl font-bold mb-4">4</div>
        <h3 className="text-xl font-semibold mb-2">Secure & Scalable Backend</h3>
        <p className="text-sm text-gray-300">
          FastAPI and Firebase-backed infrastructure ensures secure user authentication, fast data processing, and seamless file handling for AI inference.
        </p>
      </div>
    </div>
  </motion.div>
</section>


      {/* How It Works Section */}
<section className="h-full w-full min-h-screen bg-black text-white flex flex-col items-center justify-center text-center snap-start px-4 py-20">
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    transition={{ duration: 1, delay: 0.1 }}
    className="max-w-6xl"
  >
    <h2 className="text-4xl font-bold mb-12">How It Works</h2>
    <div className="flex flex-wrap justify-center gap-10">
      {/* Step 1 */}
      <div className="bg-[#1e1e1e] p-6 rounded-2xl shadow-xl w-72 hover:scale-105 transition-transform">
        <div className="text-blue-500 text-4xl font-bold mb-4">1</div>
        <h3 className="text-xl font-semibold mb-2">Upload an Image or Video</h3>
        <p className="text-gray-400">
          Upload a clear photo or short clip showing the vehicle, person, or crowd.
          This media is used for AI-based recognition or plate detection.
        </p>
      </div>

      {/* Step 2 */}
      <div className="bg-[#1e1e1e] p-6 rounded-2xl shadow-xl w-72 hover:scale-105 transition-transform delay-100">
        <div className="text-blue-500 text-4xl font-bold mb-4">2</div>
        <h3 className="text-xl font-semibold mb-2">Advanced AI Analyzes the Content</h3>
        <p className="text-gray-400">
          Our backend uses YOLOv5, MTCNN, and InceptionResnetV1 to detect faces and license plates.
          OpenCV and OCR enhance and extract details with maximum clarity and accuracy.
        </p>
      </div>

      {/* Step 3 */}
      <div className="bg-[#1e1e1e] p-6 rounded-2xl shadow-xl w-72 hover:scale-105 transition-transform delay-200">
        <div className="text-blue-500 text-4xl font-bold mb-4">3</div>
        <h3 className="text-xl font-semibold mb-2">Get Real-Time Results Instantly</h3>
        <p className="text-gray-400">
          Instantly see the detected number plates, matched faces, or enhancement previews.
          Everything is optimized for minimal delay and maximum insight.
        </p>
      </div>

      {/* Step 4 */}
      <div className="bg-[#1e1e1e] p-6 rounded-2xl shadow-xl w-72 hover:scale-105 transition-transform delay-300">
        <div className="text-blue-500 text-4xl font-bold mb-4">4</div>
        <h3 className="text-xl font-semibold mb-2">Download & Take Action</h3>
        <p className="text-gray-400">
          Save the processed image, extracted text, or recognition results. Use it for reports,
          alerts, or further investigation directly from the dashboard.
        </p>
      </div>
    </div>
  </motion.div>
</section>


      {/* Detection Section */}
      <section className="h-screen flex items-center justify-center px-6 z-10 w-full flex-col gap-10 text-center snap-start">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.1 }}
        >
          <Card className="w-full max-w-lg p-6 bg-zinc-800">
            <CardContent className="flex flex-col space-y-4">
              <h2 className="text-xl font-semibold mb-4 text-white">
                License Plate Detector
              </h2>
              <Input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
              />
              <Button onClick={handleUpload} disabled={loading}>
                {loading ? "Detecting..." : "Upload & Detect"}
              </Button>
              {errorMsg && <p className="text-red-500">{errorMsg}</p>}
              {plateNumber && (
                <p className="text-white">
                  Detected Plate: <strong>{plateNumber}</strong>
                </p>
              )}
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Enhanced Plate"
                  className="mt-4 rounded-lg border"
                />
              )}
            </CardContent>
          </Card>

          <Card className="w-full max-w-lg p-6 bg-zinc-800">
            <CardContent className="flex flex-col space-y-4">
              <h2 className="text-xl font-semibold mb-4 text-white">
                Face Match from Crowd
              </h2>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setRefImage(e.target.files[0])}
              />
              <label className="text-sm text-zinc-400">Reference Image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setCrowdImage(e.target.files[0])}
              />
              <label className="text-sm text-zinc-400">Crowd Image</label>
              <Button onClick={handleFaceMatch} disabled={matchLoading}>
                {matchLoading ? "Matching..." : "Upload & Match"}
              </Button>
              {matchErrorMsg && <p className="text-red-500">{matchErrorMsg}</p>}
              {matchResultUrl && (
                <img
                  src={matchResultUrl}
                  alt="Matched Face"
                  className="mt-4 rounded-lg border"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Creators Section */}
      <section
        className="py-20 bg-gradient-to-r from-black via-zinc-900 to-black snap-start"
        id="creators"
      >
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Creators
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="bg-zinc-800 hover:bg-zinc-700 rounded-2xl p-6 flex flex-col items-center text-center border border-gray-700 hover:border-gray-400 transition-all shadow-xl hover:shadow-2xl"
              >
                <Image
                  src={`/img/creator${i}.jpg`}
                  alt={`Creator ${i}`}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full object-cover mb-4 border border-gray-600 shadow-lg"
                />
                <h3 className="text-xl font-semibold text-white mb-1">
                  {i === 1
                    ? "Mohammad Faizan"
                    : i === 2
                    ? "Madhav Tyagi"
                    : i === 3
                    ? "Piyush Khatwa"
                    : "Ayush Chauhan"}
                </h3>
                <p className="text-sm text-blue-400 mb-2">
                  {i === 1
                    ? "AI Dev"
                    : i === 2
                    ? "AI Dev"
                    : i === 3
                    ? "UI/UX Designer"
                    : "Full Stack Dev"}
                </p>
                <p className="text-sm text-gray-300 mb-3">
                  {i === 1
                    ? "Worked on license plate detection."
                    : i === 2
                    ? "Worked on face recognition and detection."
                    : i === 3
                    ? "Designed layout, color schemes, and user experience flows."
                    : "Connected FastAPI backend to frontend & image upload pipeline. Created FireBase Authentication"}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-black text-white py-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-lg mb-4">GOD'S EYE - Powered by the Creators</p>
          <p className="text-sm text-gray-400">
            © 2025 GOD'S EYE. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
