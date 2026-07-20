FROM python:3.10-alpine

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV GEOS_LIBRARY_PATH=/usr/lib/libgeos_c.so
ENV GDAL_LIBRARY_PATH=/usr/lib/libgdal.so

# Set work directory
WORKDIR /app

# Install system dependencies for GeoDjango and PostgreSQL
RUN apk update && apk add --no-cache \
    postgresql-client \
    gcc \
    musl-dev \
    postgresql-dev \
    gdal-dev \
    geos-dev \
    proj-dev \
    libffi-dev

# Install python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project
COPY . /app/

CMD ["sh", "-c", "python manage.py migrate && daphne -b 0.0.0.0 -p 8000 core.asgi:application"]

