import asyncio
import logging
import os
from enum import Enum, auto

from dotenv import load_dotenv
from livekit import agents, rtc
from livekit.agents import JobContext, WorkerOptions, cli, tts, vad
# Import Google plugin
from livekit.plugins import google, silero

from stt_hamsa import HamsaSTT

load_dotenv()

# --- CONFIGURATION ---
PORT = int(os.getenv("PORT", "8081"))
API_KEY = os.getenv("LIVEKIT_API_KEY")
API_SECRET = os.getenv("LIVEKIT_API_SECRET")
URL = os.getenv("LIVEKIT_URL")

# --- STATE MACHINE ---
class GameState(Enum):
    INTRO = auto()
    CHALLENGE = auto()
    LISTENING = auto()
    SUCCESS = auto()

class SpeechTherapyAgent:
    def __init__(self, ctx: JobContext):
        self.ctx = ctx
        self.state = GameState.INTRO
        self.current_word = "سيارة" # Target word: Car
        self.current_hint = "يلا يا بطل، قولي... سيارة"
        
        # Initialize components
        # Tuning VAD for children (0.5s speech, 1.0s silence)
        self.vad = silero.VAD.load(
            min_speech_duration=0.5, 
            min_silence_duration=1.0,
        )
        # Using Google TTS instead of OpenAI
        # Requires GOOGLE_API_KEY or GOOGLE_APPLICATION_CREDENTIALS
        self.tts = google.TTS(language="ar-XA", gender="female") 
        self.stt = HamsaSTT(api_key=os.getenv("HAMSA_API_KEY"))
        
        self.ctx.create_task(self.game_loop())

    async def game_loop(self):
        logging.info("Starting Game Loop")
        await self.ctx.connect()
        
        while True:
            if self.state == GameState.INTRO:
                await self.play_audio("مرحبا! أنا أوس. هل أنت مستعد للبحث عن الكنز؟")
                await asyncio.sleep(1)
                self.state = GameState.CHALLENGE
                
            elif self.state == GameState.CHALLENGE:
                # Signal frontend to show image
                # await self.ctx.room.local_participant.publish_data(...)
                await self.play_audio("ما هذا؟")
                self.state = GameState.LISTENING
                
            elif self.state == GameState.LISTENING:
                # Wait 5 seconds for an answer
                success = await self.listen_for_answer(timeout=5.0)
                if success:
                    self.state = GameState.SUCCESS
                else:
                    # Timeout -> Give Hint
                    logging.info("Timeout! Giving hint.")
                    await self.play_audio(self.current_hint)
                    # Loop loops back to LISTENING automatically
            
            elif self.state == GameState.SUCCESS:
                await self.play_audio("ممتاز!")
                # End loop or reset
                break
                
            await asyncio.sleep(0.1)

    async def listen_for_answer(self, timeout: float) -> bool:
        logging.info("Listening for answer...")
        stream = self.stt.stream()
        
        user_track = await self.wait_for_user_track()
        if not user_track:
            return False

        audio_stream = rtc.AudioStream(user_track)
        
        async def process_audio():
            async for frame in audio_stream:
                await stream.push_frame(frame)
        
        process_task = self.ctx.create_task(process_audio())
        
        # Manually iterate with timeout to handle silence
        iterator = stream.__aiter__()
        start_time = asyncio.get_event_loop().time()
        
        try:
            while True:
                # Check remaining time
                elapsed = asyncio.get_event_loop().time() - start_time
                remaining = timeout - elapsed
                
                if remaining <= 0:
                    logging.info("Silence timeout reached (manual check)")
                    return False
                
                try:
                    # Wait for next event with dynamic timeout
                    event = await asyncio.wait_for(iterator.__anext__(), timeout=remaining)
                    
                    if event.type == agents.stt.SpeechEventType.FINAL_TRANSCRIPT:
                        text = event.alternatives[0].text
                        logging.info(f"User said: {text}")
                        if self.verify_answer(text):
                            return True
                        
                except asyncio.TimeoutError:
                    return False
                    
        except StopAsyncIteration:
            pass
        except Exception as e:
            logging.error(f"Error listening: {e}")
            
        finally:
            await stream.aclose()
            process_task.cancel()
            
        return False

    async def wait_for_user_track(self):
        # In production, use wait_for_participant and events
        # Quick poll for demo
        for _ in range(50): # wait 5s max
            for participant in self.ctx.room.participants.values():
                for track_pub in participant.tracks.values():
                    if track_pub.kind == rtc.TrackKind.KIND_AUDIO:
                        return track_pub.track
            await asyncio.sleep(0.1)
        return None

    def verify_answer(self, text: str) -> bool:
        # Fuzzy match for 'Sayara' or 'Car'
        text_clean = text.lower().strip()
        # Basic Arabic normalization (conceptually)
        return "car" in text_clean or "سيارة" in text_clean or "سياره" in text_clean

    async def play_audio(self, text: str):
        logging.info(f"Agent speaking: {text}")
        try:
            stream = self.tts.synthesize(text)
            await self.ctx.room.local_participant.publish_audio(stream)
            await stream.wait_for_complete()
        except Exception as e:
            logging.error(f"TTS Error: {e}")

async def entrypoint(ctx: JobContext):
    agent = SpeechTherapyAgent(ctx)
    await asyncio.Future() # Keep alive

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
