# Base image
FROM python:3.11-slim

# Install system dependencies for OpenCV (Required for cv2 to work)
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# We don't copy the whole requirements.txt directly because it contains CUDA instructions
# which are 2.5GB and unnecessary for the free CPU tier. We will install the CPU version of PyTorch.
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir ultralytics fastapi uvicorn python-multipart pydantic opencv-python-headless

# Copy the rest of the application
COPY src/ /app/src/
COPY models/ /app/models/
COPY backend_app.py /app/

# Expose port 7860 (Hugging Face Spaces requirement)
EXPOSE 7860

# Command to run the FastAPI app on the Hugging Face port
CMD ["uvicorn", "backend_app:app", "--host", "0.0.0.0", "--port", "7860"]
