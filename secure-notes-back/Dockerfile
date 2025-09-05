FROM python:3.11-slim

WORKDIR /fast-api

RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    libffi-dev \
    libssl-dev \
    pkg-config \
    python3-dev \
    libjpeg-dev \
    libpng-dev \
    libxml2-dev \
    libxslt-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and create a filtered version
COPY requirements.txt ./requirements_full.txt

# Create a filtered requirements.txt without problematic packages
RUN grep -v -E "(IronPdf|pythonnet|clr_loader|aspose-words)" requirements_full.txt > requirements.txt

# Install Python dependencies
RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ./app/
COPY main.py ./
COPY .env ./

EXPOSE 8000

CMD ["python", "-m", "fastapi", "dev", "main.py", "--host", "0.0.0.0"]