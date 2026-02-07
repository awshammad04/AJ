
import asyncio
import os
from dotenv import load_dotenv
from livekit.plugins import openai
from stt_hamsa import HamsaSTT
from livekit import agents

# Load env vars
load_dotenv()

async def test_tts():
    print("--- Testing OpenAI TTS ---")
    if not os.getenv("OPENAI_API_KEY"):
        print("ERROR: OPENAI_API_KEY is not set. Please add it to your .env file or environment variables.")
        return

    try:
        tts = openai.TTS(model="tts-1", voice="shimmer")
        text = "Hello, this is a test of the text to speech system."
        print(f"Synthesizing: '{text}'...")
        
        # We can't easily play audio in a headless script without extra libs (like sounddevice), 
        # but we can verify the stream is created successfully.
        stream = tts.synthesize(text)
        print("Success! Stream created (audio data generated).")
        
        # Consuming the stream to ensure no errors during generation
        async for chunk in stream:
            pass 
        print("TTS Stream consumption completed successfully.")

    except Exception as e:
        print(f"TTS Failed: {e}")

async def test_stt_structure():
    print("\n--- Testing Hamsa STT Adapter Structure ---")
    try:
        api_key = os.getenv("HAMSA_API_KEY")
        if not api_key:
            print("WARNING: HAMSA_API_KEY is not set in .env")
        
        stt = HamsaSTT(api_key=api_key)
        stream = stt.stream()
        print("Success! HamsaSTT stream initialized.")
        
        # We can't easily test real recognition without a real audio stream/mic connection here,
        # but we can verify classes load and initialize.
        await stream.aclose()
        print("STT Stream closed successfully.")
        
    except Exception as e:
        print(f"STT Failed: {e}")

async def main():
    await test_tts()
    await test_stt_structure()

if __name__ == "__main__":
    asyncio.run(main())
