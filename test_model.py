
from ultralytics import YOLO
import cv2
import os

# --------------------------------
# 1. Load trained ONNX model
# --------------------------------

MODEL_PATH = "models/inspectai_yolo11n.onnx"
IMAGE_PATH = "test_images/sample.jpg"
OUTPUT_DIR = "results"

os.makedirs(OUTPUT_DIR, exist_ok=True)

print("Loading InspectAI model...")

model = YOLO(MODEL_PATH, task="detect")

print("Model loaded successfully!")

# --------------------------------
# 2. Run prediction
# --------------------------------

results = model.predict(
    source=IMAGE_PATH,
    imgsz=640,
    conf=0.25,
    iou=0.45,
    save=False,
    verbose=False
)

# --------------------------------
# 3. Process prediction results
# --------------------------------

result = results[0]

image = cv2.imread(IMAGE_PATH)

if image is None:
    raise FileNotFoundError(f"Image not found: {IMAGE_PATH}")

detections = result.boxes

if len(detections) == 0:
    print("\nINSPECTION RESULT: PASS")
    print("No defects detected.")
else:
    print("\nINSPECTION RESULT: FAIL")
    print(f"Defects detected: {len(detections)}")

    for i, detection in enumerate(detections, start=1):

        class_id = int(detection.cls.item())
        confidence = float(detection.conf.item())

        class_name = model.names[class_id]

        x1, y1, x2, y2 = map(
            int, detection.xyxy[0].tolist()
        )

        print(
            f"{i}. {class_name} | "
            f"Confidence: {confidence:.2%}"
        )

# --------------------------------
# 4. Save annotated image
# --------------------------------

annotated_image = result.plot()

output_path = os.path.join(
    OUTPUT_DIR,
    "inspection_result.jpg"
)

cv2.imwrite(output_path, annotated_image)

print(f"\nResult image saved at: {output_path}")

