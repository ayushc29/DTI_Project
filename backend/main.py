from fastapi import FastAPI, File, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil
import cv2
import torch
import pytesseract
import numpy as np
from pathlib import Path

app = FastAPI()

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev, you can restrict this later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/get-enhanced/")
async def get_enhanced_image():
    return FileResponse(SAVE_DIR / "enhanced_plate.jpg")

@app.get("/")
async def root():
    return {"message": "Welcome to the FastAPI backend!"}