FROM nvidia/cudagl:11.4.1-runtime

ENV TZ=Asia/Tokyo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install -y \
    libgl1-mesa-dev \
    libglu1-mesa-dev \
    freeglut3-dev \
    mesa-utils \
    libegl1-mesa \
    xorg-dev \
    curl \
    python3 \
    python3-pip

RUN pip install --upgrade pip

WORKDIR /GLSLFractalGenerator

COPY src ./src
COPY pyproject.toml ./pyproject.toml
COPY README.md ./README.md
COPY requirements.lock ./requirements.lock

RUN pip install --no-cache-dir -r requirements.lock
