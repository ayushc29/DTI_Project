from fastapi import FastAPI, File, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil
import cv2
import torch
import pytesseract
import numpy as np
from pathlib import Path
from facenet_pytorch import MTCNN, InceptionResnetV1
from torchvision import transforms
from PIL import Image

app = FastAPI()

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev, you can restrict this later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Face detection and recognition setup
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
mtcnn = MTCNN(keep_all=True, device=device)
resnet = InceptionResnetV1(pretrained="vggface2").eval().to(device)

def get_face_embedding(image):
    """Extracts 512-dim embedding for a face."""
    transform = transforms.Compose([transforms.Resize((160, 160)), transforms.ToTensor()])
    image = transform(Image.fromarray(image)).unsqueeze(0).to(device)
    with torch.no_grad():
        embedding = resnet(image)
    return embedding.cpu().numpy()

def detect_faces_with_embeddings(image):
    """Detect faces and return bounding boxes with embeddings."""
    boxes, _ = mtcnn.detect(image)
    faces = []
    if boxes is not None:
        for box in boxes:
            x1, y1, x2, y2 = map(int, box)
            face = image[y1:y2, x1:x2]
            embedding = get_face_embedding(face)
            faces.append((x1, y1, x2, y2, embedding))
    return faces

MODEL_PATH = 'weights/Yolov5/best.pt'
CONFIDENCE_THRESHOLD = 0.25
SAVE_DIR = Path('output')
SAVE_DIR.mkdir(exist_ok=True)

print("[INFO] Loading YOLOv5 model...")
model = torch.hub.load('ultralytics/yolov5', 'custom', path=MODEL_PATH, force_reload=True)
model.conf = CONFIDENCE_THRESHOLD

def enhance_image(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    denoised = cv2.fastNlMeansDenoising(gray, None, 30, 7, 21)
    sharpened = cv2.GaussianBlur(denoised, (0,0), 3)
    sharpened = cv2.addWeighted(denoised, 1.5, sharpened, -0.5, 0)
    return sharpened

@app.post("/detect-plate/")
async def detect_plate(file: UploadFile = File(...)):
    img_path = SAVE_DIR / "input.jpg"
    with open(img_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    img = cv2.imread(str(img_path))
    results = model(img)
    boxes = results.xyxy[0].numpy()

    if len(boxes) == 0:
        return JSONResponse({"error": "No license plate detected!"}, status_code=400)

    x1, y1, x2, y2 = map(int, boxes[0][:4])
    cropped_plate = img[y1:y2, x1:x2]
    plate_path = SAVE_DIR / "plate.jpg"
    cv2.imwrite(str(plate_path), cropped_plate)

    enhanced = enhance_image(cropped_plate)
    enhanced_path = SAVE_DIR / "enhanced_plate.jpg"
    cv2.imwrite(str(enhanced_path), enhanced)

    custom_oem_psm_config = r'--oem 3 --psm 8'
    text = pytesseract.image_to_string(enhanced, config=custom_oem_psm_config)
    cleaned_text = text.strip().replace("\n", "").replace(" ", "")

    return {
        "plate_number": cleaned_text,
        "image_url": f"/get-enhanced/"
    }

@app.post("/match-face/")
async def match_face(reference: UploadFile = File(...), crowd: UploadFile = File(...)):
    ref_path = SAVE_DIR / "ref.jpg"
    crowd_path = SAVE_DIR / "crowd.jpg"

    # Save uploaded files
    with open(ref_path, "wb") as f1:
        shutil.copyfileobj(reference.file, f1)
    with open(crowd_path, "wb") as f2:
        shutil.copyfileobj(crowd.file, f2)

    # Read and convert to RGB
    ref_img = cv2.imread(str(ref_path))
    crowd_img = cv2.imread(str(crowd_path))
    ref_rgb = cv2.cvtColor(ref_img, cv2.COLOR_BGR2RGB)
    crowd_rgb = cv2.cvtColor(crowd_img, cv2.COLOR_BGR2RGB)

    # Get reference face embedding
    ref_faces = detect_faces_with_embeddings(ref_rgb)
    if not ref_faces:
        return JSONResponse({"error": "No face in reference image"}, status_code=400)
    _, _, _, _, ref_embedding = ref_faces[0]

    # Match in crowd
    detected_faces = detect_faces_with_embeddings(crowd_rgb)
    threshold = 0.6
    best_match = None
    for x1, y1, x2, y2, emb in detected_faces:
        similarity = np.dot(ref_embedding, emb.T) / (np.linalg.norm(ref_embedding) * np.linalg.norm(emb))
        if similarity > threshold:
            best_match = (x1, y1, x2, y2)
            break

    if best_match:
        x1, y1, x2, y2 = best_match
        cv2.rectangle(crowd_img, (x1, y1), (x2, y2), (0, 255, 0), 3)
        match_path = SAVE_DIR / "matched_face.jpg"
        cv2.imwrite(str(match_path), crowd_img)
        return {"match_found": True, "image_url": "/get-matched/"}
    else:
        return {"match_found": False}

@app.get("/get-enhanced/")
async def get_enhanced_image():
    return FileResponse(SAVE_DIR / "enhanced_plate.jpg")

@app.get("/get-matched/")
async def get_matched():
    return FileResponse(SAVE_DIR / "matched_face.jpg")

@app.get("/")
async def root():
    return {"message": "Welcome to the FastAPI backend!"}