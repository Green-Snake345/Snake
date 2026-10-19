FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

<<<<<<< HEAD
CMD ["python", "main.py"]
=======
CMD ["python", "main.py"]
>>>>>>> b61c6d2fa33dcd056c48a071794ecd880a122568
