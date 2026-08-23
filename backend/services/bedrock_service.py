import os
import json
import boto3
from dotenv import load_dotenv

# Load environment variables dari file .env
load_dotenv()


def get_bedrock_client():
    """
    Membuat dan mengembalikan Bedrock Runtime client
    menggunakan konfigurasi dari file .env.
    """
    aws_region = os.getenv("AWS_REGION", "ap-southeast-2")
    bearer_token = os.getenv("AWS_BEARER_TOKEN_BEDROCK")

    if not bearer_token:
        raise ValueError("AWS_BEARER_TOKEN_BEDROCK tidak ditemukan di file .env")

    # Gunakan bearer token sebagai API key via endpoint URL khusus Bedrock
    client = boto3.client(
        service_name="bedrock-runtime",
        region_name=aws_region,
        # Bearer token dikonfigurasikan melalui env variable standar boto3
        aws_access_key_id="bedrock-key",
        aws_secret_access_key=bearer_token,
    )
    return client


def get_ai_recommendation(destination: str, days: int, budget: float, travel_style: str) -> str:
    """
    Mengirim prompt ke Amazon Bedrock dan mengembalikan rekomendasi itinerary dari AI.

    Args:
        destination   : Tujuan perjalanan, contoh "Japan"
        days          : Durasi perjalanan dalam hari
        budget        : Total anggaran dalam USD
        travel_style  : Gaya perjalanan, contoh "Standar", "Backpacker", "Luxury"

    Returns:
        Teks rekomendasi itinerary dari model AI
    """
    model_id = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")

    prompt = (
        f"You are an experienced travel planner.\n"
        f"Create a {days}-day itinerary for {destination}.\n"
        f"Budget: USD {budget:,.0f}\n"
        f"Travel Style: {travel_style}.\n"
        f"Give the answer with markdown format, header(##) and bullet list (-)"
    )

    # Format request body sesuai Amazon Nova / Bedrock Converse API
    request_body = {
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        "inferenceConfig": {
            "maxTokens": 800,
            "temperature": 0.7,
            "topP": 0.9
        }
    }

    client = get_bedrock_client()

    response = client.invoke_model(
        modelId=model_id,
        contentType="application/json",
        accept="application/json",
        body=json.dumps(request_body)
    )

    response_body = json.loads(response["body"].read())

    # Ambil teks dari struktur respons Amazon Nova
    recommendation = response_body["output"]["message"]["content"][0]["text"]
    return recommendation
