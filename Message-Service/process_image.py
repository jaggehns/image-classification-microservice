import numpy as np
from PIL import Image
import json
import sys

# Define constants
NUM_CLASSES = 10  # Number of clothing classes
IMAGE_SIZE = 28  # Size of the images

# Load and preprocess a single image
def load_image(image_path):
    image = Image.open(image_path)
    image = image.resize((IMAGE_SIZE, IMAGE_SIZE))
    image = image.convert("L")  # Convert to grayscale
    image_array = np.array(image)
    image_array = image_array.astype(np.float32) / 255.0
    image_array = image_array.reshape((1, IMAGE_SIZE, IMAGE_SIZE, 1))
    return image_array

# Define the path to the image you want to classify
image_path = "/app/images.jpeg"

# Load and preprocess the image
image_array = load_image(image_path)

# Convert image_array to a JSON string
image_json = json.dumps(image_array.tolist())

# Write the JSON string to stdout
sys.stdout.write(image_json)
sys.stdout.flush()