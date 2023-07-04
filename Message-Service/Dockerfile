FROM continuumio/miniconda3

# Install system dependencies
RUN apt-get update && apt-get install -y libgl1-mesa-glx libglib2.0-0 curl

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs

# Set the working directory
WORKDIR /app

# Copy package.json and process_image.py
COPY package.json .
COPY process_image.py .
COPY images.jpeg .

# Install Node.js dependencies
RUN npm install

# Install Conda packages
RUN conda install -y -c anaconda openblas
RUN conda install -y -c anaconda numpy
RUN conda install -y -c anaconda pillow


# Copy the remaining files
COPY . .

# Start the Node.js server
CMD ["npm", "start"]
