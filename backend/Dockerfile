FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create static directory for QR codes
RUN mkdir -p /app/static/qrcodes

EXPOSE 5000

CMD ["python", "app.py"]
