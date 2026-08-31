import os
import boto3
from dotenv import load_dotenv

load_dotenv()

client = boto3.client(
    "bedrock-agent-runtime",
    region_name=os.getenv("AWS_REGION", "ap-southeast-2"),
)

def ask_knowledge_base(question: str) -> str:
    response = client.retrieve_and_generate(
        input={"text": question},
        retrieveAndGenerateConfiguration={
            "type": "KNOWLEDGE_BASE",
            "knowledgeBaseConfiguration": {
                "knowledgeBaseId": os.getenv("KNOWLEDGE_BASE_ID", "kelana-travel-kb"),
                "modelArn": os.getenv("KB_MODEL_ARN", "anthropic.claude-3-sonnet-20240229-v1:0"),
            },
        },
    )
    return response["output"]["text"]
