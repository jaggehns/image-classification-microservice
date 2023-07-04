import numpy as np
from tensorflow import keras
import sys
import json

# Define constants
NUM_CLASSES = 10  # Number of clothing classes
IMAGE_SIZE = 28  # Size of the images

clothing_types = [
    "T-shirt/top",
    "Trouser",
    "Pullover",
    "Dress",
    "Coat",
    "Sandal",
    "Shirt",
    "Sneaker",
    "Bag",
    "Ankle boot"
]

# Load the pre-trained model
model = keras.models.load_model("fashion_mnist_model.h5")

# Parse the input argument as a JSON string
array_json_string = sys.argv[1]

# Convert the JSON string to a multi-dimensional array
image_array = np.array(json.loads(array_json_string))


# Perform prediction on the image
prediction = model.predict(image_array)

# # Get the predicted label
predicted_label = np.argmax(prediction)

# # Get the predicted clothing type
predicted_clothing_type = clothing_types[predicted_label]

# # Print the predicted label and clothing type
print(f"Predicted Label: {predicted_label}")
print(f"Predicted Clothing Type: {predicted_clothing_type}")
